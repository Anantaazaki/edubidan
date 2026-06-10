import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';

// Safe modules data
const MODULES = [
  { id: '1', title: 'Asuhan Kehamilan (ANC)', category: 'Kehamilan', color: '#FF6B9D', videos: 12 },
  { id: '2', title: 'Asuhan Persalinan Normal', category: 'Persalinan', color: '#4ECDC4', videos: 15 },
  { id: '3', title: 'Asuhan Masa Nifas', category: 'Nifas', color: '#8B5CF6', videos: 10 },
  { id: '4', title: 'Asuhan Bayi Baru Lahir', category: 'Neonatus', color: '#F59E0B', videos: 14 },
  { id: '5', title: 'Manajemen Laktasi', category: 'Laktasi', color: '#3B82F6', videos: 11 },
];

const { width } = Dimensions.get('window');

const STATS = [
  { value: '5', label: 'Modul\nPembelajaran', icon: 'book-outline' as const },
  { value: '62+', label: 'Video\nEdukasi', icon: 'play-circle-outline' as const },
  { value: '50+', label: 'Soal\nKuis', icon: 'help-circle-outline' as const },
  { value: '100%', label: 'Gratis\nAkses', icon: 'star-outline' as const },
];

const FEATURES = [
  {
    icon: 'play-circle-outline' as const,
    title: 'Video Pembelajaran',
    description: 'Video tutorial berkualitas tinggi untuk setiap prosedur kebidanan',
    color: '#FF6B9D'
  },
  {
    icon: 'help-circle-outline' as const,
    title: 'Kuis Interaktif',
    description: 'Evaluasi pemahaman dengan kuis di setiap akhir modul',
    color: '#4ECDC4'
  },
  {
    icon: 'construct-outline' as const,
    title: 'Panduan Alat',
    description: 'Daftar lengkap alat dan bahan yang dibutuhkan',
    color: '#8B5CF6'
  },
  {
    icon: 'list-outline' as const,
    title: 'Langkah Prosedur',
    description: 'Step-by-step prosedur yang mudah diikuti',
    color: '#F59E0B'
  },
];

const TOPICS = [
  { label: 'Kehamilan', icon: 'heart-outline' as const, color: '#FF6B9D', desc: 'Asuhan Antenatal Care' },
  { label: 'Persalinan', icon: 'medical-outline' as const, color: '#4ECDC4', desc: 'Pertolongan Persalinan Normal' },
  { label: 'Nifas', icon: 'flower-outline' as const, color: '#8B5CF6', desc: 'Perawatan Masa Nifas' },
  { label: 'Neonatus', icon: 'happy-outline' as const, color: '#F59E0B', desc: 'Asuhan Bayi Baru Lahir' },
  { label: 'Laktasi', icon: 'nutrition-outline' as const, color: '#3B82F6', desc: 'Manajemen Menyusui' },
];

export default function LandingScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'light-content'} backgroundColor={Colors.primaryDark} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Section ── */}
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary, '#00C9A7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* Decorative circles */}
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />

          <View style={styles.heroContent}>
            {/* Theme Toggle Button */}
            <TouchableOpacity
              style={styles.themeToggle}
              onPress={toggleTheme}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={isDark ? 'sunny' : 'moon'} 
                size={20} 
                color={Colors.white} 
              />
            </TouchableOpacity>

            {/* Badge */}
            <View style={styles.badge}>
              <Ionicons name="school-outline" size={14} color={Colors.white} />
              <Text style={styles.badgeText}>Platform Edukasi Kebidanan #1</Text>
            </View>

            {/* Main Title */}
            <Text style={styles.heroTitle}>EduBidan</Text>
            <Text style={styles.heroSubtitle}>
              Platform pembelajaran kebidanan terlengkap dengan video interaktif, 
              kuis evaluasi, dan panduan prosedur untuk mahasiswa kebidanan
            </Text>

            {/* CTA Buttons */}
            <View style={styles.ctaRow}>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => router.push('/(auth)/register')}
                activeOpacity={0.85}
              >
                <Text style={styles.btnPrimaryText}>Mulai Belajar</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.85}
              >
                <Text style={styles.btnSecondaryText}>Masuk</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* ── Statistics Section ── */}
        <View style={[styles.statsSection, { backgroundColor: theme.surface }]}>
          <View style={styles.statsGrid}>
            {STATS.map((stat, index) => (
              <View key={index} style={[styles.statCard, { backgroundColor: theme.card }]}>
                <View style={[styles.statIconWrap, { backgroundColor: Colors.primaryLight }]}>
                  <Ionicons name={stat.icon} size={24} color={Colors.primary} />
                </View>
                <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Features Section ── */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Fitur Unggulan</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
            Belajar kebidanan dengan metode yang efektif dan menyenangkan
          </Text>
          <View style={styles.featuresGrid}>
            {FEATURES.map((feature, index) => (
              <View key={index} style={[styles.featureCard, { backgroundColor: theme.card }]}>
                <View style={[styles.featureIconWrap, { backgroundColor: feature.color + '20' }]}>
                  <Ionicons name={feature.icon} size={28} color={feature.color} />
                </View>
                <Text style={[styles.featureTitle, { color: theme.text }]}>{feature.title}</Text>
                <Text style={[styles.featureDescription, { color: theme.textMuted }]}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── About Section ── */}
        <View style={[styles.section, { backgroundColor: theme.surfaceSecondary }]}>
          <View style={styles.aboutContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Tentang EduBidan</Text>
            <View style={[styles.aboutCard, { backgroundColor: theme.card }]}>
              <View style={styles.aboutIconWrap}>
                <Ionicons name="school" size={32} color={Colors.primary} />
              </View>
              <View style={styles.aboutContent}>
                <Text style={[styles.aboutTitle, { color: theme.text }]}>Platform Pembelajaran Terpercaya</Text>
                <Text style={[styles.aboutText, { color: theme.textMuted }]}>
                  EduBidan adalah aplikasi pembelajaran kebidanan berbasis video yang dirancang khusus 
                  untuk mahasiswa kebidanan. Dilengkapi dengan modul interaktif, video tutorial berkualitas tinggi, 
                  dan sistem evaluasi yang komprehensif untuk membantu mahasiswa memahami prosedur kebidanan 
                  dengan lebih mudah dan efektif.
                </Text>
                <View style={styles.aboutFeatures}>
                  <View style={styles.aboutFeatureItem}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                    <Text style={[styles.aboutFeatureText, { color: theme.text }]}>Materi Terupdate</Text>
                  </View>
                  <View style={styles.aboutFeatureItem}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                    <Text style={[styles.aboutFeatureText, { color: theme.text }]}>Video HD Quality</Text>
                  </View>
                  <View style={styles.aboutFeatureItem}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                    <Text style={styles.aboutFeatureText}>Akses Selamanya</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── Learning Topics ── */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Topik Pembelajaran</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
            5 modul pembelajaran kebidanan yang komprehensif dan terstruktur
          </Text>
          <View style={styles.topicsGrid}>
            {TOPICS.map((topic, index) => (
              <View key={index} style={[styles.topicCard, { backgroundColor: theme.card, borderLeftColor: topic.color }]}>
                <View style={[styles.topicIconWrap, { backgroundColor: topic.color + '20' }]}>
                  <Ionicons name={topic.icon} size={24} color={topic.color} />
                </View>
                <View style={styles.topicContent}>
                  <Text style={[styles.topicLabel, { color: theme.text }]}>{topic.label}</Text>
                  <Text style={[styles.topicDesc, { color: theme.textMuted }]}>{topic.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Modules Preview ── */}
        <View style={[styles.section, { backgroundColor: theme.surfaceSecondary }]}>
          <View style={styles.modulesContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Modul Tersedia</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
              Pelajari setiap aspek kebidanan dengan modul yang telah disusun secara sistematis
            </Text>
            {MODULES.map((module, index) => (
              <View key={module.id} style={[styles.modulePreviewCard, { backgroundColor: theme.card }]}>
                <View style={[styles.moduleColorBar, { backgroundColor: module.color }]} />
                <View style={styles.modulePreviewContent}>
                  <View style={styles.modulePreviewHeader}>
                    <View style={[styles.moduleCategoryBadge, { backgroundColor: module.color + '20' }]}>
                      <Text style={[styles.moduleCategoryText, { color: module.color }]}>
                        {module.category}
                      </Text>
                    </View>
                    <View style={styles.modulePreviewMeta}>
                      <Ionicons name="play-circle-outline" size={14} color={theme.textMuted} />
                      <Text style={[styles.modulePreviewMetaText, { color: theme.textMuted }]}>{module.videos} video</Text>
                    </View>
                  </View>
                  <Text style={[styles.modulePreviewTitle, { color: theme.text }]}>{module.title}</Text>
                  <View style={styles.modulePreviewActions}>
                    <TouchableOpacity 
                      style={[styles.modulePreviewBtn, { backgroundColor: module.color }]}
                      onPress={() => router.push('/(auth)/login')}
                    >
                      <Text style={styles.modulePreviewBtnText}>Lihat Modul</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Testimonial Section ── */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Apa Kata Mahasiswa</Text>
          <View style={[styles.testimonialCard, { backgroundColor: theme.card }]}>
            <View style={styles.testimonialQuote}>
              <Ionicons name="chatbubble-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={[styles.testimonialText, { color: theme.textMuted }]}>
              "EduBidan sangat membantu saya memahami prosedur kebidanan dengan lebih baik. 
              Video-videonya jelas dan mudah diikuti. Sangat recommended untuk mahasiswa kebidanan!"
            </Text>
            <View style={styles.testimonialAuthor}>
              <View style={styles.testimonialAvatar}>
                <Text style={styles.testimonialAvatarText}>S</Text>
              </View>
              <View>
                <Text style={[styles.testimonialName, { color: theme.text }]}>Sari Dewi</Text>
                <Text style={[styles.testimonialRole, { color: theme.textMuted }]}>Mahasiswa Kebidanan UNSIKA</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Final CTA Section ── */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.footerCta}
        >
          <View style={styles.footerCtaContent}>
            <Text style={styles.footerCtaTitle}>Siap Memulai Perjalanan Belajarmu?</Text>
            <Text style={styles.footerCtaSubtitle}>
              Bergabung dengan ribuan mahasiswa kebidanan lainnya dan tingkatkan 
              kompetensimu dengan EduBidan
            </Text>
            <View style={styles.footerCtaButtons}>
              <TouchableOpacity
                style={styles.footerCtaBtn}
                onPress={() => router.push('/(auth)/register')}
                activeOpacity={0.85}
              >
                <Text style={styles.footerCtaBtnText}>Daftar Gratis Sekarang</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.footerCtaBtnSecondary}
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.85}
              >
                <Text style={styles.footerCtaBtnSecondaryText}>Sudah Punya Akun?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* ── Footer ── */}
        <View style={[styles.footer, { backgroundColor: theme.surfaceSecondary }]}>
          <View style={styles.footerContent}>
            <View style={styles.footerBrand}>
              <Text style={[styles.footerBrandText, { color: theme.text }]}>EduBidan</Text>
              <Text style={[styles.footerBrandSubtext, { color: theme.textMuted }]}>Platform Edukasi Kebidanan</Text>
            </View>
            <View style={styles.footerLinks}>
              <TouchableOpacity style={styles.footerLink}>
                <Text style={[styles.footerLinkText, { color: theme.textMuted }]}>Tentang Kami</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerLink}>
                <Text style={[styles.footerLinkText, { color: theme.textMuted }]}>Kontak</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerLink}>
                <Text style={[styles.footerLinkText, { color: theme.textMuted }]}>Bantuan</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.footerDivider, { backgroundColor: theme.border }]} />
            <Text style={[styles.footerCopyright, { color: theme.textMuted }]}>
              © 2024 EduBidan · Universitas Singaperbangsa Karawang
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },

  // Hero Section
  hero: {
    paddingTop: 60,
    paddingBottom: 48,
    paddingHorizontal: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  circle1: { width: 200, height: 200, top: -60, right: -60 },
  circle2: { width: 140, height: 140, bottom: -40, left: -40 },
  circle3: { width: 80, height: 80, top: 80, right: 60 },
  heroContent: { position: 'relative', zIndex: 1 },
  themeToggle: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: { color: Colors.white, fontSize: 12, fontWeight: '600' },
  heroTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -1,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 320,
  },
  ctaRow: { flexDirection: 'row', gap: 12 },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimaryText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  btnSecondary: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnSecondaryText: { color: Colors.white, fontWeight: '700', fontSize: 15 },

  // Statistics Section
  statsSection: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  statCard: { alignItems: 'center', gap: 8 },
  statIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, textAlign: 'center', lineHeight: 16 },

  // Sections
  section: { paddingHorizontal: 20, paddingVertical: 32 },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },

  // Features Section
  featuresGrid: { gap: 20 },
  featureCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.slate900,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.slate600,
    textAlign: 'center',
    lineHeight: 20,
  },

  // About Section
  aboutContainer: { paddingHorizontal: 0 },
  aboutCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  aboutIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  aboutContent: { alignItems: 'center' },
  aboutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.slate900,
    marginBottom: 12,
    textAlign: 'center',
  },
  aboutText: {
    fontSize: 15,
    color: Colors.slate600,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  aboutFeatures: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  aboutFeatureItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aboutFeatureText: { fontSize: 14, color: Colors.slate700, fontWeight: '600' },

  // Topics Section
  topicsGrid: { gap: 16 },
  topicCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  topicIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicContent: { flex: 1 },
  topicLabel: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  topicDesc: { fontSize: 13 },

  // Modules Section
  modulesContainer: { paddingHorizontal: 0 },
  modulePreviewCard: {
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  moduleColorBar: { width: 5 },
  modulePreviewContent: { flex: 1, padding: 20 },
  modulePreviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  moduleCategoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  moduleCategoryText: { fontSize: 11, fontWeight: '700' },
  modulePreviewMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  modulePreviewMetaText: { fontSize: 12 },
  modulePreviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    lineHeight: 22,
  },
  modulePreviewActions: { flexDirection: 'row' },
  modulePreviewBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modulePreviewBtnText: { color: Colors.white, fontSize: 13, fontWeight: '600' },

  // Testimonial Section
  testimonialCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  testimonialQuote: { alignSelf: 'center', marginBottom: 16 },
  testimonialText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  testimonialAuthor: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialAvatarText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  testimonialName: { fontSize: 14, fontWeight: '600' },
  testimonialRole: { fontSize: 12 },

  // Footer CTA
  footerCta: {
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 24,
    padding: 32,
  },
  footerCtaContent: { alignItems: 'center' },
  footerCtaTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  footerCtaSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  footerCtaButtons: { alignItems: 'center', gap: 12 },
  footerCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  footerCtaBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 16 },
  footerCtaBtnSecondary: { paddingVertical: 8 },
  footerCtaBtnSecondaryText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },

  // Footer
  footer: { paddingVertical: 32 },
  footerContent: { paddingHorizontal: 20 },
  footerBrand: { alignItems: 'center', marginBottom: 20 },
  footerBrandText: { fontSize: 20, fontWeight: '800' },
  footerBrandSubtext: { fontSize: 12, marginTop: 2 },
  footerLinks: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 20 },
  footerLink: { paddingVertical: 4 },
  footerLinkText: { fontSize: 14 },
  footerDivider: { height: 1, marginBottom: 16 },
  footerCopyright: { fontSize: 12, textAlign: 'center' },
});
