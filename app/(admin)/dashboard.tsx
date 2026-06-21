import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { AdminDatabase, DashboardStats, Activity } from '../../src/utils/adminDatabase';
import { auth } from '../../src/config/firebase';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();

  // Real admin user from Firebase Auth
  const adminUser = auth.currentUser;
  const adminName = adminUser?.displayName || adminUser?.email?.split('@')[0] || 'Admin';
  const adminEmail = adminUser?.email || 'admin@edubidan.com';
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalLecturers: 0,
    totalAdmins: 0,
    totalMaterials: 0,
    totalVideos: 0,
    totalQuizzes: 0,
    totalCategories: 0,
    activeStudents: 0,
    activeLecturers: 0,
    pendingApprovals: 0,
    totalViews: 0,
    averageScore: 0,
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      await AdminDatabase.initializeDatabase();
      await loadDashboardData();
    } catch (error) {
      console.error('Error initializing admin dashboard:', error);
      Alert.alert('Error', 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [dashboardStats, activities] = await Promise.all([
        AdminDatabase.getDashboardStats(),
        AdminDatabase.getActivities({ timeRange: 'today' }),
      ]);
      
      setStats(dashboardStats);
      setRecentActivities(activities.slice(0, 10)); // Get latest 10 activities
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
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

  const formatActivityTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes} menit yang lalu`;
    return `${hours} jam yang lalu`;
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'login': return 'log-in-outline';
      case 'upload_material': return 'cloud-upload-outline';
      case 'create_quiz': return 'help-circle-outline';
      case 'complete_quiz': return 'checkmark-circle-outline';
      case 'register': return 'person-add-outline';
      default: return 'flash-outline';
    }
  };

  const getActivityColor = (userType: string) => {
    switch (userType) {
      case 'student': return Colors.blue;
      case 'lecturer': return Colors.primary;
      case 'admin': return Colors.amber;
      default: return Colors.gray500;
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'users':
        router.push('/(admin)/users');
        break;
      case 'content':
        router.push('/(admin)/content');
        break;
      case 'settings':
        router.push('/(admin)/settings');
        break;
      case 'notifications':
        router.push('/(admin)/notifications');
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
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* ── Enhanced Header ── */}
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName} numberOfLines={1}>
                {adminName}
              </Text>
              <Text style={styles.userRole}>
                Administrator • EduBidan
              </Text>
              <Text style={styles.dateInfo}>{getCurrentDate()}</Text>
            </View>
            <View style={styles.headerRight}>
              {/* Profile Button */}
              <TouchableOpacity
                style={styles.profileBtn}
                onPress={() => router.push('/(admin)/profile')}
              >
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>
                    {adminName.charAt(0).toUpperCase()}
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
                onPress={() => router.push('/(admin)/notifications')}
              >
                <Ionicons name="notifications" size={20} color={Colors.white} />
                {stats.pendingApprovals > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}>
                      {stats.pendingApprovals > 9 ? '9+' : stats.pendingApprovals}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Enhanced Overview Card */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewCardHeader}>
              <View>
                <Text style={styles.overviewCardTitle}>Dashboard Admin</Text>
                <Text style={styles.overviewCardSubtitle}>
                  Pusat Kontrol EduBidan • {stats.totalStudents + stats.totalLecturers + stats.totalAdmins} total pengguna
                </Text>
              </View>
              <View style={styles.overviewCardIcon}>
                <Ionicons name="settings" size={24} color={Colors.primary} />
              </View>
            </View>
            
            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{stats.totalStudents}</Text>
                <Text style={styles.overviewStatLabel}>Total Mahasiswa</Text>
              </View>
              <View style={styles.overviewStatDivider} />
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{stats.totalLecturers}</Text>
                <Text style={styles.overviewStatLabel}>Total Dosen</Text>
              </View>
              <View style={styles.overviewStatDivider} />
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{stats.totalMaterials}</Text>
                <Text style={styles.overviewStatLabel}>Total Materi</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ── Main Statistics Grid ── */}
        <View style={[styles.statsSection, { backgroundColor: theme.background }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Statistik Utama</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="school" size={20} color={Colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalStudents.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Mahasiswa</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.blueLight }]}>
                <Ionicons name="people" size={20} color={Colors.blue} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalLecturers}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Dosen</Text>
            </View>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.amberLight }]}>
                <Ionicons name="library" size={20} color={Colors.amber} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalMaterials}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Materi</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.roseLight }]}>
                <Ionicons name="play-circle" size={20} color={Colors.rose} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalVideos}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Video</Text>
            </View>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.purpleLight }]}>
                <Ionicons name="help-circle" size={20} color={Colors.purple} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalQuizzes}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Quiz</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.tealLight }]}>
                <Ionicons name="people-circle" size={20} color={Colors.teal} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalAdmins}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Admin</Text>
            </View>
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Aksi Cepat</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: Colors.primaryLight }]}
              onPress={() => handleQuickAction('users')}
              activeOpacity={0.8}
            >
              <Ionicons name="people" size={28} color={Colors.primary} />
              <Text style={[styles.quickActionText, { color: Colors.primary }]}>Kelola Pengguna</Text>
              <Text style={[styles.quickActionSubtext, { color: Colors.primary }]}>
                {stats.totalStudents + stats.totalLecturers} pengguna
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: Colors.blueLight }]}
              onPress={() => handleQuickAction('content')}
              activeOpacity={0.8}
            >
              <Ionicons name="library" size={28} color={Colors.blue} />
              <Text style={[styles.quickActionText, { color: Colors.blue }]}>Kelola Konten</Text>
              <Text style={[styles.quickActionSubtext, { color: Colors.blue }]}>
                {stats.totalMaterials + stats.totalVideos + stats.totalQuizzes} konten
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: Colors.amberLight }]}
              onPress={() => handleQuickAction('settings')}
              activeOpacity={0.8}
            >
              <Ionicons name="settings" size={28} color={Colors.amber} />
              <Text style={[styles.quickActionText, { color: Colors.amber }]}>Pengaturan</Text>
              <Text style={[styles.quickActionSubtext, { color: Colors.amber }]}>
                Sistem
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Recent Activities ── */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Aktivitas Terbaru</Text>
          </View>
          </View>
          
          {recentActivities.map((activity) => (
            <View key={activity.id} style={[styles.activityCard, { backgroundColor: theme.card }]}>
              <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.userType) + '20' }]}>
                <Ionicons name={getActivityIcon(activity.action)} size={20} color={getActivityColor(activity.userType)} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: theme.text }]} numberOfLines={1}>
                  {activity.description}
                </Text>
                <Text style={[styles.activitySubtitle, { color: theme.textMuted }]}>
                  {activity.userName} • {formatActivityTime(activity.timestamp)}
                </Text>
              </View>
              <View style={[styles.activityBadge, { backgroundColor: getActivityColor(activity.userType) + '20' }]}>
                <Text style={[styles.activityBadgeText, { color: getActivityColor(activity.userType) }]}>
                  {activity.userType === 'student' ? 'Mahasiswa' : 
                   activity.userType === 'lecturer' ? 'Dosen' : 'Admin'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── System Health ── */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Status Sistem</Text>
          <View style={[styles.healthCard, { backgroundColor: theme.card }]}>
            <View style={styles.healthItems}>
              <View style={styles.healthItem}>
                <View style={[styles.healthIndicator, { backgroundColor: Colors.green }]} />
                <Text style={[styles.healthText, { color: theme.text }]}>Database Firestore</Text>
                <Text style={[styles.healthStatus, { color: Colors.green }]}>Terhubung</Text>
              </View>
              <View style={styles.healthItem}>
                <View style={[styles.healthIndicator, { backgroundColor: Colors.green }]} />
                <Text style={[styles.healthText, { color: theme.text }]}>Firebase Auth</Text>
                <Text style={[styles.healthStatus, { color: Colors.green }]}>Aktif</Text>
              </View>
              <View style={styles.healthItem}>
                <View style={[styles.healthIndicator, { backgroundColor: Colors.green }]} />
                <Text style={[styles.healthText, { color: theme.text }]}>Firebase Storage</Text>
                <Text style={[styles.healthStatus, { color: Colors.green }]}>Aktif</Text>
              </View>
              <View style={styles.healthItem}>
                <View style={[styles.healthIndicator, { backgroundColor: Colors.primary }]} />
                <Text style={[styles.healthText, { color: theme.text }]}>Total Pengguna</Text>
                <Text style={[styles.healthStatus, { color: Colors.primary }]}>
                  {stats.totalStudents + stats.totalLecturers + stats.totalAdmins} akun
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
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
  userRole: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  dateInfo: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  
  profileBtn: { padding: 4 },
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
  profileAvatarText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  
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

  // Overview Card
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
  statsSection: { paddingHorizontal: 20, paddingVertical: 24 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
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
    position: 'relative',
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 12, textAlign: 'center', marginBottom: 8 },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statChangeText: { fontSize: 10, fontWeight: '600' },

  // Section Styles
  section: { paddingHorizontal: 20, paddingVertical: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  seeAll: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  // Quick Actions
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickAction: {
    width: (width - 56) / 2,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionText: { fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 4, textAlign: 'center' },
  quickActionSubtext: { fontSize: 11, textAlign: 'center' },

  // Activity Cards
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  activityTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  activitySubtitle: { fontSize: 12 },
  activityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activityBadgeText: { fontSize: 10, fontWeight: '600' },

  // Health Card
  healthCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  healthItems: { gap: 16 },
  healthItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  healthIndicator: { width: 8, height: 8, borderRadius: 4 },
  healthText: { flex: 1, fontSize: 14, fontWeight: '500' },
  healthStatus: { fontSize: 12, fontWeight: '600' },

  bottomPad: { height: 20 },
});