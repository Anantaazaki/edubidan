/**
 * progressHelper.ts
 * Menyimpan progress belajar mahasiswa ke Firebase Firestore
 * Menggantikan AsyncStorage progress tracking
 */

import {
  doc, getDoc, setDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, auth } from '../config/firebase';

const PROGRESS_COL = 'learning_progress';
const STREAK_COL = 'learning_streaks';

export interface LearningProgress {
  userId: string;
  moduleId: string;
  completedLessons: string[];
  watchedVideos: string[];
  lastAccessed: number;
  progressPercentage: number;
}

export interface LearningStreak {
  userId: string;
  currentStreak: number;
  lastLearningDate: string;
  longestStreak: number;
}

const getCurrentUserId = (): string => auth.currentUser?.uid || 'anonymous';

export class ProgressHelper {

  // Load progress untuk satu modul
  static async loadProgress(moduleId: string): Promise<LearningProgress | null> {
    try {
      const userId = getCurrentUserId();
      const id = `${userId}_${moduleId}`;
      const d = await getDoc(doc(db, PROGRESS_COL, id));
      
      if (!d.exists()) return null;
      const data = d.data();
      return {
        ...data,
        lastAccessed: data.lastAccessed instanceof Timestamp
          ? data.lastAccessed.toMillis() : data.lastAccessed || Date.now(),
      } as LearningProgress;
    } catch (error) {
      // Fallback ke AsyncStorage jika offline
      try {
        const cached = await AsyncStorage.getItem(`@edubidan_progress_${moduleId}`);
        return cached ? JSON.parse(cached) : null;
      } catch {
        return null;
      }
    }
  }

  // Simpan progress modul
  static async saveProgress(
    moduleId: string,
    updates: { lessonId?: string; videoId?: string }
  ): Promise<LearningProgress> {
    const userId = getCurrentUserId();
    const id = `${userId}_${moduleId}`;

    try {
      // Load existing progress
      const existing = await this.loadProgress(moduleId);
      const completedLessons = existing?.completedLessons || [];
      const watchedVideos = existing?.watchedVideos || [];

      if (updates.lessonId && !completedLessons.includes(updates.lessonId)) {
        completedLessons.push(updates.lessonId);
      }
      if (updates.videoId && !watchedVideos.includes(updates.videoId)) {
        watchedVideos.push(updates.videoId);
      }

      const progress: LearningProgress = {
        userId, moduleId, completedLessons, watchedVideos,
        lastAccessed: Date.now(), progressPercentage: 0,
      };

      // Save ke Firestore
      await setDoc(doc(db, PROGRESS_COL, id), {
        ...progress, lastAccessed: serverTimestamp(),
      }, { merge: true });

      // Cache ke AsyncStorage untuk offline
      await AsyncStorage.setItem(
        `@edubidan_progress_${moduleId}`,
        JSON.stringify(progress)
      );

      return progress;
    } catch (error) {
      console.error('Error saving progress:', error);
      // Fallback ke AsyncStorage saja
      const cached = await AsyncStorage.getItem(`@edubidan_progress_${moduleId}`);
      const existing = cached ? JSON.parse(cached) : { completedLessons: [], watchedVideos: [] };
      
      if (updates.lessonId && !existing.completedLessons.includes(updates.lessonId)) {
        existing.completedLessons.push(updates.lessonId);
      }
      if (updates.videoId && !existing.watchedVideos.includes(updates.videoId)) {
        existing.watchedVideos.push(updates.videoId);
      }
      existing.lastAccessed = Date.now();
      
      await AsyncStorage.setItem(`@edubidan_progress_${moduleId}`, JSON.stringify(existing));
      return existing;
    }
  }

  // Load progress semua modul
  static async loadAllProgress(): Promise<{ [moduleId: string]: number }> {
    const result: { [moduleId: string]: number } = {};
    try {
      // Load dari AsyncStorage cache (lebih cepat)
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter(k => k.startsWith('@edubidan_progress_'));
      
      for (const key of progressKeys) {
        const moduleId = key.replace('@edubidan_progress_', '');
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const p = JSON.parse(cached);
          const completed = p.completedLessons?.length || 0;
          result[moduleId] = completed;
        }
      }
    } catch (error) {
      console.error('Error loading all progress:', error);
    }
    return result;
  }

  // Check & update learning streak
  static async checkLearningStreak(): Promise<number> {
    try {
      const userId = getCurrentUserId();
      const today = new Date().toDateString();
      const d = await getDoc(doc(db, STREAK_COL, userId));
      
      let streak: LearningStreak;
      
      if (!d.exists()) {
        streak = { userId, currentStreak: 1, lastLearningDate: today, longestStreak: 1 };
      } else {
        const data = d.data() as LearningStreak;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (data.lastLearningDate === today) {
          // Sudah belajar hari ini
          return data.currentStreak;
        } else if (data.lastLearningDate === yesterday.toDateString()) {
          // Hari berturut-turut
          streak = {
            ...data,
            currentStreak: data.currentStreak + 1,
            lastLearningDate: today,
            longestStreak: Math.max(data.longestStreak, data.currentStreak + 1),
          };
        } else {
          // Streak terputus
          streak = { ...data, currentStreak: 1, lastLearningDate: today };
        }
      }

      await setDoc(doc(db, STREAK_COL, userId), streak);
      return streak.currentStreak;
    } catch (error) {
      // Fallback ke AsyncStorage
      const today = new Date().toDateString();
      const streakKey = '@edubidan_learning_streak';
      const lastLearningKey = '@edubidan_last_learning';
      
      const stored = await AsyncStorage.getItem(streakKey);
      const lastLearning = await AsyncStorage.getItem(lastLearningKey);
      let currentStreak = stored ? parseInt(stored) : 0;
      
      if (lastLearning !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        currentStreak = lastLearning === yesterday.toDateString() ? currentStreak + 1 : 1;
        await AsyncStorage.setItem(streakKey, currentStreak.toString());
        await AsyncStorage.setItem(lastLearningKey, today);
      }
      return currentStreak;
    }
  }
}