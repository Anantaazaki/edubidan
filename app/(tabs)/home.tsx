import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { MODULES } from '../../src/constants/modules';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressHelper } from '../../src/utils/progressHelper';
import { UserDatabase } from '../../src/utils/userDatabase';

// Notification interface
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  isRead: boolean;
}

const NOTIFICATIONS_KEY = '@edubidan_notifications';

const USER = {
  name: 'Ananta Ziaurohman Az Zaki',
  nim: '2210631170007',
  prodi: 'Mahasiswa Kebidanan',
  universitas: 'UNSIKA',
  semester: '5',
  joinDate: 'September 2022',
};

export default function HomeScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme, loaded } = useTheme();
  
  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Progress state
  const [moduleProgress, setModuleProgress] = useState<{[key: string]: number}>({});

  // User data state - load dari database/storage
  const [currentUser, setCurrentUser] = useState({
    name: '',
    nim: '',
    prodi: '',
    universitas: '',
    email: '',
  });

  // Real-time greeting state
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    loadCurrentUser();
    updateDateTime();
    // Update greeting setiap menit
    const timer = setInterval(updateDateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const updateDateTime = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Greeting berdasarkan waktu real
    let greet = '';
    if (hour >= 4 && hour < 12) greet = 'Selamat Pagi';
    else if (hour >= 12 && hour < 15) greet = 'Selamat Siang';
    else if (hour >= 15 && hour < 18) greet = 'Selamat Sore';
    else greet = 'Selamat Malam';
    
    setGreeting(greet);

    // Format tanggal Indonesia
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    setCurrentDate(`${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`);
  };

  const loadCurrentUser = async () => {
    try {
      // Prioritaskan data dari edit profil (@edubidan_user_data)
      const stored = await AsyncStorage.getItem('@edubidan_user_data');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.name) {
          setCurrentUser({
            name: data.name,
            nim: data.nim || '',
            prodi: data.prodi || 'Mahasiswa Kebidanan',
            universitas: data.universitas || '',
            email: data.email || '',
          });
          return;
        }
      }

      // Fallback: load dari UserDatabase (data login)
      const user = await UserDatabase.getCurrentUser();
      if (user) {
        setCurrentUser({
          name: user.name,
          nim: user.nim,
          prodi: user.prodi || 'Mahasiswa Kebidanan',
          universitas: user.universitas || '',
          email: user.email,
        });
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  // Reload user data setiap kali tab home difokus (misal: setelah edit profil)
  useFocusEffect(
    useCallback(() => {
      loadCurrentUser();
      updateDateTime();
    }, [])
  );

  // Load notifications and progress from storage
  useEffect(() => {
    loadNotifications();
    loadProgress();
  }, []);
  
  // Reload user data when screen is focused
  useEffect(() => {
    const unsubscribe = router.canGoBack; // trigger re-check
    loadCurrentUser();
  }, []);

  const loadProgress = async () => {
    try {
      const progressData = await ProgressHelper.loadAllProgress();
      const result: {[key: string]: number} = {};
      for (const module of MODULES) {
        const completed = progressData[module.id] || 0;
        const totalLessons = module.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
        result[module.id] = totalLessons > 0 ? completed / totalLessons : 0;
      }
      setModuleProgress(result);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        const parsedNotifications: Notification[] = JSON.parse(stored);
        setNotifications(parsedNotifications);
        setUnreadCount(parsedNotifications.filter(n => !n.isRead).length);
      } else {
        // Initialize with sample notifications
        const sampleNotifications: Notification[] = [
          {
            id: '1',
            title: 'Selamat Datang!',
            message: 'Selamat datang di EduBidan. Mulai perjalanan belajar Anda sekarang!',
            type: 'success',
            timestamp: Date.now() - 3600000, // 1 hour ago
            isRead: false,
          },
          {
            id: '2',
            title: 'Materi Baru Tersedia',
            message: 'Materi "Asuhan Kehamilan (ANC)" telah diperbarui dengan video terbaru.',
            type: 'info',
            timestamp: Date.now() - 7200000, // 2 hours ago
            isRead: false,
          },
          {
            id: '3',
            title: 'Reminder Belajar',
            message: 'Jangan lupa untuk melanjutkan pembelajaran Anda hari ini!',
            type: 'warning',
            timestamp: Date.now() - 86400000, // 1 day ago
            isRead: true,
          },
        ];
        setNotifications(sampleNotifications);
        setUnreadCount(sampleNotifications.filter(n => !n.isRead).length);
        await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(sampleNotifications));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.isRead).length);
    
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const markAllAsRead = async () => {
    const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'error': return 'alert-circle';
      default: return 'information-circle';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return Colors.primary;
      case 'warning': return Colors.amber;
      case 'error': return Colors.rose;
      default: return Colors.blue;
    }
  };

  const formatNotificationTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} menit yang lalu`;
    if (hours < 24) return `${hours} jam yang lalu`;
    return `${days} hari yang lalu`;
  };

  const completedModules = Object.values(moduleProgress).filter((progress) => progress >= 1).length;
  const inProgressModules = Object.values(moduleProgress).filter((progress) => progress > 0 && progress < 1).length;
  const totalProgress = Object.keys(moduleProgress).length > 0 
    ? Object.values(moduleProgress).reduce((sum, progress) => sum + progress, 0) / Object.keys(moduleProgress).length 
    : 0;

  const totalLessonsCompleted = MODULES.reduce((sum, m) => {
    const progress = moduleProgress[m.id] || 0;
    const totalLessons = m.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
    return sum + Math.floor(progress * totalLessons);
  }, 0);
  const totalLessons = MODULES.reduce((sum, m) => {
    return sum + m.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
  }, 0);
  const totalVideosWatched = MODULES.reduce((sum, m) => {
    const progress = moduleProgress[m.id] || 0;
    return sum + Math.floor(progress * (m.videos || 0));
  }, 0);
  const totalVideos = MODULES.reduce((sum, m) => sum + (m.videos || 0), 0);

  const getGreeting = () => greeting || 'Selamat Pagi';
  const getCurrentDate = () => currentDate;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'light-content'}
        backgroundColor={Colors.primaryDark}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Enhanced Header ── */}
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName} numberOfLines={1}>
                {currentUser.name ? currentUser.name.split(' ')[0] : 'Mahasiswa'}
              </Text>
              <Text style={styles.userInfo}>
                {currentUser.nim || '-'} • {currentUser.prodi || 'Mahasiswa Kebidanan'}
              </Text>
              <Text style={styles.dateInfo}>{getCurrentDate()}</Text>
            </View>
            <View style={styles.headerRight}>
              {/* Theme Toggle */}
              <TouchableOpacity
                style={styles.themeToggle}
                onPress={toggleTheme}
              >
                <Ionicons 
                  name={isDark ? 'sunny' : 'moon'} 
                  size={20} 
                  color={Colors.white} 
                />
              </TouchableOpacity>
              
              {/* Notification Button */}
              <TouchableOpacity
                style={styles.notificationBtn}
                onPress={() => setShowNotifications(true)}
              >
                <Ionicons name="notifications" size={20} color={Colors.white} />
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {/* Profile Avatar */}
              <TouchableOpacity
                style={styles.avatarBtn}
                onPress={() => router.push('/(tabs)/profil')}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'M'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Enhanced Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressCardHeader}>
              <View>
                <Text style={styles.progressCardTitle}>Progress Pembelajaran</Text>
                <Text style={styles.progressCardSubtitle}>
                  {totalLessonsCompleted} dari {totalLessons} pelajaran selesai
                </Text>
              </View>
              <View style={styles.progressCardPercent}>
                <Text style={styles.progressPercentText}>
                  {Math.round(totalProgress * 100)}%
                </Text>
              </View>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[styles.progressBarFill, { width: `${totalProgress * 100}%` }]}
              />
            </View>
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>{completedModules}</Text>
                <Text style={styles.progressStatLabel}>Modul Selesai</Text>
              </View>
              <View style={styles.progressStatDivider} />
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>{inProgressModules}</Text>
                <Text style={styles.progressStatLabel}>Sedang Belajar</Text>
              </View>
              <View style={styles.progressStatDivider} />
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>{totalVideosWatched}</Text>
                <Text style={styles.progressStatLabel}>Video Ditonton</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ── Enhanced Quick Actions ── */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Aksi Cepat</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: Colors.primaryLight }]}
              onPress={() => router.push('/(tabs)/materi')}
              activeOpacity={0.8}
            >
              <Ionicons name="book" size={28} color={Colors.primary} />
              <Text style={[styles.quickActionText, { color: Colors.primary }]}>Semua Materi</Text>
              <Text style={[styles.quickActionSubtext, { color: Colors.primary }]}>5 modul</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: Colors.blueLight }]}
              onPress={() => router.push('/(tabs)/riwayat')}
              activeOpacity={0.8}
            >
              <Ionicons name="analytics" size={28} color={Colors.blue} />
              <Text style={[styles.quickActionText, { color: Colors.blue }]}>Statistik</Text>
              <Text style={[styles.quickActionSubtext, { color: Colors.blue }]}>Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: Colors.amberLight }]}
              onPress={() => router.push(`/quiz/${MODULES[0]?.id || '1'}`)}
              activeOpacity={0.8}
            >
              <Ionicons name="help-circle" size={28} color={Colors.amber} />
              <Text style={[styles.quickActionText, { color: Colors.amber }]}>Kuis</Text>
              <Text style={[styles.quickActionSubtext, { color: Colors.amber }]}>Evaluasi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: Colors.roseLight }]}
              onPress={() => router.push('/(tabs)/profil')}
              activeOpacity={0.8}
            >
              <Ionicons name="person" size={28} color={Colors.rose} />
              <Text style={[styles.quickActionText, { color: Colors.rose }]}>Profil</Text>
              <Text style={[styles.quickActionSubtext, { color: Colors.rose }]}>Akun</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── All Modules ── */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Semua Modul Pembelajaran</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/materi')}>
              <Text style={styles.seeAll}>Lihat Detail</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modulesGrid}>
            {(MODULES || []).map((module) => {
              const progress = moduleProgress[module.id] || 0;
              
              return (
                <TouchableOpacity
                  key={module.id}
                  style={[styles.moduleGridCard, { backgroundColor: theme.card, borderLeftColor: module.color }]}
                  onPress={() => router.push(`/module/${module.id}`)}
                  activeOpacity={0.85}
                >
                  <View style={styles.moduleGridHeader}>
                    <View style={[styles.moduleGridIcon, { backgroundColor: module.color + '20' }]}>
                      <Ionicons name="book-outline" size={20} color={module.color} />
                    </View>
                    <View style={[styles.moduleGridBadge, { backgroundColor: module.color + '20' }]}>
                      <Text style={[styles.moduleGridBadgeText, { color: module.color }]}>
                        {module.category}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.moduleGridTitle, { color: theme.text }]} numberOfLines={2}>
                    {module.title}
                  </Text>
                  
                  <View style={styles.moduleGridMeta}>
                    <View style={styles.moduleGridMetaItem}>
                      <Ionicons name="play-circle-outline" size={12} color={theme.textMuted} />
                      <Text style={[styles.moduleGridMetaText, { color: theme.textMuted }]}>
                        {module.videos}
                      </Text>
                    </View>
                    <View style={styles.moduleGridMetaItem}>
                      <Ionicons name="list-outline" size={12} color={theme.textMuted} />
                      <Text style={[styles.moduleGridMetaText, { color: theme.textMuted }]}>
                        {module.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0)}
                      </Text>
                    </View>
                    <View style={styles.moduleGridMetaItem}>
                      <Ionicons name="time-outline" size={12} color={theme.textMuted} />
                      <Text style={[styles.moduleGridMetaText, { color: theme.textMuted }]}>
                        {module.duration.split(' ')[0]}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.moduleGridProgress}>
                    <View style={[styles.moduleGridProgressBg, { backgroundColor: theme.border }]}>
                      <View
                        style={[
                          styles.moduleGridProgressFill,
                          { width: `${progress * 100}%`, backgroundColor: module.color },
                        ]}
                      />
                    </View>
                    <Text style={[styles.moduleGridProgressText, { color: theme.textMuted }]}>
                      {Math.round(progress * 100)}%
                    </Text>
                  </View>

                  <View style={styles.moduleGridFooter}>
                    <Text style={[styles.moduleGridStatus, { 
                      color: progress > 0 ? Colors.primary : theme.textMuted 
                    }]}>
                      {progress > 0 ? 'Sedang Belajar' : 'Belum Dimulai'}
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Notification Modal */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <View style={styles.modalHeaderLeft}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Notifikasi</Text>
              {unreadCount > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: Colors.primary }]}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <View style={styles.modalHeaderRight}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  style={styles.markAllBtn}
                  onPress={markAllAsRead}
                >
                  <Text style={[styles.markAllText, { color: Colors.primary }]}>
                    Tandai Semua
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowNotifications(false)}
              >
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
          
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.notificationsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.notificationItem,
                  { 
                    backgroundColor: theme.card,
                    borderLeftColor: getNotificationColor(item.type),
                    opacity: item.isRead ? 0.7 : 1,
                  }
                ]}
                onPress={() => !item.isRead && markAsRead(item.id)}
              >
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <View style={styles.notificationTitleRow}>
                      <Ionicons 
                        name={getNotificationIcon(item.type)} 
                        size={16} 
                        color={getNotificationColor(item.type)} 
                      />
                      <Text style={[styles.notificationTitle, { color: theme.text }]}>
                        {item.title}
                      </Text>
                      {!item.isRead && (
                        <View style={[styles.unreadDot, { backgroundColor: Colors.primary }]} />
                      )}
                    </View>
                    <Text style={[styles.notificationTime, { color: theme.textMuted }]}>
                      {formatNotificationTime(item.timestamp)}
                    </Text>
                  </View>
                  <Text style={[styles.notificationMessage, { color: theme.textSecondary }]}>
                    {item.message}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyNotifications}>
                <Ionicons name="notifications-off-outline" size={48} color={theme.textMuted} />
                <Text style={[styles.emptyNotificationsText, { color: theme.textMuted }]}>
                  Tidak ada notifikasi
                </Text>
              </View>
            }
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Enhanced Header
  header: { paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  userName: { fontSize: 24, fontWeight: '800', color: Colors.white, marginBottom: 2 },
  userInfo: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  dateInfo: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  
  // Theme Toggle
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  
  // Notification Button
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
  },
  
  // Avatar
  avatarBtn: { position: 'relative' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: { fontSize: 10, fontWeight: '700', color: Colors.white },

  // Enhanced Progress Card
  progressCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  progressCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  progressCardTitle: { fontSize: 16, fontWeight: '700', color: Colors.white },
  progressCardSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  progressCardPercent: { alignItems: 'center' },
  progressPercentText: { fontSize: 24, fontWeight: '800', color: Colors.white },
  progressBarBg: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 5,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: Colors.white, borderRadius: 5 },
  progressStats: { flexDirection: 'row', justifyContent: 'space-around' },
  progressStat: { alignItems: 'center' },
  progressStatValue: { fontSize: 18, fontWeight: '800', color: Colors.white },
  progressStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 2, textAlign: 'center' },
  progressStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },

  // Dashboard Stats
  statsSection: { paddingHorizontal: 20, paddingVertical: 20 },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 11, textAlign: 'center', lineHeight: 14 },

  // Sections
  section: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  seeAll: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  // Enhanced Quick Actions
  quickActions: { flexDirection: 'row', gap: 12 },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionText: { fontSize: 13, fontWeight: '700' },
  quickActionSubtext: { fontSize: 10, fontWeight: '500', opacity: 0.8 },

  // Activity Cards
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  activitySubtitle: { fontSize: 12 },
  activityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activityBadgeText: { fontSize: 11, fontWeight: '700' },

  // Enhanced Module Card
  enhancedModuleCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  moduleCardLeft: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: 12,
  },
  moduleCardContent: { flex: 1 },
  moduleCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: { fontSize: 10, fontWeight: '700' },
  moduleLastAccessed: { fontSize: 11 },
  moduleTitle: { fontSize: 16, fontWeight: '700', lineHeight: 22, marginBottom: 8 },
  moduleMetaRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  moduleMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  moduleMetaText: { fontSize: 11 },
  moduleProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  moduleProgressBg: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  moduleProgressFill: { height: '100%', borderRadius: 3 },
  moduleProgressText: { fontSize: 11, fontWeight: '600', minWidth: 80 },

  // Module Grid
  modulesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  moduleGridCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  moduleGridHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  moduleGridIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleGridBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  moduleGridBadgeText: { fontSize: 9, fontWeight: '700' },
  moduleGridTitle: { fontSize: 13, fontWeight: '700', lineHeight: 18, marginBottom: 8 },
  moduleGridMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  moduleGridMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  moduleGridMetaText: { fontSize: 10 },
  moduleGridProgress: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  moduleGridProgressBg: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  moduleGridProgressFill: { height: '100%', borderRadius: 2 },
  moduleGridProgressText: { fontSize: 10, fontWeight: '600' },
  moduleGridFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  moduleGridStatus: { fontSize: 11, fontWeight: '600' },

  // Empty State
  emptyCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  startBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },

  bottomPad: { height: 32 },

  // Notification Modal Styles
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.white },
  markAllBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  markAllText: { fontSize: 14, fontWeight: '600' },
  closeBtn: { padding: 4 },
  
  notificationsList: { padding: 20 },
  notificationItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationContent: { flex: 1 },
  notificationHeader: { marginBottom: 8 },
  notificationTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  notificationTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  notificationTime: { fontSize: 11 },
  notificationMessage: { fontSize: 13, lineHeight: 18 },
  
  emptyNotifications: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyNotificationsText: { fontSize: 16, marginTop: 12 },
});
