import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { AdminDatabase, AuditLog } from '../../src/utils/adminDatabase';

const SAMPLE_LOGS: AuditLog[] = [
  { id: '1', userId: 'admin1', userName: 'Admin EduBidan', action: 'login', resource: 'auth', timestamp: Date.now() - 1800000 },
  { id: '2', userId: 'admin1', userName: 'Admin EduBidan', action: 'approve_content', resource: 'content', resourceId: 'content1', timestamp: Date.now() - 3600000 },
  { id: '3', userId: 'admin1', userName: 'Admin EduBidan', action: 'create_admin', resource: 'admin', resourceId: 'admin2', timestamp: Date.now() - 7200000 },
  { id: '4', userId: 'admin1', userName: 'Admin EduBidan', action: 'reject_content', resource: 'content', resourceId: 'content2', newValue: { rejectionReason: 'Konten tidak sesuai kurikulum' }, timestamp: Date.now() - 86400000 },
  { id: '5', userId: 'lecturer1', userName: 'Dr. Siti Aminah', action: 'upload_material', resource: 'material', resourceId: 'material1', timestamp: Date.now() - 172800000 },
  { id: '6', userId: 'student1', userName: 'Ananta Ziaurohman', action: 'complete_quiz', resource: 'quiz', resourceId: 'quiz1', timestamp: Date.now() - 259200000 },
];

export default function AuditLogScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  const [logs, setLogs] = useState<AuditLog[]>(SAMPLE_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      await AdminDatabase.initializeDatabase();
      const dbLogs = await AdminDatabase.getAuditLogs();
      if (dbLogs.length > 0) setLogs([...dbLogs, ...SAMPLE_LOGS]);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    !searchQuery.trim() ||
    log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (['login', 'logout'].includes(action)) return Colors.blue;
    if (['create_admin', 'approve_content'].includes(action)) return Colors.green;
    if (['reject_content', 'delete_admin'].includes(action)) return Colors.rose;
    if (['upload_material', 'complete_quiz'].includes(action)) return Colors.primary;
    return Colors.amber;
  };

  const getActionIcon = (action: string) => {
    if (action === 'login') return 'log-in-outline';
    if (action === 'logout') return 'log-out-outline';
    if (action === 'approve_content') return 'checkmark-circle-outline';
    if (action === 'reject_content') return 'close-circle-outline';
    if (action === 'create_admin') return 'person-add-outline';
    if (action === 'upload_material') return 'cloud-upload-outline';
    if (action === 'complete_quiz') return 'trophy-outline';
    return 'document-text-outline';
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      login: 'Login',
      logout: 'Logout',
      approve_content: 'Setujui Konten',
      reject_content: 'Tolak Konten',
      create_admin: 'Buat Admin',
      delete_admin: 'Hapus Admin',
      upload_material: 'Upload Materi',
      complete_quiz: 'Selesaikan Quiz',
    };
    return labels[action] || action;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderLog = ({ item }: { item: AuditLog }) => (
    <View style={[styles.logCard, { backgroundColor: theme.card }]}>
      <View style={styles.logLeft}>
        <View style={[styles.logIcon, { backgroundColor: getActionColor(item.action) + '20' }]}>
          <Ionicons name={getActionIcon(item.action)} size={18} color={getActionColor(item.action)} />
        </View>
        <View style={styles.logLine} />
      </View>
      <View style={styles.logContent}>
        <View style={styles.logHeader}>
          <Text style={[styles.logAction, { color: theme.text }]}>
            {getActionLabel(item.action)}
          </Text>
          <Text style={[styles.logTime, { color: theme.textMuted }]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
        <Text style={[styles.logUser, { color: theme.textMuted }]}>
          Oleh: {item.userName}
        </Text>
        <Text style={[styles.logResource, { color: theme.textMuted }]}>
          Resource: {item.resource}{item.resourceId ? ` #${item.resourceId}` : ''}
        </Text>
        {item.newValue?.rejectionReason && (
          <View style={[styles.logExtra, { backgroundColor: Colors.roseLight }]}>
            <Text style={[styles.logExtraText, { color: Colors.rose }]}>
              Alasan: {item.newValue.rejectionReason}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Audit Log</Text>
            <Text style={styles.headerSubtitle}>{filteredLogs.length} aktivitas tercatat</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="rgba(255,255,255,0.6)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari log aktivitas..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close" size={16} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <FlatList
        data={filteredLogs}
        keyExtractor={item => item.id}
        renderItem={renderLog}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadLogs}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {searchQuery ? 'Tidak ada hasil' : 'Belum ada log aktivitas'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  searchInput: { flex: 1, fontSize: 14, color: Colors.white },
  list: { padding: 20 },
  logCard: { flexDirection: 'row', borderRadius: 12, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  logLeft: { alignItems: 'center', marginRight: 12, width: 36 },
  logIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  logLine: { flex: 1, width: 2, backgroundColor: 'rgba(0,0,0,0.06)', marginTop: 4 },
  logContent: { flex: 1 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  logAction: { fontSize: 14, fontWeight: '600' },
  logTime: { fontSize: 11 },
  logUser: { fontSize: 12, marginBottom: 2 },
  logResource: { fontSize: 12, marginBottom: 6 },
  logExtra: { padding: 8, borderRadius: 8 },
  logExtraText: { fontSize: 12, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
});