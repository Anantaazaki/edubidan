import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Modal, Alert, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';

type NotifType = 'all' | 'mahasiswa' | 'dosen';

const SAMPLE_NOTIFS = [
  { id: '1', title: 'Mahasiswa Baru Terdaftar', message: 'Ananta Ziaurohman berhasil mendaftar ke EduBidan', type: 'info', isRead: false, timestamp: Date.now() - 1800000 },
  { id: '2', title: 'Konten Baru Menunggu Persetujuan', message: 'Dr. Siti Aminah mengupload materi baru: Teknik Palpasi', type: 'warning', isRead: false, timestamp: Date.now() - 3600000 },
  { id: '3', title: 'Quiz Diselesaikan', message: '15 mahasiswa menyelesaikan Quiz Asuhan Kehamilan', type: 'success', isRead: true, timestamp: Date.now() - 7200000 },
  { id: '4', title: 'Login Admin', message: 'Admin berhasil login dari perangkat baru', type: 'info', isRead: true, timestamp: Date.now() - 86400000 },
];

export default function AdminNotificationsScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  const [notifs, setNotifs] = useState(SAMPLE_NOTIFS);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTarget, setBroadcastTarget] = useState<NotifType>('all');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const unreadCount = notifs.filter(n => !n.isRead).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return Colors.green;
      case 'warning': return Colors.amber;
      case 'error': return Colors.rose;
      default: return Colors.blue;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'error': return 'alert-circle';
      default: return 'information-circle';
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m yang lalu`;
    if (hours < 24) return `${hours}j yang lalu`;
    return `${days}h yang lalu`;
  };

  const handleMarkAsRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: string) => {
    Alert.alert('Hapus Notifikasi', 'Apakah Anda yakin ingin menghapus notifikasi ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => setNotifs(prev => prev.filter(n => n.id !== id)) },
    ]);
  };

  const handleBroadcast = () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      Alert.alert('Error', 'Judul dan pesan harus diisi'); return;
    }
    const targetLabel = broadcastTarget === 'all' ? 'semua pengguna' : broadcastTarget === 'mahasiswa' ? 'semua mahasiswa' : 'semua dosen';
    Alert.alert('Sukses', `Broadcast berhasil dikirim ke ${targetLabel}`);
    setShowBroadcastModal(false);
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Notifikasi</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={toggleTheme}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.broadcastBtn} onPress={() => setShowBroadcastModal(true)}>
              <Ionicons name="megaphone" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Actions */}
      {unreadCount > 0 && (
        <View style={[styles.actionsBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={[styles.markAllText, { color: Colors.primary }]}>Tandai Semua Dibaca</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifs}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Tidak ada notifikasi</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notifCard, { backgroundColor: item.isRead ? theme.card : theme.surface }, !item.isRead && styles.unreadCard]}
            onPress={() => handleMarkAsRead(item.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.notifIcon, { backgroundColor: getTypeColor(item.type) + '20' }]}>
              <Ionicons name={getTypeIcon(item.type)} size={22} color={getTypeColor(item.type)} />
            </View>
            <View style={styles.notifContent}>
              <Text style={[styles.notifTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
              <Text style={[styles.notifMessage, { color: theme.textMuted }]} numberOfLines={2}>{item.message}</Text>
              <Text style={[styles.notifTime, { color: theme.textMuted }]}>{formatTime(item.timestamp)}</Text>
            </View>
            <View style={styles.notifRight}>
              {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: Colors.primary }]} />}
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Broadcast Modal */}
      <Modal visible={showBroadcastModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowBroadcastModal(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Kirim Broadcast</Text>
            <TouchableOpacity onPress={() => setShowBroadcastModal(false)}>
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={[styles.formLabel, { color: theme.text }]}>Target Penerima *</Text>
            <View style={styles.targetOptions}>
              {([
                { key: 'all', label: 'Semua Pengguna', icon: 'people' },
                { key: 'mahasiswa', label: 'Mahasiswa', icon: 'school' },
                { key: 'dosen', label: 'Dosen', icon: 'person' },
              ] as { key: NotifType; label: string; icon: any }[]).map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.targetOption, { backgroundColor: theme.surface, borderColor: theme.border }, broadcastTarget === opt.key && { borderColor: Colors.primary, backgroundColor: Colors.primaryLight }]}
                  onPress={() => setBroadcastTarget(opt.key)}
                >
                  <Ionicons name={opt.icon} size={20} color={broadcastTarget === opt.key ? Colors.primary : theme.textMuted} />
                  <Text style={[styles.targetOptionText, { color: broadcastTarget === opt.key ? Colors.primary : theme.text }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.formLabel, { color: theme.text }]}>Judul Notifikasi *</Text>
            <TextInput
              style={[styles.formInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder="Masukkan judul notifikasi"
              placeholderTextColor={theme.textMuted}
              value={broadcastTitle}
              onChangeText={setBroadcastTitle}
            />

            <Text style={[styles.formLabel, { color: theme.text }]}>Pesan *</Text>
            <TextInput
              style={[styles.formInput, styles.messageInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder="Tulis isi pesan broadcast..."
              placeholderTextColor={theme.textMuted}
              value={broadcastMessage}
              onChangeText={setBroadcastMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity style={[styles.sendBtn, { backgroundColor: Colors.primary }]} onPress={handleBroadcast}>
              <Ionicons name="megaphone" size={18} color={Colors.white} />
              <Text style={styles.sendBtnText}>Kirim Broadcast</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },
  unreadBadge: { backgroundColor: Colors.rose, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  unreadBadgeText: { fontSize: 11, color: Colors.white, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  broadcastBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.amber, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 4 },
  actionsBar: { paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  markAllText: { fontSize: 13, fontWeight: '600' },
  list: { padding: 16 },
  notifCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderRadius: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  unreadCard: { borderLeftWidth: 3, borderLeftColor: Colors.primary },
  notifIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  notifMessage: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 11 },
  notifRight: { alignItems: 'center', gap: 8 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  deleteBtn: { padding: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalContent: { flex: 1, padding: 20 },
  formLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  targetOptions: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  targetOption: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1, gap: 6 },
  targetOptionText: { fontSize: 12, fontWeight: '600' },
  formInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, marginBottom: 16 },
  messageInput: { minHeight: 100 },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8 },
  sendBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
});