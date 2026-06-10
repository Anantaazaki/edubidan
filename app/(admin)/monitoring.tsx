import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { AdminDatabase, Activity } from '../../src/utils/adminDatabase';

const { width } = Dimensions.get('window');

type TimeFilter = 'today' | 'week' | 'month';

export default function MonitoringScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  
  // State
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');

  useEffect(() => {
    loadActivities();
  }, [timeFilter]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      await AdminDatabase.initializeDatabase();
      
      const activitiesData = await AdminDatabase.getActivities({ timeRange: timeFilter });
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'login': return 'log-in-outline';
      case 'logout': return 'log-out-outline';
      case 'upload_material': return 'cloud-upload-outline';
      case 'create_quiz': return 'help-circle-outline';
      case 'complete_quiz': return 'checkmark-circle-outline';
      case 'complete_module': return 'trophy-outline';
      case 'register': return 'person-add-outline';
      case 'watch_video': return 'play-circle-outline';
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

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'student': return 'Mahasiswa';
      case 'lecturer': return 'Dosen';
      case 'admin': return 'Admin';
      default: return 'User';
    }
  };

  const formatActivityTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m yang lalu`;
    if (hours < 24) return `${hours}j yang lalu`;
    return `${days}h yang lalu`;
  };

  const getTimeFilterLabel = (filter: TimeFilter) => {
    switch (filter) {
      case 'today': return 'Hari Ini';
      case 'week': return 'Minggu Ini';
      case 'month': return 'Bulan Ini';
      default: return 'Hari Ini';
    }
  };

  const getActivityStats = () => {
    const total = activities.length;
    const students = activities.filter(a => a.userType === 'student').length;
    const lecturers = activities.filter(a => a.userType === 'lecturer').length;
    const admins = activities.filter(a => a.userType === 'admin').length;
    
    return { total, students, lecturers, admins };
  };

  const stats = getActivityStats();
  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'light-content'}
        backgroundColor={Colors.primaryDark}
      />
      
      {/* ── Header ── */}
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Monitoring Aktivitas</Text>
            <Text style={styles.headerSubtitle}>
              Pantau aktivitas pengguna secara real-time
            </Text>
          </View>
          <View style={styles.headerRight}>
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
            <TouchableOpacity
              style={styles.auditBtn}
              onPress={() => router.push('/(admin)/audit-log')}
            >
              <Ionicons name="list" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Filter */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeFilters}>
            {(['today', 'week', 'month'] as TimeFilter[]).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.timeFilter,
                  timeFilter === filter && { backgroundColor: 'rgba(255,255,255,0.2)' },
                  timeFilter !== filter && { backgroundColor: 'rgba(255,255,255,0.1)' }
                ]}
                onPress={() => setTimeFilter(filter)}
              >
                <Text style={[
                  styles.timeFilterText,
                  { color: Colors.white, opacity: timeFilter === filter ? 1 : 0.7 }
                ]}>
                  {getTimeFilterLabel(filter)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Aktivitas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.students}</Text>
            <Text style={styles.statLabel}>Mahasiswa</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.lecturers}</Text>
            <Text style={styles.statLabel}>Dosen</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.admins}</Text>
            <Text style={styles.statLabel}>Admin</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* ── Activity Analytics ── */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Analisis Aktivitas</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Export</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.analyticsGrid}>
            <View style={[styles.analyticsCard, { backgroundColor: theme.card }]}>
              <View style={[styles.analyticsIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="trending-up" size={24} color={Colors.primary} />
              </View>
              <Text style={[styles.analyticsValue, { color: theme.text }]}>+23%</Text>
              <Text style={[styles.analyticsLabel, { color: theme.textMuted }]}>Aktivitas Harian</Text>
              <Text style={[styles.analyticsSubtext, { color: Colors.green }]}>
                Naik dari kemarin
              </Text>
            </View>
            
            <View style={[styles.analyticsCard, { backgroundColor: theme.card }]}>
              <View style={[styles.analyticsIcon, { backgroundColor: Colors.blueLight }]}>
                <Ionicons name="time" size={24} color={Colors.blue} />
              </View>
              <Text style={[styles.analyticsValue, { color: theme.text }]}>4.2h</Text>
              <Text style={[styles.analyticsLabel, { color: theme.textMuted }]}>Rata-rata Session</Text>
              <Text style={[styles.analyticsSubtext, { color: Colors.blue }]}>
                Per pengguna
              </Text>
            </View>
          </View>
        </View>

        {/* ── Live Activity Feed ── */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.liveTitleWrapper}>
              <View style={styles.liveIndicator} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Aktivitas Live</Text>
            </View>
            <Text style={[styles.activityCount, { color: theme.textMuted }]}>
              {activities.length} aktivitas
            </Text>
          </View>
          
          {activities.length === 0 ? (
            <View style={styles.emptyActivities}>
              <Ionicons name="pulse-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyActivitiesText, { color: theme.text }]}>
                Belum ada aktivitas
              </Text>
              <Text style={[styles.emptyActivitiesSubtext, { color: theme.textMuted }]}>
                Aktivitas akan muncul di sini secara real-time
              </Text>
            </View>
          ) : (
            <View style={styles.activitiesTimeline}>
              {activities.map((activity, index) => (
                <View key={activity.id} style={styles.timelineItem}>
                  <View style={styles.timelineMarker}>
                    <View style={[styles.timelineIcon, { backgroundColor: getActivityColor(activity.userType) + '20' }]}>
                      <Ionicons 
                        name={getActivityIcon(activity.action)} 
                        size={16} 
                        color={getActivityColor(activity.userType)} 
                      />
                    </View>
                    {index < activities.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  
                  <View style={[styles.timelineContent, { backgroundColor: theme.card }]}>
                    <View style={styles.timelineHeader}>
                      <Text style={[styles.timelineDescription, { color: theme.text }]} numberOfLines={2}>
                        {activity.description}
                      </Text>
                      <View style={[styles.userTypeBadge, { backgroundColor: getActivityColor(activity.userType) + '20' }]}>
                        <Text style={[styles.userTypeBadgeText, { color: getActivityColor(activity.userType) }]}>
                          {getUserTypeLabel(activity.userType)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.timelineMeta}>
                      <Text style={[styles.timelineUser, { color: theme.textMuted }]}>
                        {activity.userName}
                      </Text>
                      <Text style={[styles.timelineTime, { color: theme.textMuted }]}>
                        {formatActivityTime(activity.timestamp)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  
  // Header
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeToggle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  auditBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Time Filter
  filterContainer: { marginBottom: 16 },
  timeFilters: { gap: 8 },
  timeFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  timeFilterText: { fontSize: 13, fontWeight: '600' },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.white, marginBottom: 2 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Section
  section: { paddingHorizontal: 20, paddingVertical: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  seeAll: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  liveTitleWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveIndicator: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.green,
  },
  activityCount: { fontSize: 13 },

  // Analytics Grid
  analyticsGrid: { flexDirection: 'row', gap: 12 },
  analyticsCard: {
    flex: 1, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  analyticsIcon: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  analyticsValue: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  analyticsLabel: { fontSize: 12, marginBottom: 4 },
  analyticsSubtext: { fontSize: 11, fontWeight: '600' },

  // Timeline
  activitiesTimeline: { gap: 0 },
  timelineItem: { flexDirection: 'row', gap: 12 },
  timelineMarker: { alignItems: 'center', width: 40 },
  timelineIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  timelineLine: {
    width: 2, flex: 1, minHeight: 16,
    backgroundColor: 'rgba(0,0,0,0.08)', marginTop: 4,
  },
  timelineContent: {
    flex: 1, borderRadius: 12, padding: 12,
    marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  timelineDescription: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },
  userTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  userTypeBadgeText: { fontSize: 9, fontWeight: '700' },
  timelineMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  timelineUser: { fontSize: 11 },
  timelineTime: { fontSize: 11 },

  // Empty State
  emptyActivities: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyActivitiesText: { fontSize: 16, fontWeight: '600' },
  emptyActivitiesSubtext: { fontSize: 13, textAlign: 'center' },

  bottomPad: { height: 20 },
});