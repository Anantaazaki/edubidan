import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StudentWithGrades {
  id: string;
  name: string;
  nim: string;
  email: string;
  quizCount: number;
  avgScore: number;
  lastQuiz: string;
}

export default function MahasiswaScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentWithGrades[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    // Tampilkan cache dulu (instant)
    try {
      const cached = await AsyncStorage.getItem('@lecturer_students_cache');
      if (cached) {
        setStudents(JSON.parse(cached));
        setLoading(false);
      }
    } catch (_) {}

    // Update dari Firestore di background
    try {
      const [studentsSnap, gradesSnap] = await Promise.all([
        getDocs(collection(db, 'students')),
        getDocs(collection(db, 'grades')),
      ]);

      const grades = gradesSnap.docs.map(d => d.data());
      let studentsData: any[] = [];

      if (studentsSnap.empty) {
        const sample = [
          { id: '1', name: 'Ananta Ziaurohman Az Zaki', nim: '2210631170007', email: 'ananta@student.unsika.ac.id' },
          { id: '2', name: 'Sari Dewi Pratiwi', nim: '2210631170008', email: 'sari.dewi@student.unsika.ac.id' },
          { id: '3', name: 'Maya Sari Indah', nim: '2210631170009', email: 'maya.sari@student.unsika.ac.id' },
          { id: '4', name: 'Rina Safitri', nim: '2210631170010', email: 'rina.safitri@student.unsika.ac.id' },
          { id: '5', name: 'Lila Permata Sari', nim: '2210631170011', email: 'lila.permata@student.unsika.ac.id' },
        ];
        for (const s of sample) await setDoc(doc(db, 'students', s.id), s);
        studentsData = sample;
      } else {
        studentsData = studentsSnap.docs.map(d => ({ ...d.data(), id: d.id }));
      }

      const combined: StudentWithGrades[] = studentsData.map(s => {
        const studentGrades = grades.filter(g => g.studentName === s.name || g.studentNim === s.nim);
        const quizCount = studentGrades.length;
        const avgScore = quizCount > 0
          ? Math.round(studentGrades.reduce((sum, g) => sum + ((g.score / g.maxScore) * 100), 0) / quizCount)
          : 0;
        const lastGrade = studentGrades[studentGrades.length - 1];
        return { id: s.id, name: s.name, nim: s.nim, email: s.email, quizCount, avgScore, lastQuiz: lastGrade?.quizTitle || '-' };
      });

      setStudents(combined);
      // Simpan ke cache
      await AsyncStorage.setItem('@lecturer_students_cache', JSON.stringify(combined));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(s =>
    !searchQuery.trim() ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nim.includes(searchQuery)
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return Colors.green;
    if (score >= 60) return Colors.amber;
    if (score === 0) return Colors.gray500;
    return Colors.rose;
  };

  const renderItem = ({ item }: { item: StudentWithGrades }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card }]}
      onPress={() => router.push(`/(lecturer)/student-detail?studentId=${item.id}`)}
      activeOpacity={0.8}
    >
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.nim, { color: theme.textMuted }]}>NIM: {item.nim}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="help-circle-outline" size={12} color={Colors.primary} />
            <Text style={[styles.statText, { color: Colors.primary }]}>
              {item.quizCount} quiz
            </Text>
          </View>
          {item.quizCount > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="trophy-outline" size={12} color={getScoreColor(item.avgScore)} />
              <Text style={[styles.statText, { color: getScoreColor(item.avgScore) }]}>
                Rata-rata {item.avgScore}%
              </Text>
            </View>
          )}
        </View>
        {item.lastQuiz !== '-' && (
          <Text style={[styles.lastQuiz, { color: theme.textMuted }]} numberOfLines={1}>
            Terakhir: {item.lastQuiz}
          </Text>
        )}
      </View>

      {/* Score badge */}
      <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(item.avgScore) + '20' }]}>
        <Text style={[styles.scoreText, { color: getScoreColor(item.avgScore) }]}>
          {item.quizCount > 0 ? `${item.avgScore}%` : '-'}
        </Text>
        <Text style={[styles.scoreLabel, { color: getScoreColor(item.avgScore) }]}>nilai</Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* Header */}
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Mahasiswa & Penilaian</Text>
            <Text style={styles.headerSubtitle}>
              {students.length} mahasiswa • {students.reduce((sum, s) => sum + s.quizCount, 0)} quiz dikerjakan
            </Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="rgba(255,255,255,0.6)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama atau NIM..."
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

      {/* Stats bar */}
      <View style={[styles.statsBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.statBarItem}>
          <Text style={[styles.statBarValue, { color: Colors.primary }]}>{students.length}</Text>
          <Text style={[styles.statBarLabel, { color: theme.textMuted }]}>Total</Text>
        </View>
        <View style={[styles.statBarDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statBarItem}>
          <Text style={[styles.statBarValue, { color: Colors.green }]}>
            {students.filter(s => s.avgScore >= 80).length}
          </Text>
          <Text style={[styles.statBarLabel, { color: theme.textMuted }]}>Nilai Baik</Text>
        </View>
        <View style={[styles.statBarDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statBarItem}>
          <Text style={[styles.statBarValue, { color: Colors.amber }]}>
            {students.filter(s => s.quizCount === 0).length}
          </Text>
          <Text style={[styles.statBarLabel, { color: theme.textMuted }]}>Belum Quiz</Text>
        </View>
        <View style={[styles.statBarDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statBarItem}>
          <Text style={[styles.statBarValue, { color: Colors.blue }]}>
            {students.length > 0
              ? Math.round(students.reduce((sum, s) => sum + s.avgScore, 0) / students.length)
              : 0}%
          </Text>
          <Text style={[styles.statBarLabel, { color: theme.textMuted }]}>Rata-rata</Text>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>Memuat data...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadData}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={56} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {searchQuery ? 'Tidak ada hasil' : 'Belum ada mahasiswa'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.white, marginBottom: 2 },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  searchInput: { flex: 1, fontSize: 14, color: Colors.white },
  statsBar: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1 },
  statBarItem: { flex: 1, alignItems: 'center' },
  statBarValue: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  statBarLabel: { fontSize: 10 },
  statBarDivider: { width: 1, marginVertical: 4 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14 },
  list: { padding: 16, paddingBottom: 32 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 18, fontWeight: '700', color: Colors.white },
  cardInfo: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  nim: { fontSize: 11, marginBottom: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 2 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: { fontSize: 11, fontWeight: '600' },
  lastQuiz: { fontSize: 10 },
  scoreBadge: { alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 10, minWidth: 44 },
  scoreText: { fontSize: 14, fontWeight: '800' },
  scoreLabel: { fontSize: 9, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
});