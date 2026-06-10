import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';

// Sample grading data
const SAMPLE_GRADES = [
  {
    id: '1',
    studentName: 'Ananta Ziaurohman Az Zaki',
    studentNim: '2210631170007',
    quizTitle: 'Quiz Asuhan Kehamilan - Pemeriksaan Fisik',
    module: 'Asuhan Kehamilan (ANC)',
    score: 85,
    maxScore: 100,
    completedAt: '2 jam yang lalu',
    status: 'graded',
    attempts: 1,
    timeSpent: '12 menit',
  },
  {
    id: '2',
    studentName: 'Sari Dewi Pratiwi',
    studentNim: '2210631170008',
    quizTitle: 'Quiz Asuhan Kehamilan - Pemeriksaan Fisik',
    module: 'Asuhan Kehamilan (ANC)',
    score: 78,
    maxScore: 100,
    completedAt: '3 jam yang lalu',
    status: 'graded',
    attempts: 2,
    timeSpent: '15 menit',
  },
  {
    id: '3',
    studentName: 'Maya Sari Indah',
    studentNim: '2210631170009',
    quizTitle: 'Evaluasi Teknik Palpasi Leopold',
    module: 'Asuhan Kehamilan (ANC)',
    score: 0,
    maxScore: 100,
    completedAt: '1 hari yang lalu',
    status: 'pending',
    attempts: 1,
    timeSpent: '8 menit',
  },
  {
    id: '4',
    studentName: 'Rina Safitri',
    studentNim: '2210631170010',
    quizTitle: 'Quiz Persalinan Normal - Kala I',
    module: 'Asuhan Persalinan Normal',
    score: 92,
    maxScore: 100,
    completedAt: '2 hari yang lalu',
    status: 'graded',
    attempts: 1,
    timeSpent: '18 menit',
  },
  {
    id: '5',
    studentName: 'Lila Permata Sari',
    studentNim: '2210631170011',
    quizTitle: 'Quiz Persalinan Normal - Kala I',
    module: 'Asuhan Persalinan Normal',
    score: 0,
    maxScore: 100,
    completedAt: '3 hari yang lalu',
    status: 'pending',
    attempts: 1,
    timeSpent: '10 menit',
  },
];

export default function PenilaianScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'Semua', count: SAMPLE_GRADES.length },
    { id: 'pending', label: 'Pending', count: SAMPLE_GRADES.filter(g => g.status === 'pending').length },
    { id: 'graded', label: 'Dinilai', count: SAMPLE_GRADES.filter(g => g.status === 'graded').length },
    { id: 'review', label: 'Review', count: 0 },
  ];

  const filteredGrades = SAMPLE_GRADES.filter(grade => {
    const matchesSearch = grade.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         grade.studentNim.includes(searchQuery) ||
                         grade.quizTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || grade.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return Colors.primary;
    if (percentage >= 70) return Colors.amber;
    if (percentage >= 60) return Colors.blue;
    return Colors.rose;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded': return Colors.primary;
      case 'pending': return Colors.amber;
      case 'review': return Colors.blue;
      default: return Colors.gray500;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'graded': return 'Dinilai';
      case 'pending': return 'Menunggu';
      case 'review': return 'Review';
      default: return 'Unknown';
    }
  };

  const pendingCount = SAMPLE_GRADES.filter(g => g.status === 'pending').length;
  const avgScore = Math.round(
    SAMPLE_GRADES.filter(g => g.status === 'graded')
                 .reduce((sum, g) => sum + g.score, 0) / 
    SAMPLE_GRADES.filter(g => g.status === 'graded').length
  );

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
            <Text style={styles.headerTitle}>Penilaian</Text>
            <Text style={styles.headerSubtitle}>
              Kelola dan review hasil quiz mahasiswa
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
            <TouchableOpacity style={styles.exportBtn}>
              <Ionicons name="download-outline" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color="rgba(255,255,255,0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari mahasiswa atau quiz..."
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
              <View style={[styles.statIconWrap, { backgroundColor: Colors.amberLight }]}>
                <Ionicons name="time" size={18} color={Colors.amber} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{pendingCount}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Menunggu Review</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {SAMPLE_GRADES.filter(g => g.status === 'graded').length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Sudah Dinilai</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.blueLight }]}>
                <Ionicons name="trophy" size={18} color={Colors.blue} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{avgScore}%</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Rata-rata Skor</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.roseLight }]}>
                <Ionicons name="document-text" size={18} color={Colors.rose} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{SAMPLE_GRADES.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Submissions</Text>
            </View>
          </View>
        </View>

        {/* ── Grading List ── */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Hasil Quiz ({filteredGrades.length})
            </Text>
            <TouchableOpacity style={styles.sortBtn}>
              <Ionicons name="funnel-outline" size={16} color={theme.textMuted} />
              <Text style={[styles.sortBtnText, { color: theme.textMuted }]}>Urutkan</Text>
            </TouchableOpacity>
          </View>

          {filteredGrades.map((grade) => (
            <TouchableOpacity
              key={grade.id}
              style={[styles.gradeCard, { backgroundColor: theme.card }]}
            >
              <View style={styles.gradeCardHeader}>
                <View style={styles.studentInfo}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentAvatarText}>
                      {grade.studentName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.studentDetails}>
                    <Text style={[styles.studentName, { color: theme.text }]} numberOfLines={1}>
                      {grade.studentName}
                    </Text>
                    <Text style={[styles.studentNim, { color: theme.textMuted }]}>
                      {grade.studentNim}
                    </Text>
                  </View>
                </View>
                <View style={styles.gradeInfo}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(grade.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(grade.status) }]}>
                      {getStatusText(grade.status)}
                    </Text>
                  </View>
                  {grade.status === 'graded' && (
                    <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(grade.score, grade.maxScore) + '20' }]}>
                      <Text style={[styles.scoreText, { color: getScoreColor(grade.score, grade.maxScore) }]}>
                        {grade.score}/{grade.maxScore}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.quizInfo}>
                <Text style={[styles.quizTitle, { color: theme.text }]} numberOfLines={2}>
                  {grade.quizTitle}
                </Text>
                <Text style={[styles.quizModule, { color: theme.textMuted }]} numberOfLines={1}>
                  {grade.module}
                </Text>
              </View>

              <View style={styles.gradeMeta}>
                <View style={styles.gradeMetaItem}>
                  <Ionicons name="time-outline" size={12} color={theme.textMuted} />
                  <Text style={[styles.gradeMetaText, { color: theme.textMuted }]}>
                    {grade.timeSpent}
                  </Text>
                </View>
                <View style={styles.gradeMetaItem}>
                  <Ionicons name="refresh-outline" size={12} color={theme.textMuted} />
                  <Text style={[styles.gradeMetaText, { color: theme.textMuted }]}>
                    {grade.attempts} percobaan
                  </Text>
                </View>
                <View style={styles.gradeMetaItem}>
                  <Ionicons name="calendar-outline" size={12} color={theme.textMuted} />
                  <Text style={[styles.gradeMetaText, { color: theme.textMuted }]}>
                    {grade.completedAt}
                  </Text>
                </View>
              </View>

              <View style={styles.gradeActions}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surface }]}>
                  <Ionicons name="eye-outline" size={14} color={Colors.primary} />
                  <Text style={[styles.actionBtnText, { color: Colors.primary }]}>Lihat Detail</Text>
                </TouchableOpacity>
                {grade.status === 'pending' && (
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.primaryLight }]}>
                    <Ionicons name="create-outline" size={14} color={Colors.primary} />
                    <Text style={[styles.actionBtnText, { color: Colors.primary }]}>Review</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surface }]}>
                  <Ionicons name="chatbubble-outline" size={14} color={Colors.blue} />
                  <Text style={[styles.actionBtnText, { color: Colors.blue }]}>Feedback</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  
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
  exportBtn: {
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
  // Grade Card Styles
  gradeCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  gradeCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  studentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  studentDetails: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  studentNim: { fontSize: 12 },
  gradeInfo: { alignItems: 'flex-end', gap: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  scoreBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  scoreText: { fontSize: 12, fontWeight: '700' },

  // Quiz Info
  quizInfo: { marginBottom: 12 },
  quizTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4, lineHeight: 18 },
  quizModule: { fontSize: 12 },

  // Grade Meta
  gradeMeta: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  gradeMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  gradeMetaText: { fontSize: 11 },

  // Grade Actions
  gradeActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionBtnText: { fontSize: 11, fontWeight: '600' },

  bottomPad: { height: 20 },
});