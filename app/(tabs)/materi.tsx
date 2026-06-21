import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { LecturerDatabase, Material, Video, Quiz } from '../../src/utils/lecturerDatabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIES = ['Semua', 'Kehamilan', 'Persalinan', 'Nifas', 'Neonatus', 'Laktasi', 'KB'];

export default function MateriScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Real data from Firestore
  const [materials, setMaterials] = useState<Material[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async (forceRefresh = false) => {
    // Try cache first for instant display
    if (!forceRefresh) {
      try {
        const cached = await AsyncStorage.getItem('@materi_cache');
        if (cached) {
          const { materials: m, videos: v, quizzes: q } = JSON.parse(cached);
          if (m) setMaterials(m);
          if (v) setVideos(v);
          if (q) setQuizzes(q);
          // Refresh in background
          refreshInBackground();
          return;
        }
      } catch (_) {}
    }

    // No cache — show loading
    setLoading(true);
    try {
      const [m, v, q] = await Promise.all([
        LecturerDatabase.getAllMaterials(),
        LecturerDatabase.getAllVideos(),
        LecturerDatabase.getAllQuizzes(),
      ]);
      // Only show published content to mahasiswa
      const pubMaterials = m.filter(mat => mat.status === 'published');
      const pubVideos = v.filter(vid => vid.status === 'published');
      const pubQuizzes = q.filter(qz => qz.status === 'published');
      setMaterials(pubMaterials);
      setVideos(pubVideos);
      setQuizzes(pubQuizzes);
      await AsyncStorage.setItem('@materi_cache', JSON.stringify({
        materials: pubMaterials, videos: pubVideos, quizzes: pubQuizzes,
      })).catch(() => {});
    } catch (e) {
      console.error('Error loading materi:', e);
    } finally {
      setLoading(false);
    }
  };

  const refreshInBackground = async () => {
    try {
      const [m, v, q] = await Promise.all([
        LecturerDatabase.getAllMaterials(),
        LecturerDatabase.getAllVideos(),
        LecturerDatabase.getAllQuizzes(),
      ]);
      const pubMaterials = m.filter(mat => mat.status === 'published');
      const pubVideos = v.filter(vid => vid.status === 'published');
      const pubQuizzes = q.filter(qz => qz.status === 'published');
      setMaterials(pubMaterials);
      setVideos(pubVideos);
      setQuizzes(pubQuizzes);
      await AsyncStorage.setItem('@materi_cache', JSON.stringify({
        materials: pubMaterials, videos: pubVideos, quizzes: pubQuizzes,
      })).catch(() => {});
    } catch (_) {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(true);
    setRefreshing(false);
  };

  // Get videos linked to a material
  const getVideosForMaterial = (materialId: string) => {
    return videos.filter(v => v.materialId === materialId);
  };

  // Get quizzes linked to a material
  const getQuizForMaterial = (materialId: string) => {
    return quizzes.find(q => q.materialId === materialId);
  };

  const filtered = materials.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'Semua' || m.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Kehamilan: '#4CAF50',
      Persalinan: '#2196F3',
      Nifas: '#9C27B0',
      Neonatus: '#FF9800',
      Laktasi: '#E91E63',
      KB: '#00BCD4',
    };
    return colors[category] || Colors.primary;
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* Header */}
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Materi Pembelajaran</Text>
            <Text style={styles.headerSubtitle}>
              {materials.length} materi tersedia dari dosen
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={toggleTheme}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={Colors.slate400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari materi..."
            placeholderTextColor={Colors.slate400}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.slate400} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Category Filter */}
      <View style={[styles.categoryWrap, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                activeCategory === cat
                  ? styles.categoryChipActive
                  : { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
              ]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.categoryChipText,
                activeCategory === cat ? styles.categoryChipTextActive : { color: theme.textMuted },
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>Memuat materi...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={64} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {materials.length === 0 ? 'Belum Ada Materi' : 'Tidak Ditemukan'}
              </Text>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                {materials.length === 0
                  ? 'Dosen belum menambahkan materi. Cek lagi nanti.'
                  : 'Coba kata kunci lain atau ubah filter kategori.'}
              </Text>
            </View>
          ) : (
            filtered.map((material) => {
              const matVideos = getVideosForMaterial(material.id);
              const matQuiz = getQuizForMaterial(material.id);
              const color = getCategoryColor(material.category);

              return (
                <TouchableOpacity
                  key={material.id}
                  style={[styles.moduleCard, { backgroundColor: theme.card }]}
                  onPress={() => router.push(`/module/${material.id}`)}
                  activeOpacity={0.85}
                >
                  {/* Color accent */}
                  <View style={[styles.colorAccent, { backgroundColor: color }]} />

                  <View style={styles.cardBody}>
                    {/* Top row */}
                    <View style={styles.cardTopRow}>
                      <View style={[styles.iconWrap, { backgroundColor: color + '20' }]}>
                        <Ionicons name="book-outline" size={22} color={color} />
                      </View>
                      <View style={styles.headerBadges}>
                        <View style={[styles.categoryBadge, { backgroundColor: color + '20' }]}>
                          <Text style={[styles.categoryBadgeText, { color }]}>
                            {material.category}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Title */}
                    <Text style={[styles.moduleTitle, { color: theme.text }]}>{material.title}</Text>

                    {/* Description */}
                    <Text style={[styles.moduleDesc, { color: theme.textMuted }]} numberOfLines={2}>
                      {material.description || 'Materi pembelajaran dari dosen'}
                    </Text>

                    {/* Meta */}
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="play-circle-outline" size={14} color={theme.textMuted} />
                        <Text style={[styles.metaText, { color: theme.textMuted }]}>
                          {matVideos.length} video
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="help-circle-outline" size={14} color={theme.textMuted} />
                        <Text style={[styles.metaText, { color: theme.textMuted }]}>
                          {matQuiz ? `${matQuiz.questions?.length || 0} soal` : 'Belum ada quiz'}
                        </Text>
                      </View>
                      {material.estimatedDuration ? (
                        <View style={styles.metaItem}>
                          <Ionicons name="time-outline" size={14} color={theme.textMuted} />
                          <Text style={[styles.metaText, { color: theme.textMuted }]}>
                            {material.estimatedDuration}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Action Row */}
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.studyBtn, { backgroundColor: color }]}
                        onPress={() => router.push(`/module/${material.id}`)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="play" size={14} color={Colors.white} />
                        <Text style={styles.studyBtnText}>Pelajari</Text>
                      </TouchableOpacity>
                      {matQuiz ? (
                        <TouchableOpacity
                          style={[styles.quizBtn, { borderColor: color }]}
                          onPress={() => router.push(`/quiz/${matQuiz.id}`)}
                          activeOpacity={0.85}
                        >
                          <Ionicons name="help-circle-outline" size={14} color={color} />
                          <Text style={[styles.quizBtnText, { color }]}>Kuis</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          <View style={styles.bottomPad} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 14, height: 46,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.slate900 },
  categoryWrap: { borderBottomWidth: 1, paddingVertical: 10 },
  categoryScroll: { paddingHorizontal: 16, gap: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryChipText: { fontSize: 13, fontWeight: '600' },
  categoryChipTextActive: { color: Colors.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingTop: 60 },
  loadingText: { fontSize: 14 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  moduleCard: {
    borderRadius: 16, marginBottom: 14, overflow: 'hidden',
    flexDirection: 'row', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  colorAccent: { width: 5 },
  cardBody: { flex: 1, padding: 16 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerBadges: { flexDirection: 'row', gap: 6 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryBadgeText: { fontSize: 11, fontWeight: '700' },
  moduleTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6, lineHeight: 22 },
  moduleDesc: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  metaRow: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: 10 },
  studyBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10,
  },
  studyBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  quizBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1.5,
  },
  quizBtnText: { fontSize: 13, fontWeight: '700' },
  bottomPad: { height: 24 },
});
