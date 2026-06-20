import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar,
  TextInput, Modal, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { LecturerDatabase, Material, Video, Quiz } from '../../src/utils/lecturerDatabase';
import { auth } from '../../src/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ActiveTab = 'materi' | 'video' | 'quiz';

export default function KelolaPembelajaranScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>('materi');
  const [loading, setLoading] = useState(false);

  // Data
  const [materials, setMaterials] = useState<Material[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('Kehamilan');
  const [formUrl, setFormUrl] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formTimeLimit, setFormTimeLimit] = useState('30');

  const CATEGORIES = ['Kehamilan', 'Persalinan', 'Nifas', 'Neonatus', 'Laktasi', 'KB'];
  const lecturerId = auth.currentUser?.uid || 'lecturer1';

  useFocusEffect(useCallback(() => { loadAll(); }, []));

  const loadAll = async () => {
    // Tampilkan cache dulu (instant)
    try {
      const cached = await AsyncStorage.getItem('@lecturer_content_cache');
      if (cached) {
        const { materials: m, videos: v, quizzes: q } = JSON.parse(cached);
        if (m) setMaterials(m);
        if (v) setVideos(v);
        if (q) setQuizzes(q);
        setLoading(false); // Stop loading spinner karena ada cache
      }
    } catch (_) {}

    // Update dari Firestore di background
    try {
      setLoading(prev => materials.length === 0 && videos.length === 0); // hanya loading jika belum ada data
      await LecturerDatabase.initializeDatabase();
      const [m, v, q] = await Promise.all([
        LecturerDatabase.getAllMaterials(),
        LecturerDatabase.getAllVideos(),
        LecturerDatabase.getAllQuizzes(),
      ]);
      setMaterials(m);
      setVideos(v);
      setQuizzes(q);
      // Simpan ke cache
      await AsyncStorage.setItem('@lecturer_content_cache', JSON.stringify({ materials: m, videos: v, quizzes: q }));
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  };

  // ── Open Add Modal ────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingItem(null);
    resetForm();
    setShowModal(true);
  };

  // ── Open Edit Modal ───────────────────────────────────────────────────────
  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormTitle(item.title || '');
    setFormDesc(item.description || '');
    setFormCategory(item.category || 'Kehamilan');
    setFormUrl(item.url || '');
    setFormDuration(item.duration || '');
    setFormTimeLimit(item.timeLimit?.toString() || '30');
    setShowModal(true);
  };

  const resetForm = () => {
    setFormTitle(''); setFormDesc(''); setFormCategory('Kehamilan');
    setFormUrl(''); setFormDuration(''); setFormTimeLimit('30');
  };

  // ── Save (Create/Update) ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formTitle.trim()) { Alert.alert('Error', 'Judul tidak boleh kosong'); return; }
    if (!formDesc.trim()) { Alert.alert('Error', 'Deskripsi tidak boleh kosong'); return; }

    setLoading(true);
    try {
      let result: { success: boolean; message: string };

      if (activeTab === 'materi') {
        const data = {
          title: formTitle.trim(), description: formDesc.trim(),
          category: formCategory, content: '', status: 'published' as const,
          createdBy: lecturerId, totalLessons: 0, estimatedDuration: formDuration || '1 jam',
        };
        result = editingItem
          ? await LecturerDatabase.updateMaterial(editingItem.id, data)
          : await LecturerDatabase.createMaterial(data).then(r => ({ success: r.success, message: r.message }));
      } else if (activeTab === 'video') {
        if (!formUrl.trim()) { Alert.alert('Error', 'URL video tidak boleh kosong'); setLoading(false); return; }
        const data = {
          title: formTitle.trim(), description: formDesc.trim(),
          materialId: '', url: formUrl.trim(), duration: formDuration || '0:00',
          views: 0, status: 'published' as const, createdBy: lecturerId,
        };
        result = editingItem
          ? await LecturerDatabase.updateVideo(editingItem.id, data)
          : await LecturerDatabase.createVideo(data).then(r => ({ success: r.success, message: r.message }));
      } else {
        const data = {
          title: formTitle.trim(), description: formDesc.trim(),
          materialId: '', questions: [], timeLimit: parseInt(formTimeLimit) || 30,
          attempts: 0, avgScore: 0, status: 'draft' as const, createdBy: lecturerId,
        };
        result = editingItem
          ? await LecturerDatabase.updateQuiz(editingItem.id, data)
          : await LecturerDatabase.createQuiz(data).then(r => ({ success: r.success, message: r.message }));
      }

      if (result.success) {
        Alert.alert('Sukses ✅', `${activeTab === 'materi' ? 'Materi' : activeTab === 'video' ? 'Video' : 'Quiz'} berhasil ${editingItem ? 'diperbarui' : 'ditambahkan'}`);
        setShowModal(false);
        resetForm();
        loadAll();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (item: any) => {
    const label = activeTab === 'materi' ? 'materi' : activeTab === 'video' ? 'video' : 'quiz';
    Alert.alert(
      `Hapus ${label}`,
      `Hapus "${item.title}"? Tindakan ini tidak dapat dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus', style: 'destructive',
          onPress: async () => {
            try {
              let result: { success: boolean; message: string };
              if (activeTab === 'materi') result = await LecturerDatabase.deleteMaterial(item.id);
              else if (activeTab === 'video') result = await LecturerDatabase.deleteVideo(item.id);
              else result = await LecturerDatabase.deleteQuiz(item.id);

              if (result.success) {
                Alert.alert('Sukses', 'Data berhasil dihapus');
                loadAll();
              }
            } catch (e) {
              Alert.alert('Error', 'Gagal menghapus data');
            }
          },
        },
      ]
    );
  };

  // ── Toggle Publish ────────────────────────────────────────────────────────
  const handleToggleStatus = async (item: any) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      if (activeTab === 'materi') await LecturerDatabase.updateMaterial(item.id, { status: newStatus });
      else if (activeTab === 'video') await LecturerDatabase.updateVideo(item.id, { status: newStatus });
      else await LecturerDatabase.updateQuiz(item.id, { status: newStatus as any });
      loadAll();
    } catch (e) {
      Alert.alert('Error', 'Gagal mengubah status');
    }
  };

  const getStatusColor = (status: string) => status === 'published' ? Colors.green : Colors.amber;
  const getStatusText = (status: string) => status === 'published' ? 'Publik' : 'Draft';

  const getCurrentData = () => {
    if (activeTab === 'materi') return materials;
    if (activeTab === 'video') return videos;
    return quizzes;
  };

  // ── Render Item ───────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.itemCard, { backgroundColor: theme.card }]}>
      <View style={styles.itemHeader}>
        <View style={[styles.itemIcon, {
          backgroundColor: activeTab === 'materi' ? Colors.primaryLight
            : activeTab === 'video' ? Colors.roseLight : Colors.amberLight
        }]}>
          <Ionicons
            name={activeTab === 'materi' ? 'book-outline' : activeTab === 'video' ? 'play-circle-outline' : 'help-circle-outline'}
            size={20}
            color={activeTab === 'materi' ? Colors.primary : activeTab === 'video' ? Colors.rose : Colors.amber}
          />
        </View>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.itemDesc, { color: theme.textMuted }]} numberOfLines={1}>
            {item.description}
          </Text>
          {activeTab === 'video' && item.url && (
            <Text style={[styles.itemMeta, { color: theme.textMuted }]} numberOfLines={1}>
              🔗 {item.url}
            </Text>
          )}
          {activeTab === 'quiz' && (
            <Text style={[styles.itemMeta, { color: theme.textMuted }]}>
              ⏱ {item.timeLimit} menit • {item.questions?.length || 0} soal
            </Text>
          )}
        </View>
        <View style={[styles.statusPill, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusPillText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: Colors.blueLight }]}
          onPress={() => openEdit(item)}
        >
          <Ionicons name="create-outline" size={14} color={Colors.blue} />
          <Text style={[styles.actionBtnText, { color: Colors.blue }]}>Edit</Text>
        </TouchableOpacity>

        {activeTab === 'quiz' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.primaryLight }]}
            onPress={() => router.push(`/(lecturer)/quiz-edit?quizId=${item.id}`)}
          >
            <Ionicons name="list-outline" size={14} color={Colors.primary} />
            <Text style={[styles.actionBtnText, { color: Colors.primary }]}>Soal</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: item.status === 'published' ? Colors.amberLight : Colors.greenLight }]}
          onPress={() => handleToggleStatus(item)}
        >
          <Ionicons name={item.status === 'published' ? 'eye-off-outline' : 'eye-outline'} size={14}
            color={item.status === 'published' ? Colors.amber : Colors.green} />
          <Text style={[styles.actionBtnText, { color: item.status === 'published' ? Colors.amber : Colors.green }]}>
            {item.status === 'published' ? 'Arsip' : 'Publis'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: Colors.roseLight }]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={14} color={Colors.rose} />
          <Text style={[styles.actionBtnText, { color: Colors.rose }]}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* Header */}
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Kelola Pembelajaran</Text>
            <Text style={styles.headerSubtitle}>
              {materials.length} materi • {videos.length} video • {quizzes.length} quiz
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={toggleTheme}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: Colors.white + '30' }]} onPress={openAdd}>
              <Ionicons name="add" size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Pills */}
        <View style={styles.tabPills}>
          {([
            { key: 'materi', label: 'Materi', count: materials.length, color: Colors.primary },
            { key: 'video', label: 'Video', count: videos.length, color: Colors.rose },
            { key: 'quiz', label: 'Quiz', count: quizzes.length, color: Colors.amber },
          ] as { key: ActiveTab; label: string; count: number; color: string }[]).map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabPill,
                activeTab === tab.key
                  ? { backgroundColor: Colors.white }
                  : { backgroundColor: 'rgba(255,255,255,0.15)' }
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[
                styles.tabPillText,
                { color: activeTab === tab.key ? tab.color : Colors.white }
              ]}>
                {tab.label}
              </Text>
              <View style={[
                styles.tabPillBadge,
                { backgroundColor: activeTab === tab.key ? tab.color : 'rgba(255,255,255,0.2)' }
              ]}>
                <Text style={styles.tabPillBadgeText}>{tab.count}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>Memuat data...</Text>
        </View>
      ) : (
        <FlatList
          data={getCurrentData()}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadAll}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name={activeTab === 'materi' ? 'book-outline' : activeTab === 'video' ? 'play-circle-outline' : 'help-circle-outline'}
                size={64} color={theme.textMuted}
              />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                Belum ada {activeTab === 'materi' ? 'materi' : activeTab === 'video' ? 'video' : 'quiz'}
              </Text>
              <TouchableOpacity style={[styles.emptyAddBtn, { backgroundColor: Colors.primary }]} onPress={openAdd}>
                <Ionicons name="add" size={16} color={Colors.white} />
                <Text style={styles.emptyAddBtnText}>
                  Tambah {activeTab === 'materi' ? 'Materi' : activeTab === 'video' ? 'Video' : 'Quiz'}
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Modal Tambah/Edit */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={[styles.modalRoot, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={[styles.modalCancel, { color: Colors.rose }]}>Batal</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingItem ? 'Edit' : 'Tambah'} {activeTab === 'materi' ? 'Materi' : activeTab === 'video' ? 'Video' : 'Quiz'}
            </Text>
            <TouchableOpacity onPress={handleSave} disabled={loading}>
              <Text style={[styles.modalSave, { color: loading ? theme.textMuted : Colors.primary }]}>
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Judul */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Judul *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                value={formTitle}
                onChangeText={setFormTitle}
                placeholder={`Judul ${activeTab}`}
                placeholderTextColor={theme.textMuted}
              />
            </View>

            {/* Deskripsi */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Deskripsi *</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                value={formDesc}
                onChangeText={setFormDesc}
                placeholder="Deskripsi singkat"
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Kategori (Materi & Video) */}
            {(activeTab === 'materi' || activeTab === 'video') && (
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Kategori</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        { backgroundColor: formCategory === cat ? Colors.primary : theme.surface, borderColor: formCategory === cat ? Colors.primary : theme.border }
                      ]}
                      onPress={() => setFormCategory(cat)}
                    >
                      <Text style={[styles.categoryChipText, { color: formCategory === cat ? Colors.white : theme.text }]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* URL Video */}
            {activeTab === 'video' && (
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>URL Video / YouTube ID *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                  value={formUrl}
                  onChangeText={setFormUrl}
                  placeholder="https://youtube.com/watch?v=... atau ID"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="none"
                />
                <Text style={[styles.inputHint, { color: theme.textMuted }]}>
                  Contoh: dQw4w9WgXcQ (YouTube Video ID)
                </Text>
              </View>
            )}

            {/* Durasi (Video & Materi) */}
            {(activeTab === 'video' || activeTab === 'materi') && (
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>
                  {activeTab === 'video' ? 'Durasi Video' : 'Estimasi Durasi'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                  value={formDuration}
                  onChangeText={setFormDuration}
                  placeholder={activeTab === 'video' ? '10:30' : '2 jam'}
                  placeholderTextColor={theme.textMuted}
                />
              </View>
            )}

            {/* Time Limit (Quiz) */}
            {activeTab === 'quiz' && (
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Durasi Quiz (menit) *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                  value={formTimeLimit}
                  onChangeText={setFormTimeLimit}
                  placeholder="30"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                />
              </View>
            )}

            {activeTab === 'quiz' && !editingItem && (
              <View style={[styles.infoBox, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="information-circle" size={16} color={Colors.primary} />
                <Text style={[styles.infoBoxText, { color: Colors.primary }]}>
                  Setelah membuat quiz, klik tombol "Soal" untuk menambahkan pertanyaan.
                </Text>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.white, marginBottom: 2 },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  headerRight: { flexDirection: 'row', gap: 10 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  tabPills: { flexDirection: 'row', gap: 10 },
  tabPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 8 },
  tabPillText: { fontSize: 13, fontWeight: '700' },
  tabPillBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  tabPillBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14 },
  listContent: { padding: 16, paddingBottom: 32 },
  itemCard: { borderRadius: 14, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  itemHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  itemIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '600', marginBottom: 3 },
  itemDesc: { fontSize: 12, lineHeight: 16, marginBottom: 3 },
  itemMeta: { fontSize: 11 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, height: 24, justifyContent: 'center' },
  statusPillText: { fontSize: 10, fontWeight: '700' },
  itemActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, gap: 4 },
  actionBtnText: { fontSize: 11, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
  emptyAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  emptyAddBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  modalRoot: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 16, fontWeight: '700' },
  modalCancel: { fontSize: 15, fontWeight: '600' },
  modalSave: { fontSize: 15, fontWeight: '700' },
  modalContent: { flex: 1, padding: 20 },
  formGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14 },
  textArea: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, minHeight: 80 },
  inputHint: { fontSize: 11, marginTop: 4 },
  categoryRow: { gap: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  categoryChipText: { fontSize: 13, fontWeight: '600' },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 14, borderRadius: 12 },
  infoBoxText: { flex: 1, fontSize: 13, lineHeight: 18 },
});