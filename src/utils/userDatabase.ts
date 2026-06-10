import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = '@edubidan_users';
const CURRENT_USER_KEY = '@edubidan_current_user';

export interface User {
  id: string;
  name: string;
  nim: string;
  email: string;
  password: string;
  prodi: string;
  universitas: string;
  angkatan: string;
  role: 'student' | 'lecturer' | 'admin'; // Add admin role
  phone?: string;
  alamat?: string;
  createdAt: number;
}

export class UserDatabase {
  // Get all registered users
  static async getAllUsers(): Promise<User[]> {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  // Save users to storage
  static async saveUsers(users: User[]): Promise<void> {
    try {
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
      throw error;
    }
  }

  // Check if email already exists
  static async emailExists(email: string): Promise<boolean> {
    const users = await this.getAllUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // Check if NIM already exists
  static async nimExists(nim: string): Promise<boolean> {
    const users = await this.getAllUsers();
    return users.some(user => user.nim === nim);
  }

  // Register new user
  static async registerUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Check if email already exists
      if (await this.emailExists(userData.email)) {
        return { success: false, message: 'Email sudah terdaftar. Silakan gunakan email lain.' };
      }

      // Check if NIM already exists
      if (await this.nimExists(userData.nim)) {
        return { success: false, message: 'NIM sudah terdaftar. Silakan periksa kembali NIM Anda.' };
      }

      // Create new user
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        createdAt: Date.now(),
      };

      // Get existing users and add new user
      const users = await this.getAllUsers();
      users.push(newUser);
      
      // Save to storage
      await this.saveUsers(users);

      console.log('User registered successfully:', newUser.email);
      return { success: true, message: 'Akun berhasil dibuat!', user: newUser };
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, message: 'Terjadi kesalahan saat membuat akun. Silakan coba lagi.' };
    }
  }

  // Login user
  static async loginUser(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const users = await this.getAllUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

      if (user) {
        // Save current user session
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        console.log('User logged in successfully:', user.email);
        return { success: true, message: 'Login berhasil!', user };
      } else {
        return { success: false, message: 'Email atau password tidak valid.' };
      }
    } catch (error) {
      console.error('Error logging in user:', error);
      return { success: false, message: 'Terjadi kesalahan saat login. Silakan coba lagi.' };
    }
  }

  // Get current logged in user
  static async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Logout user
  static async logoutUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out user:', error);
    }
  }

  // Initialize with default admin user if no users exist
  static async initializeDefaultUser(): Promise<void> {
    try {
      const users = await this.getAllUsers();
      
      // Always recreate default users to ensure they have correct structure
      const defaultAdmin: User = {
        id: 'admin-001',
        name: 'Administrator EduBidan',
        nim: '0000000000000',
        email: 'admin@edubidan.com',
        password: 'admin123',
        prodi: 'Kebidanan',
        universitas: 'Universitas Singaperbangsa Karawang',
        angkatan: '2024',
        role: 'admin',
        createdAt: Date.now(),
      };

      const defaultStudent: User = {
        id: 'student-001',
        name: 'Mahasiswa EduBidan',
        nim: '2210631170001',
        email: 'mahasiswa@edubidan.com',
        password: 'password123',
        prodi: 'Kebidanan',
        universitas: 'Universitas Singaperbangsa Karawang',
        angkatan: '2024',
        role: 'student',
        createdAt: Date.now(),
      };

      const defaultLecturer: User = {
        id: 'lecturer-001',
        name: 'Dr. Siti Aminah, M.Keb',
        nim: '196805151992032001', // NIP for lecturer
        email: 'dosen@edubidan.com',
        password: 'lecturer123',
        prodi: 'Kebidanan',
        universitas: 'Universitas Singaperbangsa Karawang',
        angkatan: '2010',
        role: 'lecturer',
        createdAt: Date.now(),
      };

      // Check if default users already exist
      const adminExists = users.some(u => u.email === 'admin@edubidan.com');
      const lecturerExists = users.some(u => u.email === 'dosen@edubidan.com');
      const studentExists = users.some(u => u.email === 'mahasiswa@edubidan.com');

      let updatedUsers = [...users];

      if (!adminExists) {
        updatedUsers.push(defaultAdmin);
        console.log('Default admin user created');
      } else {
        // Ensure existing admin has correct role
        updatedUsers = updatedUsers.map(u =>
          u.email === 'admin@edubidan.com' ? { ...u, role: 'admin' as const, password: 'admin123' } : u
        );
      }

      if (!lecturerExists) {
        updatedUsers.push(defaultLecturer);
        console.log('Default lecturer user created');
      }

      if (!studentExists) {
        updatedUsers.push(defaultStudent);
        console.log('Default student user created');
      }

      // Update existing users to have role if they don't have it
      updatedUsers = updatedUsers.map(user => ({
        ...user,
        role: user.role || 'student'
      }));
      
      await this.saveUsers(updatedUsers);
      console.log('Users initialized with roles');
    } catch (error) {
      console.error('Error initializing default user:', error);
    }
  }

  // Get user statistics
  static async getUserStats(): Promise<{ totalUsers: number; recentRegistrations: number }> {
    try {
      const users = await this.getAllUsers();
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recentRegistrations = users.filter(user => user.createdAt > oneWeekAgo).length;
      
      return {
        totalUsers: users.length,
        recentRegistrations,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { totalUsers: 0, recentRegistrations: 0 };
    }
  }

  // Debug function to check all users
  static async debugUsers(): Promise<void> {
    try {
      const users = await this.getAllUsers();
      console.log('=== DEBUG: All Users ===');
      users.forEach(user => {
        console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role || 'NO_ROLE'}`);
      });
      console.log('========================');
    } catch (error) {
      console.error('Error debugging users:', error);
    }
  }

  // Force reset all users and reinitialize (call this if login fails)
  static async forceReinitialize(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USERS_KEY);
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      await this.initializeDefaultUser();
      console.log('Users force reinitialized');
    } catch (error) {
      console.error('Error force reinitializing:', error);
    }
  }

  // Update user role (for admin purposes)
  static async updateUserRole(email: string, newRole: 'student' | 'lecturer' | 'admin'): Promise<boolean> {
    try {
      const users = await this.getAllUsers();
      const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (userIndex !== -1) {
        users[userIndex].role = newRole;
        await this.saveUsers(users);
        console.log(`User ${email} role updated to ${newRole}`);
        return true;
      }
      
      console.log(`User ${email} not found`);
      return false;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }
}