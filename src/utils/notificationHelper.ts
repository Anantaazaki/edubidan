import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = '@edubidan_notifications';
const ACHIEVEMENTS_KEY = '@edubidan_achievements';

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
  progress?: {
    current: number;
    total: number;
  };
}

export class NotificationHelper {
  
  static async getAllNotifications(): Promise<Notification[]> {
    try {
      const notificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      return notificationsJson ? JSON.parse(notificationsJson) : [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  static async saveNotifications(notifications: Notification[]): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  static async createNotification(notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): Promise<void> {
    try {
      const notification: Notification = {
        ...notificationData,
        id: Date.now().toString(),
        timestamp: Date.now(),
        isRead: false,
      };

      const notifications = await this.getAllNotifications();
      notifications.unshift(notification); // Add to beginning for latest first

      // Keep only last 50 notifications
      if (notifications.length > 50) {
        notifications.splice(50);
      }

      await this.saveNotifications(notifications);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  static async createVideoCompletionNotification(
    userId: string, 
    videoTitle: string, 
    moduleTitle: string,
    nextSteps: string[] = []
  ): Promise<void> {
    const congratulatoryMessages = [
      `🎉 Selamat! Anda telah menyelesaikan video "${videoTitle}"`,
      `✨ Hebat! Video "${videoTitle}" berhasil diselesaikan`,
      `🌟 Luar biasa! Anda telah menonton video "${videoTitle}" sampai selesai`,
      `👏 Bagus sekali! Video "${videoTitle}" telah Anda tuntaskan`,
    ];

    const randomMessage = congratulatoryMessages[Math.floor(Math.random() * congratulatoryMessages.length)];

    const defaultNextSteps = [
      `Lanjutkan ke video berikutnya dalam modul "${moduleTitle}"`,
      `Kerjakan latihan soal terkait materi ini`,
      `Review catatan pembelajaran untuk memperdalam pemahaman`,
      `Diskusikan materi dengan teman atau dosen`,
    ];

    await this.createNotification({
      title: 'Video Pembelajaran Selesai',
      message: randomMessage,
      type: 'achievement',
      userId,
      actionData: {
        nextSteps: nextSteps.length > 0 ? nextSteps : defaultNextSteps,
      },
    });
  }

  static async createModuleCompletionNotification(
    userId: string, 
    moduleTitle: string,
    completionPercentage: number
  ): Promise<void> {
    const congratulatoryMessages = [
      `🏆 Fantastis! Modul "${moduleTitle}" telah Anda selesaikan dengan ${completionPercentage}%`,
      `🎊 Selamat! Anda berhasil menuntaskan modul "${moduleTitle}"`,
      `⭐ Luar biasa! Modul "${moduleTitle}" sudah ${completionPercentage}% selesai`,
      `🎯 Hebat! Pencapaian ${completionPercentage}% pada modul "${moduleTitle}"`,
    ];

    const randomMessage = congratulatoryMessages[Math.floor(Math.random() * congratulatoryMessages.length)];

    const nextSteps = [
      'Ambil quiz untuk menguji pemahaman Anda',
      'Lanjutkan ke modul pembelajaran berikutnya',
      'Review materi yang sudah dipelajari',
      'Praktikkan ilmu yang telah diperoleh',
      'Bagikan pencapaian Anda dengan teman',
    ];

    await this.createNotification({
      title: 'Modul Pembelajaran Selesai',
      message: randomMessage,
      type: 'achievement',
      userId,
      actionData: {
        nextSteps,
      },
    });
  }

  static async createQuizCompletionNotification(
    userId: string, 
    quizTitle: string,
    score: number,
    maxScore: number
  ): Promise<void> {
    const percentage = Math.round((score / maxScore) * 100);
    let message = '';
    let nextSteps: string[] = [];

    if (percentage >= 90) {
      message = `🏅 Sempurna! Anda meraih ${score}/${maxScore} (${percentage}%) pada quiz "${quizTitle}"`;
      nextSteps = [
        'Lanjutkan ke materi pembelajaran berikutnya',
        'Bantu teman yang membutuhkan penjelasan',
        'Tantang diri dengan quiz tingkat lanjut',
        'Review sekali lagi untuk mempertahankan pemahaman',
      ];
    } else if (percentage >= 75) {
      message = `🌟 Bagus! Skor ${score}/${maxScore} (${percentage}%) pada quiz "${quizTitle}"`;
      nextSteps = [
        'Review materi yang kurang dipahami',
        'Lanjutkan ke topik pembelajaran berikutnya',
        'Diskusikan soal-soal sulit dengan dosen',
        'Latihan soal tambahan untuk memperkuat pemahaman',
      ];
    } else if (percentage >= 60) {
      message = `👍 Cukup baik! Skor ${score}/${maxScore} (${percentage}%) pada quiz "${quizTitle}"`;
      nextSteps = [
        'Pelajari kembali materi yang belum dikuasai',
        'Minta bantuan dosen untuk penjelasan tambahan',
        'Latihan soal serupa untuk meningkatkan pemahaman',
        'Bergabung dengan kelompok belajar',
      ];
    } else {
      message = `💪 Jangan menyerah! Skor ${score}/${maxScore} (${percentage}%) pada quiz "${quizTitle}"`;
      nextSteps = [
        'Ulangi pembelajaran materi dari awal',
        'Konsultasi dengan dosen untuk bimbingan',
        'Bergabung dengan kelompok belajar',
        'Coba kerjakan quiz lagi setelah belajar',
      ];
    }

    await this.createNotification({
      title: 'Quiz Selesai',
      message,
      type: percentage >= 75 ? 'achievement' : 'info',
      userId,
      actionData: {
        nextSteps,
      },
    });
  }

  static async createStreakAchievementNotification(
    userId: string, 
    streakDays: number
  ): Promise<void> {
    let message = '';
    let nextSteps: string[] = [];

    if (streakDays === 7) {
      message = `🔥 Streak 1 minggu! Anda telah belajar konsisten selama ${streakDays} hari berturut-turut`;
      nextSteps = [
        'Pertahankan konsistensi belajar',
        'Tantang diri untuk mencapai streak 14 hari',
        'Bagikan pencapaian dengan teman',
      ];
    } else if (streakDays === 14) {
      message = `🚀 Streak 2 minggu! Konsistensi luar biasa selama ${streakDays} hari`;
      nextSteps = [
        'Terus pertahankan momentum belajar',
        'Target streak 1 bulan penuh',
        'Jadi inspirasi bagi teman-teman',
      ];
    } else if (streakDays === 30) {
      message = `👑 Streak 1 bulan! Dedikasi yang menginspirasi selama ${streakDays} hari`;
      nextSteps = [
        'Anda adalah contoh konsistensi yang baik',
        'Bagikan tips belajar dengan teman',
        'Tantang diri untuk streak yang lebih panjang',
      ];
    } else if (streakDays % 30 === 0) {
      message = `🏆 Streak ${streakDays} hari! Pencapaian yang luar biasa`;
      nextSteps = [
        'Anda telah membuktikan komitmen yang kuat',
        'Menjadi mentor bagi teman-teman',
        'Terus pertahankan kebiasaan belajar yang baik',
      ];
    }

    if (message) {
      await this.createNotification({
        title: 'Pencapaian Streak',
        message,
        type: 'achievement',
        userId,
        actionData: {
          nextSteps,
        },
      });
    }
  }

  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const notificationIndex = notifications.findIndex(n => n.id === notificationId);
      
      if (notificationIndex !== -1) {
        notifications[notificationIndex].isRead = true;
        await this.saveNotifications(notifications);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  static async markAllAsRead(): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
      await this.saveNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  static async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getAllNotifications();
      return notifications.filter(n => !n.isRead).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  static async clearOldNotifications(daysOld: number = 30): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
      const recentNotifications = notifications.filter(n => n.timestamp > cutoffTime);
      await this.saveNotifications(recentNotifications);
    } catch (error) {
      console.error('Error clearing old notifications:', error);
    }
  }

  // Achievement tracking
  static async getAllAchievements(): Promise<Achievement[]> {
    try {
      const achievementsJson = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
      return achievementsJson ? JSON.parse(achievementsJson) : [];
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }

  static async saveAchievements(achievements: Achievement[]): Promise<void> {
    try {
      await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  }

  static async recordAchievement(achievementData: Omit<Achievement, 'id' | 'timestamp'>): Promise<void> {
    try {
      const achievement: Achievement = {
        ...achievementData,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };

      const achievements = await this.getAllAchievements();
      achievements.unshift(achievement);
      await this.saveAchievements(achievements);
    } catch (error) {
      console.error('Error recording achievement:', error);
    }
  }
}