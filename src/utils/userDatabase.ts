/**
 * userDatabase.ts
 * Migrasi dari AsyncStorage ke Firebase Authentication + Firestore
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebase';

const CURRENT_USER_KEY = '@edubidan_current_user';

export interface User {
  id: string;
  name: string;
  nim: string;
  email: string;
  password?: string;
  prodi: string;
  universitas: string;
  angkatan: string;
  role: 'student' | 'lecturer' | 'admin';
  phone?: string;
  alamat?: string;
  createdAt: number;
}

export class UserDatabase {

  // Register user baru
  static async registerUser(
    userData: Omit<User, 'id' | 'createdAt'>
  ): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Buat akun di Firebase Auth
      const credential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password || 'default123'
      );

      const newUser: User = {
        ...userData,
        id: credential.user.uid,
        createdAt: Date.now(),
      };

      // Simpan data user ke Firestore (non-blocking, tidak block register)
      const { password, ...userWithoutPassword } = newUser;
      setDoc(doc(db, 'users', credential.user.uid), {
        ...userWithoutPassword,
        createdAt: serverTimestamp(),
      }).catch(e => console.log('Firestore save failed (offline):', e));

      // Cache ke AsyncStorage
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

      return { success: true, message: 'Akun berhasil dibuat!', user: newUser };
    } catch (error: any) {
      console.error('Error registering user:', error);
      if (error.code === 'auth/email-already-in-use') {
        return { success: false, message: 'Email sudah terdaftar.' };
      }
      if (error.code === 'auth/configuration-not-found') {
        return { success: false, message: 'Firebase Authentication belum diaktifkan. Aktifkan Email/Password di Firebase Console.' };
      }
      if (error.code === 'auth/weak-password') {
        return { success: false, message: 'Password minimal 6 karakter.' };
      }
      return { success: false, message: `Gagal membuat akun: ${error.message}` };
    }
  }

  // Login user
  static async loginUser(
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Login via Firebase Auth
      const credential = await signInWithEmailAndPassword(auth, email, password);

      // Coba ambil data dari Firestore (jika online)
      let user: User | null = null;
      try {
        const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
        if (userDoc.exists()) {
          user = { ...userDoc.data() as User, id: credential.user.uid };
        }
      } catch (firestoreError) {
        console.log('Firestore offline, using default data');
      }

      // Jika tidak ada di Firestore, gunakan default
      if (!user) {
        user = this.getDefaultUser(email, password, credential.user.uid);
        if (!user) {
          user = {
            id: credential.user.uid,
            name: credential.user.email?.split('@')[0] || 'User',
            nim: '-',
            email: credential.user.email || email,
            prodi: 'Kebidanan',
            universitas: 'UNSIKA',
            angkatan: '2024',
            role: 'student',
            createdAt: Date.now(),
          };
        }
        // Try save to Firestore (non-blocking)
        const { password: _, ...userWithoutPassword } = user;
        setDoc(doc(db, 'users', credential.user.uid), userWithoutPassword)
          .catch(() => {});
      }

      // Cache ke AsyncStorage
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return { success: true, message: 'Login berhasil!', user };
    } catch (error: any) {
      console.error('Error logging in:', error);
      if (error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-credential') {
        return { success: false, message: 'Email atau password tidak valid.' };
      }
      if (error.code === 'auth/configuration-not-found') {
        return { success: false, message: 'Firebase Authentication belum diaktifkan. Aktifkan Email/Password di Firebase Console.' };
      }
      return { success: false, message: `Gagal login: ${error.message}` };
    }
  }

  // Default accounts helper
  private static getDefaultUser(email: string, password: string, uid: string): User | null {
    const defaults: Record<string, User> = {
      'admin@edubidan.com': {
        id: uid, name: 'Administrator EduBidan', nim: '0000000000000',
        email: 'admin@edubidan.com', prodi: 'Kebidanan',
        universitas: 'UNSIKA', angkatan: '2024',
        role: 'admin', createdAt: Date.now(),
      },
      'dosen@edubidan.com': {
        id: uid, name: 'Dr. Siti Aminah, M.Keb', nim: '196805151992032001',
        email: 'dosen@edubidan.com', prodi: 'Kebidanan',
        universitas: 'UNSIKA', angkatan: '2010',
        role: 'lecturer', createdAt: Date.now(),
      },
      'mahasiswa@edubidan.com': {
        id: uid, name: 'Mahasiswa EduBidan', nim: '2210631170001',
        email: 'mahasiswa@edubidan.com', prodi: 'Kebidanan',
        universitas: 'UNSIKA', angkatan: '2024',
        role: 'student', createdAt: Date.now(),
      },
    };
    return defaults[email] || null;
  }

  // Get current logged in user (dari cache dulu, lalu Firestore)
  static async getCurrentUser(): Promise<User | null> {
    try {
      // Coba dari cache AsyncStorage dulu (lebih cepat)
      const cached = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (cached) return JSON.parse(cached);

      // Fallback ke Firebase Auth current user
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) return null;

      const user = { ...userDoc.data(), id: firebaseUser.uid } as User;
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Logout
  static async logoutUser(): Promise<void> {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      await AsyncStorage.removeItem('@edubidan_user_data');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  // Update user data di Firestore
  static async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'users', userId), updates);
      // Update cache
      const cached = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (cached) {
        const user = JSON.parse(cached);
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ ...user, ...updates }));
      }
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  // Get all users (untuk admin)
  static async getAllUsers(): Promise<User[]> {
    try {
      const snap = await getDocs(collection(db, 'users'));
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as User));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  // Initialize default users di Firebase Auth + Firestore
  static async initializeDefaultUser(): Promise<void> {
    const defaults = [
      { email: 'admin@edubidan.com', password: 'admin123', name: 'Administrator EduBidan',
        nim: '0000000000000', role: 'admin' as const, prodi: 'Kebidanan',
        universitas: 'UNSIKA', angkatan: '2024' },
      { email: 'dosen@edubidan.com', password: 'lecturer123', name: 'Dr. Siti Aminah, M.Keb',
        nim: '196805151992032001', role: 'lecturer' as const, prodi: 'Kebidanan',
        universitas: 'UNSIKA', angkatan: '2010' },
      { email: 'mahasiswa@edubidan.com', password: 'password123', name: 'Mahasiswa EduBidan',
        nim: '2210631170001', role: 'student' as const, prodi: 'Kebidanan',
        universitas: 'UNSIKA', angkatan: '2024' },
    ];

    for (const user of defaults) {
      try {
        await createUserWithEmailAndPassword(auth, user.email, user.password);
      } catch (error: any) {
        // Sudah ada, skip
        if (error.code !== 'auth/email-already-in-use') {
          console.error('Error creating default user:', error);
        }
      }
    }
  }

  // Force reinitialize (untuk backward compat)
  static async forceReinitialize(): Promise<void> {
    await this.initializeDefaultUser();
  }

  // Get user stats
  static async getUserStats(): Promise<{ totalUsers: number; recentRegistrations: number }> {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recentRegistrations = snap.docs.filter(d => {
        const data = d.data();
        return data.createdAt > oneWeekAgo;
      }).length;
      return { totalUsers: snap.size, recentRegistrations };
    } catch (error) {
      return { totalUsers: 0, recentRegistrations: 0 };
    }
  }

  // Debug users
  static async debugUsers(): Promise<void> {
    const users = await this.getAllUsers();
    console.log('=== Firebase Users ===');
    users.forEach(u => console.log(`${u.email} - ${u.role}`));
  }

  // Update user role
  static async updateUserRole(email: string, newRole: 'student' | 'lecturer' | 'admin'): Promise<boolean> {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const snap = await getDocs(q);
      if (snap.empty) return false;
      await updateDoc(snap.docs[0].ref, { role: newRole });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Save users (backward compat)
  static async saveUsers(users: User[]): Promise<void> {
    for (const user of users) {
      if (user.id) {
        const { password, ...data } = user;
        await setDoc(doc(db, 'users', user.id), data, { merge: true });
      }
    }
  }

  // Email exists check
  static async emailExists(email: string): Promise<boolean> {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snap = await getDocs(q);
    return !snap.empty;
  }

  // NIM exists check
  static async nimExists(nim: string): Promise<boolean> {
    const q = query(collection(db, 'users'), where('nim', '==', nim));
    const snap = await getDocs(q);
    return !snap.empty;
  }
}