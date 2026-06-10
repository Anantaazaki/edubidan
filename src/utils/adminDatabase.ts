import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
const ADMIN_USERS_KEY = '@edubidan_admin_users';
const ADMIN_ACTIVITIES_KEY = '@edubidan_admin_activities';
const ADMIN_AUDIT_LOG_KEY = '@edubidan_admin_audit_log';
const ADMIN_NOTIFICATIONS_KEY = '@edubidan_admin_notifications';
const ADMIN_SETTINGS_KEY = '@edubidan_admin_settings';

// Interfaces
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password: string;
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
  ipAddress?: string;
  userAgent?: string;
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

export class AdminDatabase {
  // Initialize database with sample data
  static async initializeDatabase(): Promise<void> {
    try {
      // Check if already initialized
      const existingUsers = await AsyncStorage.getItem(ADMIN_USERS_KEY);
      if (existingUsers) return;

      // Sample admin users
      const adminUsers: AdminUser[] = [
        {
          id: 'admin1',
          name: 'Admin EduBidan',
          email: 'admin@edubidan.com',
          password: 'admin123',
          role: 'super_admin',
          isActive: true,
          permissions: ['all'],
          createdAt: Date.now() - 86400000 * 30,
          updatedAt: Date.now(),
          phone: '+62812-3456-7890',
        },
        {
          id: 'admin2',
          name: 'Moderator EduBidan',
          email: 'moderator@edubidan.com',
          password: 'mod123',
          role: 'moderator',
          isActive: true,
          permissions: ['content_management', 'user_management'],
          createdAt: Date.now() - 86400000 * 15,
          updatedAt: Date.now(),
          phone: '+62813-4567-8901',
        },
      ];

      // Sample system settings
      const systemSettings: SystemSettings = {
        appName: 'EduBidan',
        appLogo: 'logo.png',
        theme: 'auto',
        notificationSettings: {
          emailEnabled: true,
          pushEnabled: true,
          smsEnabled: false,
        },
        backupSettings: {
          autoBackup: true,
          backupFrequency: 'daily',
          retentionDays: 30,
        },
        version: '1.0.0',
        lastUpdated: Date.now(),
      };

      // Sample activities
      const activities: Activity[] = [
        {
          id: '1',
          userId: 'student1',
          userName: 'Ananta Ziaurohman',
          userType: 'student',
          action: 'login',
          description: 'Mahasiswa login ke aplikasi',
          timestamp: Date.now() - 3600000,
        },
        {
          id: '2',
          userId: 'lecturer1',
          userName: 'Dr. Siti Aminah',
          userType: 'lecturer',
          action: 'upload_material',
          description: 'Dosen mengupload materi baru: Asuhan Kehamilan',
          timestamp: Date.now() - 7200000,
        },
        {
          id: '3',
          userId: 'student2',
          userName: 'Sari Dewi',
          userType: 'student',
          action: 'complete_quiz',
          description: 'Mahasiswa menyelesaikan quiz Asuhan Persalinan dengan skor 85',
          timestamp: Date.now() - 10800000,
        },
      ];

      // Save to AsyncStorage
      await Promise.all([
        AsyncStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(adminUsers)),
        AsyncStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(systemSettings)),
        AsyncStorage.setItem(ADMIN_ACTIVITIES_KEY, JSON.stringify(activities)),
        AsyncStorage.setItem(ADMIN_AUDIT_LOG_KEY, JSON.stringify([])),
        AsyncStorage.setItem(ADMIN_NOTIFICATIONS_KEY, JSON.stringify([])),
      ]);

      console.log('Admin database initialized successfully');
    } catch (error) {
      console.error('Error initializing admin database:', error);
    }
  }

  // Dashboard Statistics
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // In a real app, this would query the actual database
      // For now, return sample statistics
      return {
        totalStudents: 1247,
        totalLecturers: 45,
        totalAdmins: 3,
        totalMaterials: 156,
        totalVideos: 324,
        totalQuizzes: 89,
        totalCategories: 8,
        activeStudents: 892,
        activeLecturers: 38,
        pendingApprovals: 12,
        totalViews: 15467,
        averageScore: 78.5,
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  // Admin Users Management
  static async getAllAdmins(): Promise<AdminUser[]> {
    try {
      const stored = await AsyncStorage.getItem(ADMIN_USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting admins:', error);
      return [];
    }
  }

  static async createAdmin(adminData: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string; admin?: AdminUser }> {
    try {
      const admins = await this.getAllAdmins();
      
      // Check if email already exists
      if (admins.some(admin => admin.email === adminData.email)) {
        return { success: false, message: 'Email sudah terdaftar' };
      }

      const newAdmin: AdminUser = {
        ...adminData,
        id: Date.now().toString(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      admins.push(newAdmin);
      await AsyncStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(admins));
      
      // Log activity
      await this.logActivity({
        userId: 'current_admin',
        userName: 'Current Admin',
        userType: 'admin',
        action: 'create_admin',
        description: `Admin baru dibuat: ${newAdmin.name}`,
        timestamp: Date.now(),
      });

      return { success: true, message: 'Admin berhasil dibuat', admin: newAdmin };
    } catch (error) {
      console.error('Error creating admin:', error);
      return { success: false, message: 'Gagal membuat admin' };
    }
  }

  static async updateAdmin(adminId: string, updates: Partial<AdminUser>): Promise<{ success: boolean; message: string }> {
    try {
      const admins = await this.getAllAdmins();
      const adminIndex = admins.findIndex(admin => admin.id === adminId);
      
      if (adminIndex === -1) {
        return { success: false, message: 'Admin tidak ditemukan' };
      }

      admins[adminIndex] = { ...admins[adminIndex], ...updates, updatedAt: Date.now() };
      await AsyncStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(admins));
      
      return { success: true, message: 'Admin berhasil diperbarui' };
    } catch (error) {
      console.error('Error updating admin:', error);
      return { success: false, message: 'Gagal memperbarui admin' };
    }
  }

  static async deleteAdmin(adminId: string): Promise<{ success: boolean; message: string }> {
    try {
      const admins = await this.getAllAdmins();
      const filteredAdmins = admins.filter(admin => admin.id !== adminId);
      
      if (filteredAdmins.length === admins.length) {
        return { success: false, message: 'Admin tidak ditemukan' };
      }

      await AsyncStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(filteredAdmins));
      return { success: true, message: 'Admin berhasil dihapus' };
    } catch (error) {
      console.error('Error deleting admin:', error);
      return { success: false, message: 'Gagal menghapus admin' };
    }
  }

  // Students Management (mock data for now)
  static async getAllStudents(): Promise<Student[]> {
    // In real app, this would fetch from actual student database
    const sampleStudents: Student[] = [
      {
        id: 'student1',
        name: 'Ananta Ziaurohman Az Zaki',
        email: 'ananta@student.com',
        nim: '2210631170007',
        phone: '+62812-1234-5678',
        isActive: true,
        enrolledModules: ['module1', 'module2', 'module3'],
        completedModules: ['module1'],
        totalQuizzes: 15,
        averageScore: 85.5,
        lastActive: Date.now() - 3600000,
        createdAt: Date.now() - 86400000 * 30,
      },
      {
        id: 'student2',
        name: 'Sari Dewi Pratiwi',
        email: 'sari@student.com',
        nim: '2210631170008',
        phone: '+62813-2345-6789',
        isActive: true,
        enrolledModules: ['module1', 'module2'],
        completedModules: ['module1', 'module2'],
        totalQuizzes: 12,
        averageScore: 78.3,
        lastActive: Date.now() - 7200000,
        createdAt: Date.now() - 86400000 * 25,
      },
    ];
    
    return sampleStudents;
  }

  // Lecturers Management (mock data for now)
  static async getAllLecturers(): Promise<Lecturer[]> {
    const sampleLecturers: Lecturer[] = [
      {
        id: 'lecturer1',
        name: 'Dr. Siti Aminah, M.Keb',
        email: 'dosen@edubidan.com',
        nip: '196805151992032001',
        phone: '+62814-3456-7890',
        specialization: 'Kebidanan Komunitas',
        isActive: true,
        totalMaterials: 25,
        totalVideos: 67,
        totalQuizzes: 18,
        totalStudents: 245,
        createdAt: Date.now() - 86400000 * 365,
        lastActive: Date.now() - 1800000,
      },
      {
        id: 'lecturer2',
        name: 'Dr. Ratna Dewi, M.Keb',
        email: 'ratna@edubidan.com',
        nip: '197203101995032002',
        phone: '+62815-4567-8901',
        specialization: 'Kebidanan Maternitas',
        isActive: true,
        totalMaterials: 18,
        totalVideos: 42,
        totalQuizzes: 12,
        totalStudents: 189,
        createdAt: Date.now() - 86400000 * 300,
        lastActive: Date.now() - 3600000,
      },
    ];
    
    return sampleLecturers;
  }

  // Content Management
  static async getPendingContent(): Promise<ContentItem[]> {
    const sampleContent: ContentItem[] = [
      {
        id: 'content1',
        title: 'Teknik Palpasi Leopold Terbaru',
        description: 'Materi pembelajaran tentang teknik palpasi Leopold dengan metode terbaru',
        type: 'material',
        category: 'ANC',
        createdBy: 'lecturer1',
        creatorName: 'Dr. Siti Aminah',
        status: 'pending',
        views: 0,
        likes: 0,
        createdAt: Date.now() - 7200000,
        updatedAt: Date.now() - 7200000,
      },
      {
        id: 'content2',
        title: 'Video Praktik Persalinan Normal',
        description: 'Video demonstrasi praktik persalinan normal di rumah sakit',
        type: 'video',
        category: 'Persalinan',
        createdBy: 'lecturer2',
        creatorName: 'Dr. Ratna Dewi',
        status: 'pending',
        views: 0,
        likes: 0,
        createdAt: Date.now() - 3600000,
        updatedAt: Date.now() - 3600000,
      },
    ];
    
    return sampleContent;
  }

  static async approveContent(contentId: string, adminId: string): Promise<{ success: boolean; message: string }> {
    // In real app, this would update the content status
    await this.logAudit({
      userId: adminId,
      userName: 'Admin',
      action: 'approve_content',
      resource: 'content',
      resourceId: contentId,
      timestamp: Date.now(),
    });
    
    return { success: true, message: 'Konten berhasil disetujui' };
  }

  static async rejectContent(contentId: string, adminId: string, reason: string): Promise<{ success: boolean; message: string }> {
    // In real app, this would update the content status and add rejection reason
    await this.logAudit({
      userId: adminId,
      userName: 'Admin',
      action: 'reject_content',
      resource: 'content',
      resourceId: contentId,
      newValue: { rejectionReason: reason },
      timestamp: Date.now(),
    });
    
    return { success: true, message: 'Konten berhasil ditolak' };
  }

  // Activity Management
  static async getActivities(filters?: { userType?: string; timeRange?: string }): Promise<Activity[]> {
    try {
      const stored = await AsyncStorage.getItem(ADMIN_ACTIVITIES_KEY);
      let activities: Activity[] = stored ? JSON.parse(stored) : [];
      
      // Apply filters
      if (filters?.userType) {
        activities = activities.filter(activity => activity.userType === filters.userType);
      }
      
      if (filters?.timeRange) {
        const now = Date.now();
        let timeFilter = now;
        
        switch (filters.timeRange) {
          case 'today':
            timeFilter = now - 86400000; // 24 hours
            break;
          case 'week':
            timeFilter = now - 604800000; // 7 days
            break;
          case 'month':
            timeFilter = now - 2592000000; // 30 days
            break;
        }
        
        activities = activities.filter(activity => activity.timestamp >= timeFilter);
      }
      
      return activities.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting activities:', error);
      return [];
    }
  }

  static async logActivity(activity: Omit<Activity, 'id'>): Promise<void> {
    try {
      const activities = await this.getActivities();
      const newActivity: Activity = {
        ...activity,
        id: Date.now().toString(),
      };
      
      activities.unshift(newActivity);
      
      // Keep only last 1000 activities
      if (activities.length > 1000) {
        activities.splice(1000);
      }
      
      await AsyncStorage.setItem(ADMIN_ACTIVITIES_KEY, JSON.stringify(activities));
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  // Audit Log Management
  static async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const stored = await AsyncStorage.getItem(ADMIN_AUDIT_LOG_KEY);
      const logs: AuditLog[] = stored ? JSON.parse(stored) : [];
      return logs.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting audit logs:', error);
      return [];
    }
  }

  static async logAudit(auditData: Omit<AuditLog, 'id'>): Promise<void> {
    try {
      const logs = await this.getAuditLogs();
      const newLog: AuditLog = {
        ...auditData,
        id: Date.now().toString(),
      };
      
      logs.unshift(newLog);
      
      // Keep only last 5000 audit logs
      if (logs.length > 5000) {
        logs.splice(5000);
      }
      
      await AsyncStorage.setItem(ADMIN_AUDIT_LOG_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('Error logging audit:', error);
    }
  }

  // System Settings
  static async getSystemSettings(): Promise<SystemSettings> {
    try {
      const stored = await AsyncStorage.getItem(ADMIN_SETTINGS_KEY);
      return stored ? JSON.parse(stored) : {
        appName: 'EduBidan',
        appLogo: 'logo.png',
        theme: 'auto',
        notificationSettings: {
          emailEnabled: true,
          pushEnabled: true,
          smsEnabled: false,
        },
        backupSettings: {
          autoBackup: true,
          backupFrequency: 'daily',
          retentionDays: 30,
        },
        version: '1.0.0',
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error('Error getting system settings:', error);
      throw error;
    }
  }

  static async updateSystemSettings(settings: Partial<SystemSettings>): Promise<{ success: boolean; message: string }> {
    try {
      const currentSettings = await this.getSystemSettings();
      const updatedSettings = { ...currentSettings, ...settings, lastUpdated: Date.now() };
      
      await AsyncStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(updatedSettings));
      return { success: true, message: 'Pengaturan berhasil diperbarui' };
    } catch (error) {
      console.error('Error updating system settings:', error);
      return { success: false, message: 'Gagal memperbarui pengaturan' };
    }
  }

  // Authentication
  static async authenticateAdmin(email: string, password: string): Promise<{ success: boolean; admin?: AdminUser; message: string }> {
    try {
      const admins = await this.getAllAdmins();
      const admin = admins.find(a => a.email === email && a.password === password && a.isActive);
      
      if (!admin) {
        return { success: false, message: 'Email atau password salah' };
      }

      // Update last login
      await this.updateAdmin(admin.id, { lastLogin: Date.now() });
      
      // Log login activity
      await this.logActivity({
        userId: admin.id,
        userName: admin.name,
        userType: 'admin',
        action: 'login',
        description: 'Admin login ke dashboard',
        timestamp: Date.now(),
      });

      return { success: true, admin, message: 'Login berhasil' };
    } catch (error) {
      console.error('Error authenticating admin:', error);
      return { success: false, message: 'Gagal melakukan login' };
    }
  }
}