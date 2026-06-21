/**
 * adminDatabase.ts
 * Migrasi dari AsyncStorage ke Firebase Firestore
 */

import {
  collection, doc, getDocs, getDoc, addDoc, setDoc,
  updateDoc, deleteDoc, query, where, orderBy,
  serverTimestamp, Timestamp, limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Firestore Collections
const ADMIN_USERS_COL = 'admin_users';
const ACTIVITIES_COL = 'activities';
const AUDIT_LOG_COL = 'audit_logs';
const SETTINGS_COL = 'settings';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'super_admin' | 'admin' | 'moderator';
  avatar?: string;
  phone?: string;
  isActive: boolean;
  permissions: string[];
  createdAt: number;
  updatedAt: number;
  lastLogin?: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  nim: string;
  phone: string;
  avatar?: string;
  isActive: boolean;
  enrolledModules: string[];
  completedModules: string[];
  totalQuizzes: number;
  averageScore: number;
  lastActive: number;
  createdAt: number;
}

export interface Lecturer {
  id: string;
  name: string;
  email: string;
  nip: string;
  phone: string;
  specialization: string;
  avatar?: string;
  isActive: boolean;
  totalMaterials: number;
  totalVideos: number;
  totalQuizzes: number;
  totalStudents: number;
  createdAt: number;
  lastActive: number;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'material' | 'video' | 'quiz';
  category: string;
  createdBy: string;
  creatorName: string;
  status: 'pending' | 'approved' | 'rejected' | 'published' | 'draft';
  approvedBy?: string;
  approvedAt?: number;
  rejectionReason?: string;
  views: number;
  likes: number;
  createdAt: number;
  updatedAt: number;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userType: 'student' | 'lecturer' | 'admin';
  action: string;
  description: string;
  timestamp: number;
  metadata?: any;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: number;
}

export interface SystemSettings {
  appName: string;
  appLogo: string;
  theme: 'light' | 'dark' | 'auto';
  notificationSettings: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
  };
  backupSettings: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    retentionDays: number;
  };
  version: string;
  lastUpdated: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalLecturers: number;
  totalAdmins: number;
  totalMaterials: number;
  totalVideos: number;
  totalQuizzes: number;
  totalCategories: number;
  activeStudents: number;
  activeLecturers: number;
  pendingApprovals: number;
  totalViews: number;
  averageScore: number;
}

const toObj = <T>(d: any): T => ({
  ...d.data(), id: d.id,
  createdAt: d.data().createdAt instanceof Timestamp ? d.data().createdAt.toMillis() : d.data().createdAt || Date.now(),
  updatedAt: d.data().updatedAt instanceof Timestamp ? d.data().updatedAt.toMillis() : d.data().updatedAt || Date.now(),
} as T);

export class AdminDatabase {

  static async initializeDatabase(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, ADMIN_USERS_COL));
      if (!snap.empty) return;

      // Create default admin
      await setDoc(doc(db, ADMIN_USERS_COL, 'admin1'), {
        name: 'Admin EduBidan', email: 'admin@edubidan.com',
        role: 'super_admin', isActive: true, permissions: ['all'],
        phone: '+62812-3456-7890',
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });

      // Create default settings
      await setDoc(doc(db, SETTINGS_COL, 'system'), {
        appName: 'EduBidan', appLogo: 'logo.png', theme: 'auto',
        notificationSettings: { emailEnabled: true, pushEnabled: true, smsEnabled: false },
        backupSettings: { autoBackup: true, backupFrequency: 'daily', retentionDays: 30 },
        version: '1.0.0', lastUpdated: serverTimestamp(),
      });

      console.log('Admin database initialized on Firestore');
    } catch (error) {
      console.error('Error initializing admin database:', error);
    }
  }

  // ── Dashboard Stats ───────────────────────────────────────────────────────
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [studentsSnap, lecturersSnap, adminsSnap, materialsSnap, videosSnap, quizzesSnap] =
        await Promise.all([
          getDocs(query(collection(db, 'users'), where('role', '==', 'student'))),
          getDocs(query(collection(db, 'users'), where('role', '==', 'lecturer'))),
          getDocs(query(collection(db, 'users'), where('role', '==', 'admin'))),
          getDocs(collection(db, 'materials')),
          getDocs(collection(db, 'videos')),
          getDocs(collection(db, 'quizzes')),
        ]);

      return {
        totalStudents: studentsSnap.size,
        totalLecturers: lecturersSnap.size,
        totalAdmins: adminsSnap.size,
        totalMaterials: materialsSnap.size,
        totalVideos: videosSnap.size,
        totalQuizzes: quizzesSnap.size,
        totalCategories: 8,
        activeStudents: studentsSnap.size,
        activeLecturers: lecturersSnap.size,
        pendingApprovals: 0,
        totalViews: 0,
        averageScore: 0,
      };
    } catch (error) {
      return {
        totalStudents: 0, totalLecturers: 0, totalAdmins: 0,
        totalMaterials: 0, totalVideos: 0, totalQuizzes: 0,
        totalCategories: 0, activeStudents: 0, activeLecturers: 0,
        pendingApprovals: 0, totalViews: 0, averageScore: 0,
      };
    }
  }

  // ── Admin Users ───────────────────────────────────────────────────────────
  static async getAllAdmins(): Promise<AdminUser[]> {
    try {
      const snap = await getDocs(collection(db, ADMIN_USERS_COL));
      return snap.docs.map(d => toObj<AdminUser>(d));
    } catch (error) {
      return [];
    }
  }

  static async createAdmin(data: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>)
    : Promise<{ success: boolean; message: string; admin?: AdminUser }> {
    try {
      const q = query(collection(db, ADMIN_USERS_COL), where('email', '==', data.email));
      const existing = await getDocs(q);
      if (!existing.empty) return { success: false, message: 'Email sudah terdaftar' };

      const ref = await addDoc(collection(db, ADMIN_USERS_COL), {
        ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      await this.logActivity({ userId: 'system', userName: 'System',
        userType: 'admin', action: 'create_admin', description: `Admin baru: ${data.name}`,
        timestamp: Date.now() });
      const newDoc = await getDoc(ref);
      return { success: true, message: 'Admin berhasil dibuat', admin: toObj<AdminUser>(newDoc) };
    } catch (error) {
      return { success: false, message: 'Gagal membuat admin' };
    }
  }

  static async updateAdmin(id: string, updates: Partial<AdminUser>)
    : Promise<{ success: boolean; message: string }> {
    try {
      await updateDoc(doc(db, ADMIN_USERS_COL, id), { ...updates, updatedAt: serverTimestamp() });
      return { success: true, message: 'Admin berhasil diperbarui' };
    } catch (error) {
      return { success: false, message: 'Gagal memperbarui admin' };
    }
  }

  static async deleteAdmin(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await deleteDoc(doc(db, ADMIN_USERS_COL, id));
      return { success: true, message: 'Admin berhasil dihapus' };
    } catch (error) {
      return { success: false, message: 'Gagal menghapus admin' };
    }
  }

  // ── Students & Lecturers (from users collection) ──────────────────────────
  static async getAllStudents(): Promise<Student[]> {
    try {
      const [usersSnap, gradesSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('role', '==', 'student'))),
        getDocs(collection(db, 'grades')),
      ]);

      return usersSnap.docs.map(d => {
        const uid = d.id;
        const userGrades = gradesSnap.docs
          .map(g => g.data())
          .filter(g => g.studentId === uid);
        const totalQuizzes = userGrades.length;
        const avgScore = totalQuizzes > 0
          ? userGrades.reduce((sum, g) => sum + (g.score || 0), 0) / totalQuizzes
          : 0;
        return {
          id: uid,
          name: d.data().name,
          email: d.data().email,
          nim: d.data().nim || '-',
          phone: d.data().phone || '-',
          isActive: true,
          enrolledModules: [],
          completedModules: [],
          totalQuizzes,
          averageScore: Math.round(avgScore * 10) / 10,
          lastActive: Date.now(),
          createdAt: d.data().createdAt || Date.now(),
        } as Student;
      });
    } catch (error) {
      return [];
    }
  }

  static async getAllLecturers(): Promise<Lecturer[]> {
    try {
      const [usersSnap, materialsSnap, videosSnap, studentsSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('role', '==', 'lecturer'))),
        getDocs(collection(db, 'materials')),
        getDocs(collection(db, 'videos')),
        getDocs(query(collection(db, 'users'), where('role', '==', 'student'))),
      ]);

      return usersSnap.docs.map(d => {
        const uid = d.id;
        const totalMaterials = materialsSnap.docs.filter(m => m.data().createdBy === uid).length;
        const totalVideos = videosSnap.docs.filter(v => v.data().createdBy === uid).length;
        return {
          id: uid,
          name: d.data().name,
          email: d.data().email,
          nip: d.data().nim || '-',
          phone: d.data().phone || '-',
          specialization: d.data().prodi || 'Kebidanan',
          isActive: true,
          totalMaterials,
          totalVideos,
          totalQuizzes: 0,
          totalStudents: studentsSnap.size,
          createdAt: d.data().createdAt || Date.now(),
          lastActive: Date.now(),
        } as Lecturer;
      });
    } catch (error) {
      return [];
    }
  }

  // ── Content Approval ──────────────────────────────────────────────────────
  static async getPendingContent(): Promise<ContentItem[]> {
    try {
      const snap = await getDocs(
        query(collection(db, 'materials'), where('status', '==', 'pending'))
      );
      return snap.docs.map(d => toObj<ContentItem>(d));
    } catch (error) {
      return [];
    }
  }

  static async approveContent(contentId: string, adminId: string)
    : Promise<{ success: boolean; message: string }> {
    try {
      await updateDoc(doc(db, 'materials', contentId), {
        status: 'published', approvedBy: adminId, approvedAt: serverTimestamp(),
      });
      await this.logAudit({ userId: adminId, userName: 'Admin',
        action: 'approve_content', resource: 'content', resourceId: contentId,
        timestamp: Date.now() });
      return { success: true, message: 'Konten berhasil disetujui' };
    } catch (error) {
      return { success: false, message: 'Gagal menyetujui konten' };
    }
  }

  static async rejectContent(contentId: string, adminId: string, reason: string)
    : Promise<{ success: boolean; message: string }> {
    try {
      await updateDoc(doc(db, 'materials', contentId), {
        status: 'rejected', rejectionReason: reason,
      });
      await this.logAudit({ userId: adminId, userName: 'Admin',
        action: 'reject_content', resource: 'content', resourceId: contentId,
        newValue: { rejectionReason: reason }, timestamp: Date.now() });
      return { success: true, message: 'Konten berhasil ditolak' };
    } catch (error) {
      return { success: false, message: 'Gagal menolak konten' };
    }
  }

  // ── Activities ────────────────────────────────────────────────────────────
  static async getActivities(filters?: { userType?: string; timeRange?: string })
    : Promise<Activity[]> {
    try {
      let q = query(collection(db, ACTIVITIES_COL), orderBy('timestamp', 'desc'), limit(100));
      const snap = await getDocs(q);
      let activities = snap.docs.map(d => ({ ...d.data(), id: d.id } as Activity));

      if (filters?.userType) {
        activities = activities.filter(a => a.userType === filters.userType);
      }
      if (filters?.timeRange) {
        const now = Date.now();
        const cutoff = { today: now - 86400000, week: now - 604800000, month: now - 2592000000 };
        const t = cutoff[filters.timeRange as keyof typeof cutoff] || 0;
        activities = activities.filter(a => a.timestamp >= t);
      }
      return activities;
    } catch (error) {
      return [];
    }
  }

  static async logActivity(activity: Omit<Activity, 'id'>): Promise<void> {
    try {
      await addDoc(collection(db, ACTIVITIES_COL), { ...activity, timestamp: Date.now() });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  // ── Audit Log ─────────────────────────────────────────────────────────────
  static async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const snap = await getDocs(
        query(collection(db, AUDIT_LOG_COL), orderBy('timestamp', 'desc'), limit(500))
      );
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as AuditLog));
    } catch (error) {
      return [];
    }
  }

  static async logAudit(audit: Omit<AuditLog, 'id'>): Promise<void> {
    try {
      await addDoc(collection(db, AUDIT_LOG_COL), { ...audit, timestamp: Date.now() });
    } catch (error) {
      console.error('Error logging audit:', error);
    }
  }

  // ── System Settings ───────────────────────────────────────────────────────
  static async getSystemSettings(): Promise<SystemSettings> {
    try {
      const d = await getDoc(doc(db, SETTINGS_COL, 'system'));
      if (!d.exists()) {
        return {
          appName: 'EduBidan', appLogo: 'logo.png', theme: 'auto',
          notificationSettings: { emailEnabled: true, pushEnabled: true, smsEnabled: false },
          backupSettings: { autoBackup: true, backupFrequency: 'daily', retentionDays: 30 },
          version: '1.0.0', lastUpdated: Date.now(),
        };
      }
      const data = d.data();
      return {
        ...data,
        lastUpdated: data.lastUpdated instanceof Timestamp ? data.lastUpdated.toMillis() : Date.now(),
      } as SystemSettings;
    } catch (error) {
      throw error;
    }
  }

  static async updateSystemSettings(settings: Partial<SystemSettings>)
    : Promise<{ success: boolean; message: string }> {
    try {
      await setDoc(doc(db, SETTINGS_COL, 'system'),
        { ...settings, lastUpdated: serverTimestamp() }, { merge: true });
      return { success: true, message: 'Pengaturan berhasil diperbarui' };
    } catch (error) {
      return { success: false, message: 'Gagal memperbarui pengaturan' };
    }
  }

  // ── Authentication (backward compat) ──────────────────────────────────────
  static async authenticateAdmin(email: string, password: string)
    : Promise<{ success: boolean; admin?: AdminUser; message: string }> {
    try {
      const q = query(collection(db, ADMIN_USERS_COL), where('email', '==', email));
      const snap = await getDocs(q);
      if (snap.empty) return { success: false, message: 'Admin tidak ditemukan' };

      const admin = toObj<AdminUser>(snap.docs[0]);
      if (!admin.isActive) return { success: false, message: 'Akun tidak aktif' };

      await updateDoc(snap.docs[0].ref, { lastLogin: serverTimestamp() });
      await this.logActivity({ userId: admin.id, userName: admin.name,
        userType: 'admin', action: 'login', description: 'Admin login ke dashboard',
        timestamp: Date.now() });
      return { success: true, admin, message: 'Login berhasil' };
    } catch (error) {
      return { success: false, message: 'Gagal melakukan login' };
    }
  }
}