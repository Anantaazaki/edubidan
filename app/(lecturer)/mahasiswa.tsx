import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { collection, getDocs, query, where, setDoc, doc } from 'firebase/firestore';
import { db } from '../../src/config/firebase';

interface StudentData {
  id: string;
  name: string;
  nim: string;
  email: string;
  avatar: string | null;
  progress: number;
  completedModules: number;
  totalModules: number;
  lastActive: string;
  status: string;
  joinDate: string;
}

export default function MahasiswaScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentData[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(query(collection(db, 'students')));
      
      if (snap.empty) {
        // Seed data mahasiswa ke Firestore
        const sampleStudents: StudentData[] = [
          { id: '1', name: 'Ananta Ziaurohman Az Zaki', nim: '2210631170007', email: 'ananta@student.unsika.ac.id', avatar: null, progress: 85, completedModules: 4, totalModules: 5, lastActive: '2 jam yang lalu', status: 'active', joinDate: 'Sep 2022' },
          { id: '2', name: 'Sari Dewi Pratiwi', nim: '2210631170008', email: 'sari.dewi@student.unsika.ac.id', avatar: null, progress: 72, completedModules: 3, totalModules: 5, lastActive: '1 hari yang lalu', status: 'active', joinDate: 'Sep 2022' },
          { id: '3', name: 'Maya Sari Indah', nim: '2210631170009', email: 'maya.sari@student.unsika.ac.id', avatar: null, progress: 45, completedModules: 2, totalModules: 5, lastActive: '3 hari yang lalu', status: 'active', joinDate: 'Sep 2022' },
          { id: '4', name: 'Rina Safitri', nim: '2210631170010', email: 'rina.safitri@student.unsika.ac.id', avatar: null, progress: 92, completedModules: 5, totalModules: 5, lastActive: '5 jam yang lalu', status: 'active', joinDate: 'Sep 2022' },
          { id: '5', name: 'Lila Permata Sari', nim: '2210631170011', email: 'lila.permata@student.unsika.ac.id', avatar: null, progress: 30, completedModules: 1, totalModules: 5, lastActive: '1 minggu yang lalu', status: 'inactive', joinDate: 'Sep 2022' },
        ];
        
        // Simpan ke Firestore
        for (const s of sampleStudents) {
          await setDoc(doc(db, 'students', s.id), s);
        }
        setStudents(sampleStudents);
      } else {
        const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as StudentData));
        setStudents(data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      // Fallback offline
      setStudents([
        { id: '1', name: 'Ananta Ziaurohman Az Zaki', nim: '2210631170007', email: 'ananta@student.unsika.ac.id', avatar: null, progress: 85, completedModules: 4, totalModules: 5, lastActive: '2 jam yang lalu', status: 'active', joinDate: 'Sep 2022' },
        { id: '2', name: 'Sari Dewi Pratiwi', nim: '2210631170008', email: 'sari.dewi@student.unsika.ac.id', avatar: null, progress: 72, completedModules: 3, totalModules: 5, lastActive: '1 hari yang lalu', status: 'active', joinDate: 'Sep 2022' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { id: 'all', label: 'Semua', count: students.length },
    { id: 'active', label: 'Aktif', count: students.filter(s => s.status === 'active').length },
    { id: 'inactive', label: 'Tidak Aktif', count: students.filter(s => s.status === 'inactive').length },
    { id: 'completed', label: 'Selesai', count: students.filter(s => s.completedModules >= s.totalModules).length },
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.nim.includes(searchQuery) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' ||
                         (selectedFilter === 'completed' && student.completedModules >= student.totalModules) ||
                         student.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return Colors.primary;
      case 'inactive': return Colors.gray500;
      default: return Colors.gray500;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return Colors.primary;
    if (progress >= 60) return Colors.amber;
    return Colors.rose;
  };

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
            <Text style={styles.headerTitle}>Mahasiswa</Text>
            <Text style={styles.headerSubtitle}>
              Pantau progress dan aktivitas mahasiswa
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
              placeholder="Cari mahasiswa..."
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
                <Ionicons name="people" size={18} color={Colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{students.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Mahasiswa</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.blueLight }]}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.blue} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {students.filter(s => s.status === 'active').length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Aktif</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.amberLight }]}>
                <Ionicons name="trophy" size={18} color={Colors.amber} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {students.filter(s => s.completedModules >= s.totalModules).length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Selesai</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.roseLight }]}>
                <Ionicons name="trending-up" size={18} color={Colors.rose} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length) : 0}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Avg Progress</Text>
            </View>
          </View>
        </View>

        {/* ── Student List ── */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Daftar Mahasiswa ({filteredStudents.length})
            </Text>
            <TouchableOpacity style={styles.sortBtn}>
              <Ionicons name="funnel-outline" size={16} color={theme.textMuted} />
              <Text style={[styles.sortBtnText, { color: theme.textMuted }]}>Urutkan</Text>
            </TouchableOpacity>
          </View>

          {filteredStudents.map((student) => (
            <TouchableOpacity
              key={student.id}
              style={[styles.studentCard, { backgroundColor: theme.card }]}
              onPress={() => router.push(`/(lecturer)/student-detail?studentId=${student.id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.studentAvatar}>
                <Text style={styles.studentAvatarText}>
                  {student.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, { color: theme.text }]} numberOfLines={1}>
                  {student.name}
                </Text>
                <Text style={[styles.studentNim, { color: theme.textMuted }]}>
                  NIM: {student.nim}
                </Text>
                <Text style={[styles.studentNim, { color: theme.textMuted }]} numberOfLines={1}>
                  {student.email}
                </Text>
                <View style={styles.studentMeta}>
                  <Ionicons name="help-circle-outline" size={12} color={Colors.primary} />
                  <Text style={[styles.studentMetaText, { color: Colors.primary }]}>
                    {student.completedModules || 0} quiz dikerjakan
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
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

  // Student Card Styles
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  studentCardLeft: { flex: 1, flexDirection: 'row', gap: 12 },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  studentAvatarText: { fontSize: 18, fontWeight: '700', color: Colors.white },
  statusIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  studentInfo: { flex: 1 },
  studentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  studentName: { flex: 1, fontSize: 16, fontWeight: '600' },
  progressBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  progressText: { fontSize: 11, fontWeight: '700' },
  studentNim: { fontSize: 12, marginBottom: 8 },
  studentMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  studentMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  studentMetaText: { fontSize: 10 },
  progressContainer: { marginTop: 4 },
  progressBg: { height: 4, borderRadius: 2 },
  progressFill: { height: 4, borderRadius: 2 },
  moreBtn: { padding: 4 },

  bottomPad: { height: 20 },
});