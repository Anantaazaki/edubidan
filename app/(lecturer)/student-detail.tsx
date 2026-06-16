import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';

const SAMPLE_STUDENTS: Record<string, any> = {
  '1': { name: 'Ananta Ziaurohman Az Zaki', nim: '2210631170007', email: 'ananta@student.unsika.ac.id', progress: 85, completedModules: 4, totalModules: 5, lastActive: '2 jam yang lalu', status: 'active', joinDate: 'Sep 2022' },
  '2': { name: 'Sari Dewi Pratiwi', nim: '2210631170008', email: 'sari.dewi@student.unsika.ac.id', progress: 72, completedModules: 3, totalModules: 5, lastActive: '1 hari yang lalu', status: 'active', joinDate: 'Sep 2022' },
  '3': { name: 'Maya Sari Indah', nim: '2210631170009', email: 'maya.sari@student.unsika.ac.id', progress: 45, completedModules: 2, totalModules: 5, lastActive: '3 hari yang lalu', status: 'active', joinDate: 'Sep 2022' },
  '4': { name: 'Rina Safitri', nim: '2210631170010', email: 'rina.safitri@student.unsika.ac.id', progress: 92, completedModules: 5, totalModules: 5, lastActive: '5 jam yang lalu', status: 'active', joinDate: 'Sep 2022' },
  '5': { name: 'Lila Permata Sari', nim: '2210631170011', email: 'lila.permata@student.unsika.ac.id', progress: 30, completedModules: 1, totalModules: 5, lastActive: '1 minggu yang lalu', status: 'inactive', joinDate: 'Sep 2022' },
};

export default function StudentDetailScreen() {
  const router = useRouter();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const { isDark, theme, toggleTheme } = useTheme();

  const student = SAMPLE_STUDENTS[studentId || '1'] || SAMPLE_STUDENTS['1'];

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Mahasiswa</Text>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
          </View>
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentNim}>NIM: {student.nim}</Text>
          <View style={[styles.statusBadge, { backgroundColor: student.status === 'active' ? Colors.greenLight : Colors.roseLight }]}>
            <Text style={[styles.statusText, { color: student.status === 'active' ? Colors.green : Colors.rose }]}>
              {student.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: theme.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{student.progress}%</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Progress</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.blue }]}>{student.completedModules}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Materi Selesai</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.amber }]}>{student.totalModules}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Materi</Text>
          </View>
        </View>

        {/* Info */}
        <View style={[styles.infoSection, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Informasi Mahasiswa</Text>
          {[
            { icon: 'mail-outline', label: 'Email', value: student.email },
            { icon: 'time-outline', label: 'Terakhir Aktif', value: student.lastActive },
            { icon: 'calendar-outline', label: 'Bergabung', value: student.joinDate },
          ].map((item, i) => (
            <View key={i} style={[styles.infoRow, { borderBottomColor: theme.border }]}>
              <Ionicons name={item.icon as any} size={18} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{item.label}</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressSection, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Progress Pembelajaran</Text>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View style={[styles.progressFill, { width: `${student.progress}%`, backgroundColor: Colors.primary }]} />
          </View>
          <Text style={[styles.progressText, { color: theme.textMuted }]}>
            {student.completedModules} dari {student.totalModules} materi selesai ({student.progress}%)
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
  themeToggle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  profileSection: { alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.white, marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '800', color: Colors.white },
  studentName: { fontSize: 20, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  studentNim: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', margin: 20, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  infoSection: { marginHorizontal: 20, marginBottom: 16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600' },
  progressSection: { marginHorizontal: 20, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 13 },
});