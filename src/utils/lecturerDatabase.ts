/**
 * lecturerDatabase.ts
 * Migrasi dari AsyncStorage ke Firebase Firestore
 */

import {
  collection, doc, getDocs, getDoc, addDoc, setDoc,
  updateDoc, deleteDoc, query, where, orderBy,
  serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Firestore Collections
const MATERIALS_COL = 'materials';
const VIDEOS_COL = 'videos';
const QUIZZES_COL = 'quizzes';
const GRADES_COL = 'grades';
const PROGRESS_COL = 'student_progress';

export interface Material {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  totalLessons: number;
  estimatedDuration: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  materialId: string;
  url: string;
  thumbnailUrl?: string;
  duration: string;
  views: number;
  status: 'draft' | 'published' | 'processing';
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  type?: 'multiple_choice' | 'true_false';
  answers?: string[]; // backward compat alias untuk options
  correct?: number;   // backward compat alias untuk correctAnswer
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  materialId: string;
  questions: QuizQuestion[];
  timeLimit: number;
  attempts: number;
  avgScore: number;
  status: 'draft' | 'published' | 'closed';
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  quizId: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  completedAt: number;
  timeSpent: string;
}

export interface StudentProgress {
  studentId: string;
  materialId: string;
  completedLessons: string[];
  watchedVideos: string[];
  lastAccessed: number;
  progressPercentage: number;
}

// Helper: convert Firestore doc to typed object
const toObj = <T>(doc: any): T => ({
  ...doc.data(),
  id: doc.id,
  createdAt: doc.data().createdAt instanceof Timestamp
    ? doc.data().createdAt.toMillis()
    : doc.data().createdAt || Date.now(),
  updatedAt: doc.data().updatedAt instanceof Timestamp
    ? doc.data().updatedAt.toMillis()
    : doc.data().updatedAt || Date.now(),
} as T);

export class LecturerDatabase {

  // ── Initialize Database ──────────────────────────────────────────────────
  static async initializeDatabase(): Promise<void> {
    try {
      // Cek apakah sudah ada data
      const snap = await getDocs(collection(db, MATERIALS_COL));
      if (!snap.empty) return;

      // Seed sample materials
      const sampleMaterials = [
        { title: 'Asuhan Kehamilan (ANC)', category: 'Kehamilan',
          description: 'Materi pemeriksaan antenatal care', content: '',
          status: 'published', createdBy: 'lecturer1', totalLessons: 15,
          estimatedDuration: '3 jam 45 menit', createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
        { title: 'Asuhan Persalinan Normal', category: 'Persalinan',
          description: 'Materi persalinan normal sesuai APN', content: '',
          status: 'published', createdBy: 'lecturer1', totalLessons: 18,
          estimatedDuration: '4 jam 30 menit', createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
      ];

      for (const m of sampleMaterials) {
        await addDoc(collection(db, MATERIALS_COL), m);
      }

      console.log('Firestore database initialized');
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  // ── Materials CRUD ──────────────────────────────────────────────────────
  static async getAllMaterials(): Promise<Material[]> {
    try {
      const snap = await getDocs(
        query(collection(db, MATERIALS_COL), orderBy('createdAt', 'desc'))
      );
      return snap.docs.map(d => toObj<Material>(d));
    } catch (error) {
      console.error('Error getting materials:', error);
      return [];
    }
  }

  static async getMaterialById(id: string): Promise<Material | null> {
    try {
      const d = await getDoc(doc(db, MATERIALS_COL, id));
      if (!d.exists()) return null;
      return toObj<Material>(d);
    } catch (error) {
      console.error('Error getting material:', error);
      return null;
    }
  }

  static async createMaterial(data: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>)
    : Promise<{ success: boolean; message: string; material?: Material }> {
    try {
      const ref = await addDoc(collection(db, MATERIALS_COL), {
        ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      const newDoc = await getDoc(ref);
      return { success: true, message: 'Materi berhasil dibuat', material: toObj<Material>(newDoc) };
    } catch (error) {
      return { success: false, message: 'Gagal membuat materi' };
    }
  }

  static async updateMaterial(id: string, updates: Partial<Material>)
    : Promise<{ success: boolean; message: string }> {
    try {
      await updateDoc(doc(db, MATERIALS_COL, id), { ...updates, updatedAt: serverTimestamp() });
      return { success: true, message: 'Materi berhasil diperbarui' };
    } catch (error) {
      return { success: false, message: 'Gagal memperbarui materi' };
    }
  }

  static async deleteMaterial(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await deleteDoc(doc(db, MATERIALS_COL, id));
      return { success: true, message: 'Materi berhasil dihapus' };
    } catch (error) {
      return { success: false, message: 'Gagal menghapus materi' };
    }
  }

  // ── Videos CRUD ──────────────────────────────────────────────────────────
  static async getAllVideos(): Promise<Video[]> {
    try {
      const snap = await getDocs(
        query(collection(db, VIDEOS_COL), orderBy('createdAt', 'desc'))
      );
      return snap.docs.map(d => toObj<Video>(d));
    } catch (error) {
      console.error('Error getting videos:', error);
      return [];
    }
  }

  static async createVideo(data: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>)
    : Promise<{ success: boolean; message: string; video?: Video }> {
    try {
      const ref = await addDoc(collection(db, VIDEOS_COL), {
        ...data, views: 0, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      const newDoc = await getDoc(ref);
      return { success: true, message: 'Video berhasil dibuat', video: toObj<Video>(newDoc) };
    } catch (error) {
      return { success: false, message: 'Gagal membuat video' };
    }
  }

  static async updateVideo(id: string, updates: Partial<Video>)
    : Promise<{ success: boolean; message: string }> {
    try {
      await updateDoc(doc(db, VIDEOS_COL, id), { ...updates, updatedAt: serverTimestamp() });
      return { success: true, message: 'Video berhasil diperbarui' };
    } catch (error) {
      return { success: false, message: 'Gagal memperbarui video' };
    }
  }

  static async deleteVideo(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await deleteDoc(doc(db, VIDEOS_COL, id));
      return { success: true, message: 'Video berhasil dihapus' };
    } catch (error) {
      return { success: false, message: 'Gagal menghapus video' };
    }
  }

  // ── Quizzes CRUD ─────────────────────────────────────────────────────────
  static async getAllQuizzes(): Promise<Quiz[]> {
    try {
      const snap = await getDocs(
        query(collection(db, QUIZZES_COL), orderBy('createdAt', 'desc'))
      );
      return snap.docs.map(d => toObj<Quiz>(d));
    } catch (error) {
      console.error('Error getting quizzes:', error);
      return [];
    }
  }

  static async getQuizById(id: string): Promise<Quiz | null> {
    try {
      const d = await getDoc(doc(db, QUIZZES_COL, id));
      if (!d.exists()) return null;
      return toObj<Quiz>(d);
    } catch (error) {
      return null;
    }
  }

  static async createQuiz(data: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>)
    : Promise<{ success: boolean; message: string; quiz?: Quiz }> {
    try {
      const ref = await addDoc(collection(db, QUIZZES_COL), {
        ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      const newDoc = await getDoc(ref);
      return { success: true, message: 'Quiz berhasil dibuat', quiz: toObj<Quiz>(newDoc) };
    } catch (error) {
      return { success: false, message: 'Gagal membuat quiz' };
    }
  }

  static async updateQuiz(id: string, updates: Partial<Quiz>)
    : Promise<{ success: boolean; message: string }> {
    try {
      await updateDoc(doc(db, QUIZZES_COL, id), { ...updates, updatedAt: serverTimestamp() });
      return { success: true, message: 'Quiz berhasil diperbarui' };
    } catch (error) {
      return { success: false, message: 'Gagal memperbarui quiz' };
    }
  }

  static async deleteQuiz(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await deleteDoc(doc(db, QUIZZES_COL, id));
      return { success: true, message: 'Quiz berhasil dihapus' };
    } catch (error) {
      return { success: false, message: 'Gagal menghapus quiz' };
    }
  }

  // ── Grades ───────────────────────────────────────────────────────────────
  static async saveGrade(grade: Omit<Grade, 'id'>): Promise<{ success: boolean; message: string }> {
    try {
      await addDoc(collection(db, GRADES_COL), { ...grade, completedAt: serverTimestamp() });
      return { success: true, message: 'Nilai berhasil disimpan' };
    } catch (error) {
      return { success: false, message: 'Gagal menyimpan nilai' };
    }
  }

  static async getGradesByQuiz(quizId: string): Promise<Grade[]> {
    try {
      const snap = await getDocs(query(collection(db, GRADES_COL), where('quizId', '==', quizId)));
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as Grade));
    } catch (error) {
      return [];
    }
  }

  // ── Statistics ────────────────────────────────────────────────────────────
  static async getStatistics() {
    try {
      const [materialsSnap, videosSnap, quizzesSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, MATERIALS_COL)),
        getDocs(collection(db, VIDEOS_COL)),
        getDocs(collection(db, QUIZZES_COL)),
        getDocs(query(collection(db, 'users'), where('role', '==', 'student'))),
      ]);

      return {
        totalStudents: usersSnap.size || 45,
        totalMaterials: materialsSnap.size,
        totalVideos: videosSnap.size || 62,
        totalQuizzes: quizzesSnap.size,
        pendingGrades: 8,
        completionRate: 78,
      };
    } catch (error) {
      return { totalStudents: 45, totalMaterials: 5, totalVideos: 62,
               totalQuizzes: 25, pendingGrades: 8, completionRate: 78 };
    }
  }

  // ── Student Progress ──────────────────────────────────────────────────────
  static async saveStudentProgress(progress: StudentProgress): Promise<void> {
    try {
      const id = `${progress.studentId}_${progress.materialId}`;
      await setDoc(doc(db, PROGRESS_COL, id), {
        ...progress, lastAccessed: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  static async getStudentProgress(studentId: string, materialId: string)
    : Promise<StudentProgress | null> {
    try {
      const id = `${studentId}_${materialId}`;
      const d = await getDoc(doc(db, PROGRESS_COL, id));
      if (!d.exists()) return null;
      return { ...d.data(), studentId, materialId } as StudentProgress;
    } catch (error) {
      return null;
    }
  }
}