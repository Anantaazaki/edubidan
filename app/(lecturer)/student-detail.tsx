import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { db } from '../../src/config/firebase';

interface GradeItem {
  id: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  completedAt: string;
  status: string;
}

interface StudentInfo {
  name: string;
  email: string;
  nim: string;
  prodi?: string;
  joinDate?: string;
}

export default function StudentDetailScreen() {
  const router = useRouter();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const { isDark, theme, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [grades, setGrades] = useState<GradeItem[]>([]);

  useEffect(() => { loadData(); }, [studentId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load student data dari Firestore (students collection)
      const studentDoc = await getDoc(doc(db, 'students', studentId || '1'));
      if (studentDoc.exists()) {
        const data = studentDoc.data();
        setStudent({
          name: data.name,
          email: data.email,
          nim: data.nim,
          prodi: data.prodi || 'Kebidanan',
          joinDate: data.joinDate || '-',
        });
      } else {
        // Fallback: cari di users collection
        const usersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
        const found = usersSnap.docs.find(d => d.id === studentId);
        if (found) {
          const data = found.data();
          setStudent({
            name: data.name, email: data.email, nim: data.nim,
            prodi: data.prodi || 'Kebidanan', joinDate: '-',
          });
        }
      }

      // Load nilai dari Firestore grades collection
      const gradesSnap = await getDocs(
        query(collection(db, 'grades'), where('studentNim', '==', studentDoc.data()?.nim || ''))
      );
      
      if (!gradesSnap.empty) {
        setGrades(gradesSnap.docs.map(d => ({ ...d.data(), id: d.id } as GradeItem)));
      } else {
        // Load semua grades dan filter by student name
        const allGrades = await getDocs(collection(db, 'grades'));
        const studentData = studentDoc.data();
        const filtered = allGrades.docs
          .filter(d => d.data().studentName === studentData?.name)
          .map(d => ({ ...d.data(), id: d.id } as GradeItem));
        setGrades(filtered);
      }
    } catch (error) {
      console.error('Error loading student detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const avgScore = grades.length > 0
    ? Math.round(grades.reduce((sum, g) => sum + (g.score / g.maxScore * 100), 0) / grades.length)
    : 0;

  const getScoreColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return Colors.green;
    if (pct >= 60) return Colors.amber;
    return Colors.rose;
  };

  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!student) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
        <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Mahasiswa</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
        <View style={styles.emptyState}>
          <Ionicons name="person-outline" size={64} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Data tidak ditemukan</Text>
          <TouchableOpacity style={[styles.backToBtn, { backgroundColor: Colors.primary }]} onPress={() => router.back()}>
            <Text style={styles.backToBtnText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* Header */}
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Mahasiswa</Text>
          <TouchableOpacity style={styles.backBtn} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Avatar + Nama */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{student.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentNim}>NIM: {student.nim}</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: theme.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{grades.length}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Quiz Dikerjakan</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.amber }]}>{avgScore}%</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Nilai Rata-rata</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.green }]}>
              {grades.filter(g => (g.score / g.maxScore) >= 0.6).length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Lulus</Text>
          </View>
        </View>

        {/* Info Mahasiswa */}
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Informasi Mahasiswa</Text>
          {[
            { icon: 'mail-outline', label: 'Email', value: student.email },
            { icon: 'school-outline', label: 'Program Studi', value: student.prodi || 'Kebidanan' },
            { icon: 'calendar-outline', label: 'Bergabung', value: student.joinDate || '-' },
          ].map((item, i) => (
            <View key={i} style={[styles.infoRow, { borderBottomColor: theme.border }]}>
              <View style={[styles.infoIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name={item.icon as any} size={16} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{item.label}</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Riwayat Quiz */}
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Riwayat Quiz ({grades.length})
          </Text>

          {grades.length === 0 ? (
            <View style={styles.emptyGrades}>
              <Ionicons name="help-circle-outline" size={40} color={theme.textMuted} />
              <Text style={[styles.emptyGradesText, { color: theme.textMuted }]}>
                Belum ada quiz yang dikerjakan
              </Text>
            </View>
          ) : (
            grades.map((grade, i) => (
              <View key={grade.id} style={[styles.gradeItem, { borderBottomColor: theme.border }]}>
                <View style={styles.gradeLeft}>
                  <Text style={[styles.gradeTitle, { color: theme.text }]} numberOfLines={2}>
                    {grade.quizTitle}
                  </Text>
                  <Text style={[styles.gradeDate, { color: theme.textMuted }]}>
                    {grade.completedAt}
                  </Text>
                </View>
                <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(grade.score, grade.maxScore) + '20' }]}>
                  <Text style={[styles.scoreText, { color: getScoreColor(grade.score, grade.maxScore) }]}>
                    {grade.score}/{grade.maxScore}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
  profileSection: { alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.white, marginBottom: 10 },
  avatarText: { fontSize: 26, fontWeight: '800', color: Colors.white },
  studentName: { fontSize: 18, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  studentNim: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  statsRow: { flexDirection: 'row', margin: 16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11, textAlign: 'center' },
  statDivider: { width: 1 },
  infoCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1 },
  infoIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600' },
  gradeItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  gradeLeft: { flex: 1, marginRight: 12 },
  gradeTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  gradeDate: { fontSize: 11 },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  scoreText: { fontSize: 13, fontWeight: '700' },
  emptyGrades: { alignItems: 'center', paddingVertical: 24, gap: 10 },
  emptyGradesText: { fontSize: 13 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
  backToBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  backToBtnText: { color: Colors.white, fontWeight: '700' },
});