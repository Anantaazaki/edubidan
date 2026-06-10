/**
 * notificationHelper.ts
 * Migrasi dari AsyncStorage ke Firebase Firestore
 */

import {
  collection, doc, getDocs, addDoc, updateDoc,
  query, where, orderBy, limit, deleteDoc,
  serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'achievement';
  timestamp: number;
  isRead: boolean;
  userId?: string;
  actionData?: {
    moduleId?: string;
    videoId?: string;
    nextSteps?: string[];
  };
}

export interface Achievement {
  id: string;
  userId: string;
  type: 'video_completed' | 'module_completed' | 'quiz_completed' | 'streak_achieved';
  title: string;
  description: string;
  timestamp: number;
  progress?: { current: number; total: number };
}

const NOTIF_COL = 'notifications';
const ACHIEVE_COL = 'achievements';

// Helper: get current user ID
const getCurrentUserId = (): string => {
  return auth.currentUser?.uid || 'anonymous';
};

export class NotificationHelper {

  static async getAllNotifications(): Promise<Notification[]> {
    try {
      const userId = getCurrentUserId();
      const q = query(
        collection(db, NOTIF_COL),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({
        ...d.data(), id: d.id,
        timestamp: d.data().timestamp instanceof Timestamp
          ? d.data().timestamp.toMillis() : d.data().timestamp || Date.now(),
      } as Notification));
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  static async createNotification(
    data: Omit<Notification, 'id' | 'timestamp' | 'isRead'>
  ): Promise<void> {
    try {
      const userId = data.userId || getCurrentUserId();
      await addDoc(collection(db, NOTIF_COL), {
        ...data,
        userId,
        timestamp: Date.now(),
        isRead: false,
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, NOTIF_COL, notificationId), { isRead: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  static async markAllAsRead(): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const q = query(collection(db, NOTIF_COL),
        where('userId', '==', userId), where('isRead', '==', false));
      const snap = await getDocs(q);
      const updates = snap.docs.map(d => updateDoc(d.ref, { isRead: true }));
      await Promise.all(updates);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  static async getUnreadCount(): Promise<number> {
    try {
      const userId = getCurrentUserId();
      const q = query(collection(db, NOTIF_COL),
        where('userId', '==', userId), where('isRead', '==', false));
      const snap = await getDocs(q);
      return snap.size;
    } catch (error) {
      return 0;
    }
  }

  static async createVideoCompletionNotification(
    userId: string, videoTitle: string, moduleTitle: string, nextSteps: string[] = []
  ): Promise<void> {
    const messages = [
      `🎉 Selamat! Anda telah menyelesaikan video "${videoTitle}"`,
      `✨ Hebat! Video "${videoTitle}" berhasil diselesaikan`,
      `🌟 Luar biasa! Anda telah menonton video "${videoTitle}" sampai selesai`,
    ];
    await this.createNotification({
      title: 'Video Pembelajaran Selesai',
      message: messages[Math.floor(Math.random() * messages.length)],
      type: 'achievement', userId,
      actionData: {
        nextSteps: nextSteps.length > 0 ? nextSteps : [
          `Lanjutkan ke video berikutnya dalam modul "${moduleTitle}"`,
          'Kerjakan latihan soal terkait materi ini',
          'Review catatan pembelajaran untuk memperdalam pemahaman',
        ],
      },
    });
  }

  static async createModuleCompletionNotification(
    userId: string, moduleTitle: string, completionPercentage: number
  ): Promise<void> {
    const messages = [
      `🏆 Fantastis! Modul "${moduleTitle}" telah Anda selesaikan dengan ${completionPercentage}%`,
      `🎊 Selamat! Anda berhasil menuntaskan modul "${moduleTitle}"`,
    ];
    await this.createNotification({
      title: 'Modul Pembelajaran Selesai',
      message: messages[Math.floor(Math.random() * messages.length)],
      type: 'achievement', userId,
      actionData: {
        nextSteps: [
          'Ambil quiz untuk menguji pemahaman Anda',
          'Lanjutkan ke modul pembelajaran berikutnya',
          'Review materi yang sudah dipelajari',
        ],
      },
    });
  }

  static async createQuizCompletionNotification(
    userId: string, quizTitle: string, score: number, maxScore: number
  ): Promise<void> {
    const percentage = Math.round((score / maxScore) * 100);
    let message = '';
    let nextSteps: string[] = [];

    if (percentage >= 90) {
      message = `🏅 Sempurna! Anda meraih ${score}/${maxScore} (${percentage}%) pada "${quizTitle}"`;
      nextSteps = ['Lanjutkan ke materi berikutnya', 'Tantang diri dengan quiz tingkat lanjut'];
    } else if (percentage >= 75) {
      message = `🌟 Bagus! Skor ${score}/${maxScore} (${percentage}%) pada "${quizTitle}"`;
      nextSteps = ['Review materi yang kurang dipahami', 'Lanjutkan ke topik berikutnya'];
    } else if (percentage >= 60) {
      message = `👍 Cukup baik! Skor ${score}/${maxScore} (${percentage}%) pada "${quizTitle}"`;
      nextSteps = ['Pelajari kembali materi yang belum dikuasai', 'Latihan soal tambahan'];
    } else {
      message = `💪 Jangan menyerah! Skor ${score}/${maxScore} (${percentage}%) pada "${quizTitle}"`;
      nextSteps = ['Ulangi pembelajaran materi dari awal', 'Konsultasi dengan dosen'];
    }

    await this.createNotification({
      title: 'Quiz Selesai', message,
      type: percentage >= 75 ? 'achievement' : 'info',
      userId, actionData: { nextSteps },
    });
  }

  static async createStreakAchievementNotification(
    userId: string, streakDays: number
  ): Promise<void> {
    let message = '';
    if (streakDays === 7) {
      message = `🔥 Streak 1 minggu! Belajar konsisten ${streakDays} hari berturut-turut`;
    } else if (streakDays === 30) {
      message = `👑 Streak 1 bulan! Dedikasi yang menginspirasi selama ${streakDays} hari`;
    } else if (streakDays % 7 === 0) {
      message = `🚀 Streak ${streakDays} hari! Konsistensi luar biasa`;
    }
    if (message) {
      await this.createNotification({
        title: 'Pencapaian Streak', message, type: 'achievement', userId,
      });
    }
  }

  // Achievements
  static async getAllAchievements(): Promise<Achievement[]> {
    try {
      const userId = getCurrentUserId();
      const q = query(collection(db, ACHIEVE_COL),
        where('userId', '==', userId), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as Achievement));
    } catch (error) {
      return [];
    }
  }

  static async recordAchievement(data: Omit<Achievement, 'id' | 'timestamp'>): Promise<void> {
    try {
      await addDoc(collection(db, ACHIEVE_COL), { ...data, timestamp: Date.now() });
    } catch (error) {
      console.error('Error recording achievement:', error);
    }
  }

  static async saveNotifications(notifications: Notification[]): Promise<void> {
    // Backward compat - no-op karena sudah pakai Firestore
  }

  static async clearOldNotifications(daysOld: number = 30): Promise<void> {
    try {
      const cutoff = Date.now() - daysOld * 86400000;
      const userId = getCurrentUserId();
      const q = query(collection(db, NOTIF_COL),
        where('userId', '==', userId), where('timestamp', '<', cutoff));
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    } catch (error) {
      console.error('Error clearing old notifications:', error);
    }
  }
}