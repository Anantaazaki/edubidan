import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';

export default function QuizResultsScreen() {
  const router = useRouter();
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const { isDark, theme, toggleTheme } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hasil Quiz</Text>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <ScrollView>
        <View style={styles.emptyState}>
          <Ionicons name="bar-chart-outline" size={64} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Belum Ada Hasil</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
            Hasil quiz akan muncul setelah mahasiswa mengerjakan quiz ini.
          </Text>
          <TouchableOpacity
            style={[styles.backToQuizBtn, { backgroundColor: Colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backToQuizBtnText}>Kembali ke Quiz</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
  themeToggle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 60, gap: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  backToQuizBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  backToQuizBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});