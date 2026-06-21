import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NotificationHelper } from '../../src/utils/notificationHelper';
import { LecturerDatabase, Material, Video, Quiz } from '../../src/utils/lecturerDatabase';
import { Colors } from '../../src/constants/colors';
import { useTheme } from '../../src/contexts/ThemeContext';
import { auth } from '../../src/config/firebase';
import YoutubeIframe from 'react-native-youtube-iframe';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = (width * 9) / 16;

// Extract YouTube video ID from URL or plain ID — supports all common formats
function extractYoutubeId(urlOrId: string): string {
  if (!urlOrId) return '';
  const str = urlOrId.trim();
  // Already a plain 11-char ID
  if (/^[A-Za-z0-9_-]{11}$/.test(str)) return str;
  // Various YouTube URL patterns
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,           // watch?v=ID
    /youtu\.be\/([A-Za-z0-9_-]{11})/,       // youtu.be/ID
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/, // embed/ID
    /youtube\.com\/v\/([A-Za-z0-9_-]{11})/, // v/ID
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/, // shorts/ID
  ];
  for (const pattern of patterns) {
    const match = str.match(pattern);
    if (match) return match[1];
  }
  // Fallback — return as-is, might already be an ID
  return str;
}

// Get a color based on category
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Kehamilan: '#4CAF50',
    Persalinan: '#2196F3',
    Nifas: '#9C27B0',
    Neonatus: '#FF9800',
    Laktasi: '#E91E63',
    KB: '#00BCD4',
  };
  return colors[category] || Colors.primary;
}

export default function ModuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [material, setMaterial] = useState<Material | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [activeTab, setActiveTab] = useState<'deskripsi' | 'video' | 'quiz'>('deskripsi');
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const currentUserId = auth.currentUser?.uid || 'user_anonymous';

  useEffect(() => {
    loadModuleData();
  }, [id]);

  const loadModuleData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [mat, allVideos, allQuizzes] = await Promise.all([
        LecturerDatabase.getMaterialById(String(id)),
        LecturerDatabase.getAllVideos(),
        LecturerDatabase.getAllQuizzes(),
      ]);
      setMaterial(mat);
      // Filter videos and quizzes linked to this material
      const matVideos = allVideos.filter(v => v.materialId === String(id) && v.status === 'published');
      const matQuiz = allQuizzes.find(q => q.materialId === String(id) && q.status === 'published') || null;
      setVideos(matVideos);
      setQuiz(matQuiz);
    } catch (e) {
      console.error('Error loading module:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoComplete = async (video: Video) => {
    try {
      await NotificationHelper.createVideoCompletionNotification(
        currentUserId,
        video.title,
        material?.title || 'Materi Pembelajaran',
        [
          'Tonton video berikutnya dalam materi ini',
          'Kerjakan kuis untuk menguji pemahaman',
          'Review catatan pembelajaran',
          'Diskusikan materi dengan teman atau dosen',
        ]
      );
    } catch (e) {
      console.error('Error creating notification:', e);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
        <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.loadingHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
            <Text style={styles.backBtnText}>Kembali</Text>
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>Memuat materi...</Text>
        </View>
      </View>
    );
  }

  if (!material) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.textMuted} />
          <Text style={[styles.errorText, { color: theme.text }]}>Materi tidak ditemukan</Text>
          <Text style={[styles.errorSubtext, { color: theme.textMuted }]}>
            Materi ini mungkin telah dihapus oleh dosen.
          </Text>
          <TouchableOpacity
            style={[styles.errorBackBtn, { backgroundColor: Colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.errorBackBtnText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const color = getCategoryColor(material.category);
  const activeVideo = videos[activeVideoIdx];
  const videoId = activeVideo ? extractYoutubeId(activeVideo.url) : '';

  const TABS = [
    { key: 'deskripsi', label: 'Deskripsi', icon: 'document-text-outline' },
    { key: 'video', label: `Video (${videos.length})`, icon: 'play-circle-outline' },
    { key: 'quiz', label: 'Kuis', icon: 'help-circle-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* Header */}
      <LinearGradient
        colors={[color, color + 'CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
            <Text style={styles.backBtnText}>Kembali</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
          <Text style={styles.categoryText}>{material.category}</Text>
        </View>
        <Text style={styles.moduleTitle}>{material.title}</Text>
        <Text style={styles.moduleSubtitle}>
          {videos.length} video • {quiz ? `${quiz.questions?.length || 0} soal quiz` : 'Belum ada quiz'}
        </Text>
      </LinearGradient>

      {/* Video Player — only show when video tab is active and there are videos */}
      {activeTab === 'video' && videos.length > 0 && videoId ? (
        <View style={[styles.videoContainer, { height: VIDEO_HEIGHT }]}>
          <YoutubeIframe
            height={VIDEO_HEIGHT}
            width={width}
            videoId={videoId}
            play={playing}
            onChangeState={(state: string) => {
              if (state === 'ended') {
                setPlaying(false);
                handleVideoComplete(activeVideo);
              }
              if (state === 'playing') setPlaying(true);
            }}
            initialPlayerParams={{
              controls: true,
              modestbranding: true,
              rel: false,
            }}
          />
        </View>
      ) : activeTab === 'video' && videos.length > 0 && !videoId ? (
        <View style={[styles.videoContainer, { height: VIDEO_HEIGHT, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }]}>
          <Text style={{ color: '#fff', fontSize: 13 }}>Format URL video tidak valid</Text>
        </View>
      ) : null}

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabRow}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  activeTab === tab.key && [styles.tabActive, { backgroundColor: color }],
                ]}
                onPress={() => setActiveTab(tab.key as any)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={14}
                  color={activeTab === tab.key ? Colors.white : theme.textMuted}
                />
                <Text style={[
                  styles.tabText,
                  { color: activeTab === tab.key ? Colors.white : theme.textMuted },
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── DESKRIPSI TAB ── */}
        {activeTab === 'deskripsi' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Tentang Materi</Text>
            <Text style={[styles.description, { color: theme.textMuted }]}>
              {material.description || 'Tidak ada deskripsi untuk materi ini.'}
            </Text>

            <View style={[styles.infoGrid, { backgroundColor: theme.surface }]}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>📹 Video</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{videos.length}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>📝 Soal Quiz</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {quiz ? quiz.questions?.length || 0 : '-'}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>🏷️ Kategori</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{material.category}</Text>
              </View>
              {material.estimatedDuration ? (
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: theme.textMuted }]}>⏱ Durasi</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{material.estimatedDuration}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.ctaRow}>
              {videos.length > 0 && (
                <TouchableOpacity
                  style={[styles.ctaBtn, { backgroundColor: color }]}
                  onPress={() => { setActiveTab('video'); setPlaying(true); }}
                >
                  <Ionicons name="play-circle" size={18} color={Colors.white} />
                  <Text style={styles.ctaBtnText}>Tonton Video</Text>
                </TouchableOpacity>
              )}
              {quiz && (
                <TouchableOpacity
                  style={[styles.ctaBtnOutline, { borderColor: color }]}
                  onPress={() => router.push(`/quiz/${quiz.id}`)}
                >
                  <Ionicons name="help-circle-outline" size={18} color={color} />
                  <Text style={[styles.ctaBtnOutlineText, { color }]}>Ikuti Kuis</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* ── VIDEO TAB ── */}
        {activeTab === 'video' && (
          <View style={styles.section}>
            {videos.length === 0 ? (
              <View style={styles.emptyTab}>
                <Ionicons name="play-circle-outline" size={64} color={theme.textMuted} />
                <Text style={[styles.emptyTabTitle, { color: theme.text }]}>Belum Ada Video</Text>
                <Text style={[styles.emptyTabText, { color: theme.textMuted }]}>
                  Dosen belum menambahkan video untuk materi ini.
                </Text>
              </View>
            ) : (
              <>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Daftar Video</Text>
                {videos.map((video, idx) => (
                  <TouchableOpacity
                    key={video.id}
                    style={[
                      styles.videoItem,
                      { backgroundColor: theme.card, borderColor: theme.border },
                      activeVideoIdx === idx && { borderColor: color, borderWidth: 2 },
                    ]}
                    onPress={() => {
                      setActiveVideoIdx(idx);
                      setPlaying(true);
                    }}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.videoItemIcon, { backgroundColor: activeVideoIdx === idx ? color : theme.surfaceSecondary }]}>
                      <Ionicons
                        name={activeVideoIdx === idx ? 'pause' : 'play'}
                        size={16}
                        color={activeVideoIdx === idx ? Colors.white : theme.textMuted}
                      />
                    </View>
                    <View style={styles.videoItemContent}>
                      <Text style={[styles.videoItemTitle, { color: theme.text }]} numberOfLines={2}>
                        {video.title}
                      </Text>
                      {video.description ? (
                        <Text style={[styles.videoItemDesc, { color: theme.textMuted }]} numberOfLines={1}>
                          {video.description}
                        </Text>
                      ) : null}
                      {video.duration ? (
                        <Text style={[styles.videoItemDuration, { color: theme.textMuted }]}>
                          ⏱ {video.duration}
                        </Text>
                      ) : null}
                    </View>
                    {activeVideoIdx === idx && (
                      <View style={[styles.nowPlayingBadge, { backgroundColor: color }]}>
                        <Text style={styles.nowPlayingText}>▶ Aktif</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        )}

        {/* ── QUIZ TAB ── */}
        {activeTab === 'quiz' && (
          <View style={styles.section}>
            {!quiz ? (
              <View style={styles.emptyTab}>
                <Ionicons name="help-circle-outline" size={64} color={theme.textMuted} />
                <Text style={[styles.emptyTabTitle, { color: theme.text }]}>Belum Ada Kuis</Text>
                <Text style={[styles.emptyTabText, { color: theme.textMuted }]}>
                  Dosen belum menambahkan kuis untuk materi ini.
                </Text>
              </View>
            ) : (
              <>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Kuis Evaluasi</Text>
                <View style={[styles.quizCard, { backgroundColor: theme.card, borderColor: color }]}>
                  <View style={[styles.quizCardIcon, { backgroundColor: color + '20' }]}>
                    <Ionicons name="help-circle" size={32} color={color} />
                  </View>
                  <Text style={[styles.quizCardTitle, { color: theme.text }]}>{quiz.title}</Text>
                  {quiz.description ? (
                    <Text style={[styles.quizCardDesc, { color: theme.textMuted }]}>{quiz.description}</Text>
                  ) : null}
                  <View style={styles.quizMeta}>
                    <View style={[styles.quizMetaItem, { backgroundColor: theme.surfaceSecondary }]}>
                      <Ionicons name="list-outline" size={14} color={theme.textMuted} />
                      <Text style={[styles.quizMetaText, { color: theme.textMuted }]}>
                        {quiz.questions?.length || 0} soal
                      </Text>
                    </View>
                    <View style={[styles.quizMetaItem, { backgroundColor: theme.surfaceSecondary }]}>
                      <Ionicons name="time-outline" size={14} color={theme.textMuted} />
                      <Text style={[styles.quizMetaText, { color: theme.textMuted }]}>
                        {quiz.timeLimit} menit
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.startQuizBtn, { backgroundColor: color }]}
                    onPress={() => router.push(`/quiz/${quiz.id}`)}
                  >
                    <Ionicons name="play" size={16} color={Colors.white} />
                    <Text style={styles.startQuizBtnText}>Mulai Kuis</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingHeader: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  errorText: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  errorSubtext: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  errorBackBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  errorBackBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },

  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 8, paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 24, alignSelf: 'flex-start',
  },
  backBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  themeToggle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginBottom: 8 },
  categoryText: { color: Colors.white, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  moduleTitle: { fontSize: 22, fontWeight: '800', color: Colors.white, lineHeight: 28, marginBottom: 6 },
  moduleSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  videoContainer: { backgroundColor: '#000' },

  tabBar: { borderBottomWidth: 1 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  tabActive: {},
  tabText: { fontSize: 13, fontWeight: '600' },

  content: { flex: 1 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  description: { fontSize: 14, lineHeight: 22, marginBottom: 16 },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', borderRadius: 14, padding: 16, gap: 16, marginBottom: 20 },
  infoItem: { width: '45%', gap: 4 },
  infoLabel: { fontSize: 12 },
  infoValue: { fontSize: 16, fontWeight: '700' },

  ctaRow: { flexDirection: 'row', gap: 12 },
  ctaBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12,
  },
  ctaBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  ctaBtnOutline: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 2,
  },
  ctaBtnOutlineText: { fontSize: 14, fontWeight: '700' },

  emptyTab: { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyTabTitle: { fontSize: 18, fontWeight: '700' },
  emptyTabText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  videoItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10,
  },
  videoItemIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  videoItemContent: { flex: 1 },
  videoItemTitle: { fontSize: 14, fontWeight: '600', marginBottom: 3 },
  videoItemDesc: { fontSize: 12, marginBottom: 3 },
  videoItemDuration: { fontSize: 11 },
  nowPlayingBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  nowPlayingText: { color: Colors.white, fontSize: 10, fontWeight: '700' },

  quizCard: {
    borderRadius: 16, padding: 20, borderWidth: 2,
    alignItems: 'center', gap: 12,
  },
  quizCardIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  quizCardTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  quizCardDesc: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  quizMeta: { flexDirection: 'row', gap: 12 },
  quizMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  quizMetaText: { fontSize: 13, fontWeight: '600' },
  startQuizBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, marginTop: 4,
  },
  startQuizBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
