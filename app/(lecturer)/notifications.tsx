import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';

interface Notification {
  id: string;
  type: 'quiz' | 'material' | 'system' | 'student';
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  studentName?: string;
  materialTitle?: string;
  quizTitle?: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'quiz' | 'material' | 'system'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Mock notifications data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'quiz',
          title: 'Quiz Diselesaikan',
          message: 'Maya Sari Indah menyelesaikan Quiz Asuhan Kehamilan dengan nilai 95',
          timestamp: Date.now() - 10 * 60 * 1000, // 10 minutes ago
          isRead: false,
          studentName: 'Maya Sari Indah',
          quizTitle: 'Quiz Asuhan Kehamilan',
        },
        {
          id: '2',
          type: 'material',
          title: 'Materi Diakses',
          message: 'Ananta Ziaurohman Az Zaki mengakses materi Asuhan Persalinan Normal',
          timestamp: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
          isRead: false,
          studentName: 'Ananta Ziaurohman Az Zaki',
          materialTitle: 'Asuhan Persalinan Normal',
        },
        {
          id: '3',
          type: 'quiz',
          title: 'Quiz Diselesaikan',
          message: 'Sari Dewi Pratiwi menyelesaikan Quiz Persalinan Normal dengan nilai 88',
          timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
          isRead: true,
          studentName: 'Sari Dewi Pratiwi',
          quizTitle: 'Quiz Persalinan Normal',
        },
        {
          id: '4',
          type: 'system',
          title: 'Update Materi',
          message: 'Materi "Asuhan Kehamilan (ANC)" berhasil diperbarui dan dipublikasi',
          timestamp: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
          isRead: true,
        },
        {
          id: '5',
          type: 'student',
          title: 'Mahasiswa Baru',
          message: 'Lila Permata Sari bergabung dengan kelas Anda',
          timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
          isRead: true,
          studentName: 'Lila Permata Sari',
        },
        {
          id: '6',
          type: 'quiz',
          title: 'Quiz Diselesaikan',
          message: 'Rina Safitri menyelesaikan Quiz Nifas dengan nilai 76',
          timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
          isRead: true,
          studentName: 'Rina Safitri',
          quizTitle: 'Quiz Nifas',
        },
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Gagal memuat notifikasi');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const deleteNotification = (notificationId: string) => {
    Alert.alert(
      'Hapus Notifikasi',
      'Apakah Anda yakin ingin menghapus notifikasi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
          },
        },
      ]
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    Alert.alert('Sukses', 'Semua notifikasi telah ditandai sebagai dibaca');
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Hapus Semua Notifikasi',
      'Apakah Anda yakin ingin menghapus semua notifikasi?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Semua',
          style: 'destructive',
          onPress: () => {
            setNotifications([]);
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'quiz': return 'help-circle';
      case 'material': return 'book';
      case 'system': return 'settings';
      case 'student': return 'person-add';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'quiz': return Colors.primary;
      case 'material': return Colors.blue;
      case 'system': return Colors.amber;
      case 'student': return Colors.rose;
      default: return Colors.gray500;
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} menit yang lalu`;
    if (hours < 24) return `${hours} jam yang lalu`;
    return `${days} hari yang lalu`;
  };

  const filteredNotifications = notifications.filter(notif => 
    filter === 'all' || notif.type === filter
  );

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  const filters = [
    { id: 'all', label: 'Semua', count: notifications.length },
    { id: 'quiz', label: 'Quiz', count: notifications.filter(n => n.type === 'quiz').length },
    { id: 'material', label: 'Materi', count: notifications.filter(n => n.type === 'material').length },
    { id: 'system', label: 'Sistem', count: notifications.filter(n => n.type === 'system').length },
  ];

  if (loading) {
    return (
      <View style={[styles.root, styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>Memuat notifikasi...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'light-content'}
        backgroundColor={Colors.primaryDark}
      />
      
      {/* Header */}
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Notifikasi</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
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
              style={styles.moreBtn}
              onPress={() => {
                Alert.alert(
                  'Opsi Notifikasi',
                  'Pilih aksi yang ingin dilakukan',
                  [
                    { text: 'Batal', style: 'cancel' },
                    { text: 'Tandai Semua Dibaca', onPress: markAllAsRead },
                    { text: 'Hapus Semua', style: 'destructive', onPress: clearAllNotifications },
                  ]
                );
              }}
            >
              <Ionicons name="ellipsis-vertical" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={[styles.filterSection, { backgroundColor: theme.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabs}>
          {filters.map((filterItem) => (
            <TouchableOpacity
              key={filterItem.id}
              style={[
                styles.filterTab,
                filter === filterItem.id && { backgroundColor: Colors.primary },
                filter !== filterItem.id && { backgroundColor: theme.card }
              ]}
              onPress={() => setFilter(filterItem.id as any)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === filterItem.id ? { color: Colors.white } : { color: theme.text }
                ]}
              >
                {filterItem.label}
              </Text>
              <View
                style={[
                  styles.filterTabBadge,
                  filter === filterItem.id 
                    ? { backgroundColor: 'rgba(255,255,255,0.2)' }
                    : { backgroundColor: theme.border }
                ]}
              >
                <Text
                  style={[
                    styles.filterTabBadgeText,
                    filter === filterItem.id ? { color: Colors.white } : { color: theme.textMuted }
                  ]}
                >
                  {filterItem.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Tidak ada notifikasi</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
            {filter === 'all' ? 'Semua notifikasi sudah dibersihkan' : `Tidak ada notifikasi ${filter}`}
          </Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          <View style={styles.notificationsContainer}>
            {filteredNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  { backgroundColor: theme.card },
                  !notification.isRead && { borderLeftWidth: 4, borderLeftColor: Colors.primary }
                ]}
                onPress={() => markAsRead(notification.id)}
                onLongPress={() => deleteNotification(notification.id)}
              >
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <View style={[styles.notificationIcon, { backgroundColor: getNotificationColor(notification.type) + '20' }]}>
                      <Ionicons 
                        name={getNotificationIcon(notification.type) as any} 
                        size={18} 
                        color={getNotificationColor(notification.type)} 
                      />
                    </View>
                    <View style={styles.notificationInfo}>
                      <Text style={[styles.notificationTitle, { color: theme.text }]}>
                        {notification.title}
                      </Text>
                      <Text style={[styles.notificationTime, { color: theme.textMuted }]}>
                        {formatTime(notification.timestamp)}
                      </Text>
                    </View>
                    <View style={styles.notificationActions}>
                      {!notification.isRead && (
                        <View style={[styles.unreadDot, { backgroundColor: Colors.primary }]} />
                      )}
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => deleteNotification(notification.id)}
                      >
                        <Ionicons name="trash-outline" size={16} color={theme.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={[styles.notificationMessage, { color: theme.textMuted }]}>
                    {notification.message}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.bottomPad} />
        </ScrollView>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },

  // Header
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeToggle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  moreBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  // Filter Section
  filterSection: { paddingVertical: 16, borderBottomWidth: 1 },
  filterTabs: { paddingHorizontal: 20, gap: 12 },
  filterTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 8 },
  filterTabText: { fontSize: 14, fontWeight: '600' },
  filterTabBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  filterTabBadgeText: { fontSize: 10, fontWeight: '700' },

  // Empty State
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // Notifications
  notificationsContainer: { paddingHorizontal: 20, paddingVertical: 16 },
  notificationCard: { borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  notificationContent: { padding: 16 },
  notificationHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  notificationIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  notificationInfo: { flex: 1 },
  notificationTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  notificationTime: { fontSize: 12 },
  notificationActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  deleteBtn: { padding: 4 },
  notificationMessage: { fontSize: 13, lineHeight: 18 },

  bottomPad: { height: 20 },
});