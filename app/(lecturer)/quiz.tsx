import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { LecturerDatabase, Quiz } from '../../src/utils/lecturerDatabase';

export default function QuizScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    filterQuizzes();
  }, [quizzes, searchQuery, selectedFilter]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const quizzesData = await LecturerDatabase.getAllQuizzes();
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      Alert.alert('Error', 'Gagal memuat quiz. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const filterQuizzes = () => {
    let filtered = quizzes;

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(quiz => quiz.status === selectedFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(query) ||
        quiz.description.toLowerCase().includes(query)
      );
    }

    setFilteredQuizzes(filtered);
  };

  const getFilterCounts = () => {
    return {
      all: quizzes.length,
      published: quizzes.filter(q => q.status === 'published').length,
      draft: quizzes.filter(q => q.status === 'draft').length,
      closed: quizzes.filter(q => q.status === 'closed').length,
    };
  };

  const handleEditQuiz = (quiz: Quiz) => {
    router.push(`/(lecturer)/quiz-edit?quizId=${quiz.id}`);
  };

  const handleViewResults = (quiz: Quiz) => {
    router.push(`/(lecturer)/quiz-results?quizId=${quiz.id}`);
  };

  const handleDuplicateQuiz = async (quiz: Quiz) => {
    try {
      Alert.alert(
        'Duplikat Quiz',
        `Duplikat quiz "${quiz.title}"?`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Duplikat',
            onPress: async () => {
              try {
                // Create duplicate quiz data
                const duplicateData = {
                  title: `Copy - ${quiz.title}`,
                  description: quiz.description,
                  materialId: quiz.materialId,
                  questions: quiz.questions.map((q: any) => ({
                    ...q,
                    id: Date.now().toString() + Math.random().toString(),
                  })),
                  timeLimit: quiz.timeLimit,
                  attempts: quiz.attempts,
                  avgScore: 0,
                  status: 'draft' as const,
                  createdBy: 'lecturer1',
                };

                const result = await LecturerDatabase.createQuiz(duplicateData);
                
                if (result.success) {
                  Alert.alert('Sukses', 'Quiz berhasil diduplikat!');
                  await loadQuizzes(); // Refresh list
                } else {
                  Alert.alert('Error', result.message);
                }
              } catch (error) {
                console.error('Error duplicating quiz:', error);
                Alert.alert('Error', 'Gagal menduplikat quiz');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error in handleDuplicateQuiz:', error);
    }
  };

  const filters = [
    { id: 'all', label: 'Semua', count: getFilterCounts().all },
    { id: 'published', label: 'Dipublikasi', count: getFilterCounts().published },
    { id: 'draft', label: 'Draft', count: getFilterCounts().draft },
    { id: 'closed', label: 'Ditutup', count: getFilterCounts().closed },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return Colors.primary;
      case 'draft': return Colors.amber;
      case 'closed': return Colors.gray500;
      default: return Colors.gray500;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Dipublikasi';
      case 'draft': return 'Draft';
      case 'closed': return 'Ditutup';
      default: return 'Unknown';
    }
  };

  const formatDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hari ini';
    if (days === 1) return '1 hari yang lalu';
    if (days < 7) return `${days} hari yang lalu`;
    if (days < 30) return `${Math.floor(days / 7)} minggu yang lalu`;
    return `${Math.floor(days / 30)} bulan yang lalu`;
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>Memuat quiz...</Text>
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>Quiz & Evaluasi</Text>
            <Text style={styles.headerSubtitle}>
              Buat dan kelola quiz untuk evaluasi pembelajaran
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
              style={styles.createBtn}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color="rgba(255,255,255,0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari quiz..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </LinearGradient>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Filter Tabs ── */}
        <View style={[styles.filterSection, { backgroundColor: theme.surface }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabs}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterTab,
                  selectedFilter === filter.id && { backgroundColor: Colors.primary },
                  selectedFilter !== filter.id && { backgroundColor: theme.card }
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    selectedFilter === filter.id ? { color: Colors.white } : { color: theme.text }
                  ]}
                >
                  {filter.label}
                </Text>
                <View
                  style={[
                    styles.filterTabBadge,
                    selectedFilter === filter.id 
                      ? { backgroundColor: 'rgba(255,255,255,0.2)' }
                      : { backgroundColor: theme.border }
                  ]}
                >
                  <Text
                    style={[
                      styles.filterTabBadgeText,
                      selectedFilter === filter.id ? { color: Colors.white } : { color: theme.textMuted }
                    ]}
                  >
                    {filter.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Quick Stats ── */}
        <View style={[styles.statsSection, { backgroundColor: theme.background }]}>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="help-circle" size={18} color={Colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{quizzes.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Quiz</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.blueLight }]}>
                <Ionicons name="people" size={18} color={Colors.blue} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {quizzes.reduce((sum, q) => sum + q.attempts, 0)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Attempts</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.amberLight }]}>
                <Ionicons name="trophy" size={18} color={Colors.amber} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {quizzes.length > 0 ? Math.round(quizzes.reduce((sum, q) => sum + q.avgScore, 0) / quizzes.length) : 0}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Avg Score</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.roseLight }]}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.rose} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {quizzes.filter(q => q.status === 'published').length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Aktif</Text>
            </View>
          </View>
        </View>

        {/* ── Quiz List ── */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Quiz ({filteredQuizzes.length})
            </Text>
            <TouchableOpacity style={styles.sortBtn}>
              <Ionicons name="funnel-outline" size={16} color={theme.textMuted} />
              <Text style={[styles.sortBtnText, { color: theme.textMuted }]}>Urutkan</Text>
            </TouchableOpacity>
          </View>

          {filteredQuizzes.map((quiz) => (
            <View key={quiz.id} style={[styles.quizCard, { backgroundColor: theme.card }]}>
              <View style={styles.quizCardHeader}>
                <View style={styles.quizCardLeft}>
                  <View style={[styles.quizIcon, { backgroundColor: Colors.primaryLight }]}>
                    <Ionicons name="help-circle" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.quizInfo}>
                    <View style={styles.quizTopRow}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quiz.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(quiz.status) }]}>
                          {getStatusText(quiz.status)}
                        </Text>
                      </View>
                      <Text style={[styles.quizModule, { color: theme.textMuted }]}>Quiz Pembelajaran</Text>
                    </View>
                    <Text style={[styles.quizTitle, { color: theme.text }]} numberOfLines={2}>
                      {quiz.title}
                    </Text>
                    <View style={styles.quizMetaRow}>
                      <View style={styles.quizMetaItem}>
                        <Ionicons name="list-outline" size={12} color={theme.textMuted} />
                        <Text style={[styles.quizMetaText, { color: theme.textMuted }]}>
                          {quiz.questions.length} soal
                        </Text>
                      </View>
                      <View style={styles.quizMetaItem}>
                        <Ionicons name="time-outline" size={12} color={theme.textMuted} />
                        <Text style={[styles.quizMetaText, { color: theme.textMuted }]}>
                          {quiz.timeLimit} menit
                        </Text>
                      </View>
                      <View style={styles.quizMetaItem}>
                        <Ionicons name="people-outline" size={12} color={theme.textMuted} />
                        <Text style={[styles.quizMetaText, { color: theme.textMuted }]}>
                          {quiz.attempts} attempts
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.moreBtn}>
                  <Ionicons name="ellipsis-vertical" size={16} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              {quiz.status === 'published' && (
                <View style={styles.quizStats}>
                  <View style={styles.quizStat}>
                    <Text style={[styles.quizStatValue, { color: Colors.primary }]}>{quiz.avgScore}%</Text>
                    <Text style={[styles.quizStatLabel, { color: theme.textMuted }]}>Rata-rata Skor</Text>
                  </View>
                  <View style={styles.quizStatDivider} />
                  <View style={styles.quizStat}>
                    <Text style={[styles.quizStatValue, { color: Colors.blue }]}>{quiz.attempts}</Text>
                    <Text style={[styles.quizStatLabel, { color: theme.textMuted }]}>Total Percobaan</Text>
                  </View>
                  <View style={styles.quizStatDivider} />
                  <View style={styles.quizStat}>
                    <Text style={[styles.quizStatValue, { color: Colors.amber }]}>
                      {formatDate(quiz.updatedAt)}
                    </Text>
                    <Text style={[styles.quizStatLabel, { color: theme.textMuted }]}>Terakhir Update</Text>
                  </View>
                </View>
              )}

              <View style={styles.quizActions}>
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: theme.surface }]}
                  onPress={() => handleEditQuiz(quiz)}
                >
                  <Ionicons name="create-outline" size={16} color={Colors.primary} />
                  <Text style={[styles.actionBtnText, { color: Colors.primary }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: theme.surface }]}
                  onPress={() => handleViewResults(quiz)}
                >
                  <Ionicons name="bar-chart-outline" size={16} color={Colors.blue} />
                  <Text style={[styles.actionBtnText, { color: Colors.blue }]}>Hasil</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: theme.surface }]}
                  onPress={() => handleDuplicateQuiz(quiz)}
                >
                  <Ionicons name="copy-outline" size={16} color={Colors.amber} />
                  <Text style={[styles.actionBtnText, { color: Colors.amber }]}>Duplikat</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
      {/* Create Quiz Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Buat Quiz Baru</Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowCreateModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={[styles.createOption, { backgroundColor: theme.card }]}>
              <View style={[styles.createOptionIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="create-outline" size={24} color={Colors.primary} />
              </View>
              <View style={styles.createOptionContent}>
                <Text style={[styles.createOptionTitle, { color: theme.text }]}>Buat dari Awal</Text>
                <Text style={[styles.createOptionDesc, { color: theme.textMuted }]}>
                  Mulai dengan template kosong dan buat soal baru
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
            </View>

            <View style={[styles.createOption, { backgroundColor: theme.card }]}>
              <View style={[styles.createOptionIcon, { backgroundColor: Colors.blueLight }]}>
                <Ionicons name="copy-outline" size={24} color={Colors.blue} />
              </View>
              <View style={styles.createOptionContent}>
                <Text style={[styles.createOptionTitle, { color: theme.text }]}>Duplikasi Quiz</Text>
                <Text style={[styles.createOptionDesc, { color: theme.textMuted }]}>
                  Salin quiz yang sudah ada dan modifikasi
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
            </View>

            <View style={[styles.createOption, { backgroundColor: theme.card }]}>
              <View style={[styles.createOptionIcon, { backgroundColor: Colors.amberLight }]}>
                <Ionicons name="library-outline" size={24} color={Colors.amber} />
              </View>
              <View style={styles.createOptionContent}>
                <Text style={[styles.createOptionTitle, { color: theme.text }]}>Gunakan Template</Text>
                <Text style={[styles.createOptionDesc, { color: theme.textMuted }]}>
                  Pilih dari template quiz yang tersedia
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
            </View>

            <View style={[styles.createOption, { backgroundColor: theme.card }]}>
              <View style={[styles.createOptionIcon, { backgroundColor: Colors.roseLight }]}>
                <Ionicons name="cloud-upload-outline" size={24} color={Colors.rose} />
              </View>
              <View style={styles.createOptionContent}>
                <Text style={[styles.createOptionTitle, { color: theme.text }]}>Import Quiz</Text>
                <Text style={[styles.createOptionDesc, { color: theme.textMuted }]}>
                  Upload file quiz dari format CSV atau Excel
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  
  // Header Styles
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Search Bar
  searchContainer: { marginTop: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.white },

  // Filter Section
  filterSection: { paddingVertical: 16, borderBottomWidth: 1 },
  filterTabs: { paddingHorizontal: 20, gap: 12 },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  filterTabText: { fontSize: 14, fontWeight: '600' },
  filterTabBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  filterTabBadgeText: { fontSize: 10, fontWeight: '700' },

  // Stats Section
  statsSection: { paddingHorizontal: 20, paddingVertical: 20 },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 10, textAlign: 'center' },
  // Section Styles
  section: { paddingHorizontal: 20, paddingVertical: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4 },
  sortBtnText: { fontSize: 12, fontWeight: '500' },

  // Quiz Card Styles
  quizCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quizCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  quizCardLeft: { flex: 1, flexDirection: 'row', gap: 12 },
  quizIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizInfo: { flex: 1 },
  quizTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 9, fontWeight: '600' },
  quizModule: { fontSize: 11, flex: 1 },
  quizTitle: { fontSize: 14, fontWeight: '600', marginBottom: 6, lineHeight: 18 },
  quizMetaRow: { flexDirection: 'row', gap: 12 },
  quizMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  quizMetaText: { fontSize: 11 },
  moreBtn: { padding: 4 },

  // Quiz Stats
  quizStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  quizStat: { flex: 1, alignItems: 'center' },
  quizStatValue: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  quizStatLabel: { fontSize: 10, textAlign: 'center' },
  quizStatDivider: { width: 1, height: 24, backgroundColor: 'rgba(0,0,0,0.1)' },

  // Quiz Actions
  quizActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionBtnText: { fontSize: 11, fontWeight: '600' },

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
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalCloseBtn: { padding: 4 },
  modalContent: { padding: 20, gap: 12 },
  createOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  createOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createOptionContent: { flex: 1 },
  createOptionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  createOptionDesc: { fontSize: 13, lineHeight: 18 },
});