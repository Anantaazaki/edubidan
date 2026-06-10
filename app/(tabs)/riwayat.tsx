import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

// History entry interface
interface HistoryEntry {
  id: string;
  type: 'quiz' | 'materi';
  moduleId: string;
  moduleTitle: string;
  moduleColor: string;
  date: string;
  timestamp: number;
  score?: number;
  total?: number;
  passed?: boolean;
}

// Notification interface
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  isRead: boolean;
}

const HISTORY_KEY = '@edubidan_history';
const NOTIFICATIONS_KEY = '@edubidan_notifications';

export default function RiwayatScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  
  // State
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load data on mount and focus
  useEffect(() => {
    loadHistory();
    loadNotifications();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
      loadNotifications();
    }, [])
  );

  const loadHistory = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsedHistory: HistoryEntry[] = JSON.parse(stored);
        // Sort by timestamp, newest first
        parsedHistory.sort((a, b) => b.timestamp - a.timestamp);
        setHistory(parsedHistory);
      } else {
        // Initialize with sample data
        const sampleHistory: HistoryEntry[] = [
          {
            id: '1',
            type: 'materi',
            moduleId: '1',
            moduleTitle: 'Asuhan Kehamilan (ANC)',
            moduleColor: '#FF6B9D',
            date: '2 hari yang lalu',
            timestamp: Date.now() - 172800000, // 2 days ago
          },
          {
            id: '2',
            type: 'quiz',
            moduleId: '1',
            moduleTitle: 'Asuhan Kehamilan (ANC)',
            moduleColor: '#FF6B9D',
            date: '3 hari yang lalu',
            timestamp: Date.now() - 259200000, // 3 days ago
            score: 8,
            total: 10,
            passed: true,
          },
          {
            id: '3',
            type: 'materi',
            moduleId: '2',
            moduleTitle: 'Asuhan Persalinan Normal',
            moduleColor: '#4ECDC4',
            date: '1 minggu yang lalu',
            timestamp: Date.now() - 604800000, // 1 week ago
          },
        ];
        setHistory(sampleHistory);
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(sampleHistory));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        const parsedNotifications: Notification[] = JSON.parse(stored);
        setNotifications(parsedNotifications);
        setUnreadCount(parsedNotifications.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
      setHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
      Alert.alert('Error', 'Gagal menghapus riwayat');
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Hapus Riwayat',
      'Apakah Anda yakin ingin menghapus semua riwayat belajar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: clearHistory,
        },
      ]
    );
  };

  const getIcon = (entry: HistoryEntry) => {
    if (entry.type === 'quiz') return 'help-circle';
    return 'book';
  };

  const getIconColor = (entry: HistoryEntry) => {
    if (entry.type === 'quiz') {
      if (entry.passed) return Colors.green;
      return Colors.rose;
    }
    return entry.moduleColor;
  };

  const getLabel = (entry: HistoryEntry) => {
    if (entry.type === 'quiz') {
      return `Kuis: ${entry.score}/${entry.total} benar`;
    }
    return 'Membuka Materi';
  };

  const quizCount = history.filter((h) => h.type === 'quiz').length;
  const materiCount = history.filter((h) => h.type === 'materi').length;
  const passedCount = history.filter((h) => h.type === 'quiz' && h.passed).length;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'light-content'} backgroundColor={Colors.primaryDark} />

      {/* Header */}
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Riwayat Belajar</Text>
            <Text style={styles.headerSubtitle}>Pantau aktivitas belajar Anda</Text>
          </View>
          <View style={styles.headerRight}>
            {/* Theme Toggle */}
            <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={Colors.white} />
            </TouchableOpacity>
            
            {/* Notification Button */}
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => setShowNotifications(true)}
            >
              <Ionicons name="notifications" size={18} color={Colors.white} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            
            {/* Clear History Button */}
            {history.length > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                <Ionicons name="trash-outline" size={18} color={Colors.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{history.length}</Text>
            <Text style={styles.statLabel}>Total Aktivitas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{materiCount}</Text>
            <Text style={styles.statLabel}>Materi Dibuka</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{passedCount}/{quizCount}</Text>
            <Text style={styles.statLabel}>Kuis Lulus</Text>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>Memuat riwayat...</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="time-outline" size={56} color={theme.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Belum Ada Riwayat</Text>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            Mulai belajar dan ikuti kuis untuk melihat riwayat aktivitas Anda di sini.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {(history || []).map((entry) => (
            <View
              key={entry.id}
              style={[styles.historyCard, { backgroundColor: theme.card }]}
            >
              <View
                style={[
                  styles.historyIconWrap,
                  { backgroundColor: getIconColor(entry) + '20' },
                ]}
              >
                <Ionicons
                  name={getIcon(entry)}
                  size={22}
                  color={getIconColor(entry)}
                />
              </View>
              <View style={styles.historyContent}>
                <Text style={[styles.historyModule, { color: theme.text }]} numberOfLines={1}>
                  {entry.moduleTitle}
                </Text>
                <Text style={[styles.historyLabel, { color: theme.textMuted }]}>
                  {getLabel(entry)}
                </Text>
                <Text style={[styles.historyDate, { color: theme.textMuted }]}>
                  {entry.date}
                </Text>
              </View>
              {entry.type === 'quiz' && (
                <View
                  style={[
                    styles.quizBadge,
                    { backgroundColor: entry.passed ? Colors.greenLight : Colors.roseLight },
                  ]}
                >
                  <Text
                    style={[
                      styles.quizBadgeText,
                      { color: entry.passed ? Colors.green : Colors.rose },
                    ]}
                  >
                    {entry.passed ? 'Lulus' : 'Gagal'}
                  </Text>
                </View>
              )}
            </View>
          ))}
          <View style={styles.bottomPad} />
        </ScrollView>
      )}

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setShowNotifications(false)}>
              <Text style={[styles.modalCancel, { color: Colors.primary }]}>Tutup</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Notifikasi</Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Ionicons name="notifications-off-outline" size={48} color={theme.textMuted} />
                <Text style={[styles.emptyNotificationsText, { color: theme.textMuted }]}>
                  Belum ada notifikasi
                </Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <View key={notification.id} style={[styles.notificationItem, { backgroundColor: theme.card }]}>
                  <View style={styles.notificationContent}>
                    <Text style={[styles.notificationTitle, { color: theme.text }]}>
                      {notification.title}
                    </Text>
                    <Text style={[styles.notificationMessage, { color: theme.textMuted }]}>
                      {notification.message}
                    </Text>
                    <Text style={[styles.notificationTime, { color: theme.textMuted }]}>
                      {new Date(notification.timestamp).toLocaleDateString('id-ID')}
                    </Text>
                  </View>
                  {!notification.isRead && (
                    <View style={[styles.unreadDot, { backgroundColor: Colors.primary }]} />
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
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
  notificationText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.white },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14 },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  historyContent: { flex: 1 },
  historyModule: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  historyLabel: { fontSize: 13, marginBottom: 2 },
  historyDate: { fontSize: 11 },
  quizBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  quizBadgeText: { fontSize: 12, fontWeight: '700' },

  bottomPad: { height: 24 },

  // Modal styles
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalCancel: { fontSize: 16, fontWeight: '600' },
  modalContent: { flex: 1, padding: 20 },

  // Notification styles
  emptyNotifications: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyNotificationsText: {
    fontSize: 16,
    marginTop: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  notificationMessage: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  notificationTime: { fontSize: 11 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
});
