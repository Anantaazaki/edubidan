import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { MODULES } from '../../src/constants/modules';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LecturerDatabase, Material } from '../../src/utils/lecturerDatabase';

// Notification interface
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  isRead: boolean;
}

const LECTURER_NOTIFICATIONS_KEY = '@edubidan_lecturer_notifications';

const LECTURER_USER = {
  name: 'Dr. Siti Aminah, M.Keb',
  nip: '196805151992032001',
  jabatan: 'Dosen Kebidanan',
  universitas: 'UNSIKA',
  fakultas: 'Kesehatan',
  joinDate: 'Januari 2010',
};

export default function LecturerDashboardScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  
  // State for lecturer dashboard
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<Material[]>([]);
  
  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalMaterials: 0,
    totalVideos: 0,
    totalQuizzes: 0,
    pendingGrades: 0,
    completionRate: 0,
  });

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      
      // Initialize database with sample data
      await LecturerDatabase.initializeDatabase();
      
      // Load all data
      await Promise.all([
        loadLecturerNotifications(),
        loadDashboardData(),
        loadMaterials(),
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      Alert.alert('Error', 'Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const loadMaterials = async () => {
    try {
      const materialsData = await LecturerDatabase.getAllMaterials();
      setMaterials(materialsData);
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      const stats = await LecturerDatabase.getStatistics();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to default values
      setDashboardStats({
        totalStudents: 45,
        totalMaterials: 5,
        totalVideos: 62,
        totalQuizzes: 25,
        pendingGrades: 8,
        completionRate: 78,
      });
    }
  };

  const loadLecturerNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(LECTURER_NOTIFICATIONS_KEY);
      if (stored) {
        const parsedNotifications: Notification[] = JSON.parse(stored);
        setNotifications(parsedNotifications);
        setUnreadCount(parsedNotifications.filter(n => !n.isRead).length);
      } else {
        // Initialize with sample lecturer notifications
        const sampleNotifications: Notification[] = [
          {
            id: '1',
            title: 'Tugas Baru Dikumpulkan',
            message: '5 mahasiswa telah mengumpulkan tugas Asuhan Kehamilan.',
            type: 'info',
            timestamp: Date.now() - 1800000, // 30 minutes ago
            isRead: false,
          },
          {
            id: '2',
            title: 'Quiz Selesai',
            message: 'Quiz Asuhan Persalinan telah diselesaikan oleh 12 mahasiswa.',
            type: 'success',
            timestamp: Date.now() - 3600000, // 1 hour ago
            isRead: false,
          },
          {
            id: '3',
            title: 'Nilai Perlu Ditinjau',
            message: '8 nilai quiz menunggu peninjauan dan konfirmasi.',
            type: 'warning',
            timestamp: Date.now() - 7200000, // 2 hours ago
            isRead: true,
          },
        ];
        setNotifications(sampleNotifications);
        setUnreadCount(sampleNotifications.filter(n => !n.isRead).length);
        await AsyncStorage.setItem(LECTURER_NOTIFICATIONS_KEY, JSON.stringify(sampleNotifications));
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
      await AsyncStorage.setItem(LECTURER_NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };
  const markAllAsRead = async () => {
    const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    
    try {
      await AsyncStorage.setItem(LECTURER_NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const getCurrentDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return Colors.primary;
      case 'draft': return Colors.amber;
      case 'archived': return Colors.gray500;
      default: return Colors.gray500;
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'materials':
        router.push('/(lecturer)/materi-saya');
        break;
      case 'students':
        router.push('/(lecturer)/mahasiswa');
        break;
      case 'quiz':
        router.push('/(lecturer)/quiz');
        break;
      case 'grading':
        router.push('/(lecturer)/penilaian');
        break;
      default:
        break;
    }
  };
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
                Dr. {LECTURER_USER.name.split(' ')[1]}
              </Text>
              <Text style={styles.userInfo}>
                {LECTURER_USER.nip} • {LECTURER_USER.jabatan}
              </Text>
              <Text style={styles.dateInfo}>{getCurrentDate()}</Text>
            </View>
            <View style={styles.headerRight}>
              {/* Profile Button */}
              <TouchableOpacity
                style={styles.profileBtn}
                onPress={() => router.push('/(lecturer)/profile')}
              >
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>
                    {LECTURER_USER.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>

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
            </View>
          </View>
          {/* Enhanced Dashboard Overview Card */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewCardHeader}>
              <View>
                <Text style={styles.overviewCardTitle}>Dashboard Pengajar</Text>
                <Text style={styles.overviewCardSubtitle}>
                  {dashboardStats.totalStudents} mahasiswa aktif • {dashboardStats.totalMaterials} materi
                </Text>
              </View>
              <View style={styles.overviewCardIcon}>
                <Ionicons name="school" size={24} color={Colors.primary} />
              </View>
            </View>
            
            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{dashboardStats.completionRate}%</Text>
                <Text style={styles.overviewStatLabel}>Tingkat Penyelesaian</Text>
              </View>
              <View style={styles.overviewStatDivider} />
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{dashboardStats.pendingGrades}</Text>
                <Text style={styles.overviewStatLabel}>Menunggu Penilaian</Text>
              </View>
              <View style={styles.overviewStatDivider} />
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{dashboardStats.totalQuizzes}</Text>
                <Text style={styles.overviewStatLabel}>Total Quiz</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ── Dashboard Stats ── */}
        <View style={[styles.statsSection, { backgroundColor: theme.background }]}>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="people" size={20} color={Colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{dashboardStats.totalStudents}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Mahasiswa</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.blueLight }]}>
                <Ionicons name="book" size={20} color={Colors.blue} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{dashboardStats.totalMaterials}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Materi</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.amberLight }]}>
                <Ionicons name="play-circle" size={20} color={Colors.amber} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{dashboardStats.totalVideos}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Video</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.roseLight }]}>
                <Ionicons name="help-circle" size={20} color={Colors.rose} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{dashboardStats.totalQuizzes}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Quiz</Text>
            </View>
          </View>
        </View>
        {/* ── Quick Actions for Lecturer ── */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Aksi Cepat</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: Colors.primaryLight }]}
              onPress={() => handleQuickAction('materials')}
              activeOpacity={0.8}
            >
              <Ionicons name="book" size={28} color={Colors.primary} />
              <Text style={[styles.quickActionText, { color: Colors.primary }]}>Materi Saya</Text>
              <Text style={[styles.quickActionSubtext, { color: Colors.primary }]}>
                {dashboardStats.totalMaterials} materi
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: Colors.blueLight }]}
              onPress={() => handleQuickAction('students')}
              activeOpacity={0.8}
            >
              <Ionicons name="people" size={28} color={Colors.blue} />
              <Text style={[styles.quickActionText, { color: Colors.blue }]}>Mahasiswa</Text>
              <Text style={[styles.quickActionSubtext, { color: Colors.blue }]}>
                {dashboardStats.totalStudents} aktif
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: Colors.amberLight }]}
              onPress={() => handleQuickAction('quiz')}
              activeOpacity={0.8}
            >
              <Ionicons name="help-circle" size={28} color={Colors.amber} />
              <Text style={[styles.quickActionText, { color: Colors.amber }]}>Quiz</Text>
              <Text style={[styles.quickActionSubtext, { color: Colors.amber }]}>
                {dashboardStats.totalQuizzes} quiz
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: Colors.roseLight }]}
              onPress={() => handleQuickAction('grading')}
              activeOpacity={0.8}
            >
              <Ionicons name="star" size={28} color={Colors.rose} />
              <Text style={[styles.quickActionText, { color: Colors.rose }]}>Penilaian</Text>
              <Text style={[styles.quickActionSubtext, { color: Colors.rose }]}>
                {dashboardStats.pendingGrades} pending
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Recent Activity for Lecturer ── */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Aktivitas Terbaru</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.activityCard, { backgroundColor: theme.card }]}>
            <View style={[styles.activityIcon, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="document-text" size={20} color={Colors.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={[styles.activityTitle, { color: theme.text }]}>
                5 Tugas Baru Dikumpulkan
              </Text>
              <Text style={[styles.activitySubtitle, { color: theme.textMuted }]}>
                Asuhan Kehamilan (ANC) • 1 jam yang lalu
              </Text>
            </View>
            <View style={[styles.activityBadge, { backgroundColor: Colors.primaryLight }]}>
              <Text style={[styles.activityBadgeText, { color: Colors.primary }]}>Baru</Text>
            </View>
          </View>

          <View style={[styles.activityCard, { backgroundColor: theme.card }]}>
            <View style={[styles.activityIcon, { backgroundColor: Colors.amberLight }]}>
              <Ionicons name="help-circle" size={20} color={Colors.amber} />
            </View>
            <View style={styles.activityContent}>
              <Text style={[styles.activityTitle, { color: theme.text }]}>
                Quiz Persalinan Selesai
              </Text>
              <Text style={[styles.activitySubtitle, { color: theme.textMuted }]}>
                12 mahasiswa • 2 jam yang lalu
              </Text>
            </View>
            <View style={[styles.activityBadge, { backgroundColor: Colors.amberLight }]}>
              <Text style={[styles.activityBadgeText, { color: Colors.amber }]}>Review</Text>
            </View>
          </View>
        </View>
        {/* ── Module Management Overview ── */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Manajemen Modul</Text>
            <TouchableOpacity onPress={() => router.push('/(lecturer)/materi-saya')}>
              <Text style={styles.seeAll}>Kelola</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modulesGrid}>
            {materials.slice(0, 4).map((material) => (
              <TouchableOpacity
                key={material.id}
                style={[styles.moduleGridCard, { backgroundColor: theme.card, borderLeftColor: Colors.primary }]}
                activeOpacity={0.85}
                onPress={() => router.push(`/(lecturer)/materi-saya?materialId=${material.id}`)}
              >
                <View style={styles.moduleGridHeader}>
                  <View style={[styles.moduleGridIcon, { backgroundColor: Colors.primary + '20' }]}>
                    <Ionicons name="book-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={[styles.moduleGridBadge, { backgroundColor: getStatusColor(material.status) + '20' }]}>
                    <Text style={[styles.moduleGridBadgeText, { color: getStatusColor(material.status) }]}>
                      {material.status === 'published' ? 'Aktif' : material.status === 'draft' ? 'Draft' : 'Arsip'}
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.moduleGridTitle, { color: theme.text }]} numberOfLines={2}>
                  {material.title}
                </Text>
                
                <View style={styles.moduleGridMeta}>
                  <View style={styles.moduleGridMetaItem}>
                    <Ionicons name="layers-outline" size={12} color={theme.textMuted} />
                    <Text style={[styles.moduleGridMetaText, { color: theme.textMuted }]}>
                      {material.totalLessons} pelajaran
                    </Text>
                  </View>
                  <View style={styles.moduleGridMetaItem}>
                    <Ionicons name="time-outline" size={12} color={theme.textMuted} />
                    <Text style={[styles.moduleGridMetaText, { color: theme.textMuted }]}>
                      {material.estimatedDuration}
                    </Text>
                  </View>
                </View>

                <View style={styles.moduleGridFooter}>
                  <Text style={[styles.moduleGridStatus, { color: getStatusColor(material.status) }]}>
                    {material.status === 'published' ? 'Dipublikasi' : material.status === 'draft' ? 'Draft' : 'Arsip'}
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
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
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.notificationItem,
                  { backgroundColor: theme.background },
                  !item.isRead && { backgroundColor: theme.surface }
                ]}
                onPress={() => !item.isRead && markAsRead(item.id)}
              >
                <View style={[styles.notificationIconContainer, { backgroundColor: getNotificationColor(item.type) + '20' }]}>
                  <Ionicons
                    name={getNotificationIcon(item.type)}
                    size={20}
                    color={getNotificationColor(item.type)}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationTitle, { color: theme.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.notificationMessage, { color: theme.textMuted }]} numberOfLines={2}>
                    {item.message}
                  </Text>
                  <Text style={[styles.notificationTime, { color: theme.textMuted }]}>
                    {formatNotificationTime(item.timestamp)}
                  </Text>
                </View>
                {!item.isRead && (
                  <View style={[styles.unreadIndicator, { backgroundColor: Colors.primary }]} />
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.notificationsList}
            ListEmptyComponent={
              <View style={styles.emptyNotifications}>
                <Ionicons name="notifications-outline" size={48} color={theme.textMuted} />
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
  
  // Header Styles
  header: { paddingTop: 60, paddingBottom: 32, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  userName: { fontSize: 24, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  userInfo: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  dateInfo: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileBtn: {
    padding: 4,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.rose,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationText: { fontSize: 10, color: Colors.white, fontWeight: '700' },

  // Overview Card Styles
  overviewCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  overviewCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  overviewCardTitle: { fontSize: 18, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  overviewCardSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  overviewCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewStats: { flexDirection: 'row', alignItems: 'center' },
  overviewStat: { flex: 1, alignItems: 'center' },
  overviewStatValue: { fontSize: 20, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  overviewStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 12 },
  overviewStatDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },
  // Stats Section
  statsSection: { paddingHorizontal: 20, paddingVertical: 24, borderBottomWidth: 1 },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11, textAlign: 'center', lineHeight: 14 },

  // Section Styles
  section: { paddingHorizontal: 20, paddingVertical: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  seeAll: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  // Quick Actions
  quickActions: { flexDirection: 'row', gap: 12 },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  quickActionSubtext: { fontSize: 10, opacity: 0.8, textAlign: 'center' },

  // Activity Cards
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  activitySubtitle: { fontSize: 12, lineHeight: 16 },
  activityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  activityBadgeText: { fontSize: 10, fontWeight: '600' },

  // Module Grid
  modulesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  moduleGridCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  moduleGridHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  moduleGridIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  moduleGridBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  moduleGridBadgeText: { fontSize: 9, fontWeight: '700' },
  moduleGridTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8, lineHeight: 16 },
  moduleGridMeta: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  moduleGridMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  moduleGridMetaText: { fontSize: 10 },
  moduleGridFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  moduleGridStatus: { fontSize: 11, fontWeight: '600' },

  bottomPad: { height: 20 },
  // Modal Styles
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
  modalTitle: { fontSize: 18, fontWeight: '700' },
  unreadBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  unreadBadgeText: { fontSize: 10, color: Colors.white, fontWeight: '700' },
  modalHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  markAllBtn: {},
  markAllText: { fontSize: 14, fontWeight: '600' },
  closeBtn: { padding: 4 },
  
  notificationsList: { paddingVertical: 8 },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  notificationMessage: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  notificationTime: { fontSize: 11 },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  
  emptyNotifications: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyNotificationsText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});