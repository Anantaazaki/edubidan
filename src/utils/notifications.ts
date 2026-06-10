import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Notification Types ───────────────────────────────────────────────────────
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  isRead: boolean;
  actionType?: 'module_completed' | 'lesson_completed' | 'quiz_passed' | 'streak' | 'achievement';
  actionData?: any;
}

const NOTIFICATIONS_KEY = '@edubidan_notifications';

// ─── Notification Utils ───────────────────────────────────────────────────────
export class NotificationManager {
  static async getNotifications(): Promise<Notification[]> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        const notifications: Notification[] = JSON.parse(stored);
        return notifications.sort((a, b) => b.timestamp - a.timestamp);
      }
      return [];
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  static async addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: Date.now(),
        isRead: false,
      };
      
      notifications.unshift(newNotification);
      
      // Keep only last 50 notifications
      const trimmedNotifications = notifications.slice(0, 50);
      
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(trimmedNotifications));
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  }

  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  static async markAllAsRead(): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  static async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getNotifications();
      return notifications.filter(n => !n.isRead).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // ─── Congratulatory Notifications ─────────────────────────────────────────
  static async createLessonCompletedNotification(lessonTitle: string, moduleTitle: string, nextSteps?: string[]): Promise<void> {
    const suggestions = nextSteps || [
      'Lanjutkan ke pelajaran berikutnya',
      'Uji pemahaman dengan kuis',
      'Tinjau kembali materi yang sudah dipelajari'
    ];

    await this.addNotification({
      title: '🎉 Pelajaran Selesai!',
      message: `Selamat! Anda telah menyelesaikan "${lessonTitle}" dari modul ${moduleTitle}. ${suggestions[0]}.`,
      type: 'success',
      actionType: 'lesson_completed',
      actionData: { lessonTitle, moduleTitle, nextSteps: suggestions }
    });
  }

  static async createModuleCompletedNotification(moduleTitle: string, nextModules?: string[]): Promise<void> {
    const nextSteps = nextModules && nextModules.length > 0 
      ? `Lanjutkan dengan modul "${nextModules[0]}"` 
      : 'Jelajahi modul lainnya untuk memperdalam pengetahuan';

    await this.addNotification({
      title: '🏆 Modul Selesai!',
      message: `Luar biasa! Anda telah menyelesaikan modul "${moduleTitle}". ${nextSteps}.`,
      type: 'success',
      actionType: 'module_completed',
      actionData: { moduleTitle, nextModules }
    });
  }

  static async createQuizPassedNotification(moduleTitle: string, score: number, total: number): Promise<void> {
    const percentage = Math.round((score / total) * 100);
    let message = '';
    let emoji = '';

    if (percentage >= 90) {
      emoji = '🌟';
      message = `Sempurna! Anda mendapat skor ${score}/${total} (${percentage}%) pada kuis ${moduleTitle}. Pemahaman Anda sangat baik!`;
    } else if (percentage >= 80) {
      emoji = '🎯';
      message = `Bagus! Anda mendapat skor ${score}/${total} (${percentage}%) pada kuis ${moduleTitle}. Terus pertahankan!`;
    } else {
      emoji = '✅';
      message = `Selamat! Anda lulus kuis ${moduleTitle} dengan skor ${score}/${total} (${percentage}%). Tinjau kembali materi untuk pemahaman yang lebih baik.`;
    }

    await this.addNotification({
      title: `${emoji} Kuis Lulus!`,
      message,
      type: 'success',
      actionType: 'quiz_passed',
      actionData: { moduleTitle, score, total, percentage }
    });
  }

  static async createStreakNotification(days: number): Promise<void> {
    let message = '';
    let emoji = '';

    if (days === 7) {
      emoji = '🔥';
      message = `Hebat! Anda telah belajar selama 7 hari berturut-turut. Konsistensi adalah kunci kesuksesan!`;
    } else if (days === 30) {
      emoji = '💎';
      message = `Luar biasa! Anda telah belajar selama 30 hari berturut-turut. Anda adalah pembelajar yang luar biasa!`;
    } else if (days % 7 === 0) {
      emoji = '🔥';
      message = `Konsisten! Anda telah belajar selama ${days} hari berturut-turut. Terus pertahankan semangat belajar!`;
    } else {
      return; // Don't create notification for other days
    }

    await this.addNotification({
      title: `${emoji} Streak ${days} Hari!`,
      message,
      type: 'success',
      actionType: 'streak',
      actionData: { days }
    });
  }

  static async createAchievementNotification(achievement: string, description: string): Promise<void> {
    await this.addNotification({
      title: `🏅 Pencapaian Baru!`,
      message: `Anda mendapatkan pencapaian "${achievement}". ${description}`,
      type: 'success',
      actionType: 'achievement',
      actionData: { achievement, description }
    });
  }

  static async createReminderNotification(message: string): Promise<void> {
    await this.addNotification({
      title: '⏰ Pengingat Belajar',
      message,
      type: 'info'
    });
  }

  static async createWelcomeNotification(): Promise<void> {
    await this.addNotification({
      title: '👋 Selamat Datang!',
      message: 'Selamat datang di EduBidan! Mulai perjalanan belajar kebidanan Anda dan raih kompetensi terbaik.',
      type: 'info'
    });
  }

  // ─── Smart Next Steps Suggestions ─────────────────────────────────────────
  static getNextStepsForModule(moduleId: string, completedLessons: number, totalLessons: number): string[] {
    const progress = completedLessons / totalLessons;
    
    if (progress < 0.3) {
      return [
        'Lanjutkan menonton video pembelajaran',
        'Catat poin-poin penting dari materi',
        'Diskusikan dengan teman atau dosen jika ada yang kurang jelas'
      ];
    } else if (progress < 0.7) {
      return [
        'Tinjau kembali materi yang sudah dipelajari',
        'Lanjutkan ke pelajaran berikutnya',
        'Mulai berlatih dengan studi kasus'
      ];
    } else if (progress < 1.0) {
      return [
        'Selesaikan sisa pelajaran dalam modul ini',
        'Persiapkan diri untuk kuis evaluasi',
        'Hubungkan materi dengan pengalaman praktik'
      ];
    } else {
      return [
        'Ikuti kuis untuk menguji pemahaman',
        'Lanjutkan ke modul berikutnya',
        'Terapkan pengetahuan dalam simulasi kasus'
      ];
    }
  }

  static getRecommendedNextModules(currentModuleId: string): string[] {
    const moduleSequence: Record<string, string[]> = {
      '1': ['Asuhan Persalinan Normal', 'Manajemen Laktasi'], // After ANC
      '2': ['Asuhan Masa Nifas', 'Asuhan Bayi Baru Lahir'], // After Persalinan
      '3': ['Manajemen Laktasi', 'KB dan Kesehatan Reproduksi'], // After Nifas
      '4': ['Manajemen Laktasi', 'KB dan Kesehatan Reproduksi'], // After Bayi Baru Lahir
      '5': ['KB dan Kesehatan Reproduksi'], // After Laktasi
      '6': [] // KB is the last module
    };

    return moduleSequence[currentModuleId] || [];
  }
}

// ─── Export for easy use ──────────────────────────────────────────────────────
export default NotificationManager;