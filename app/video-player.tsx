/**
 * video-player.tsx
 * Halaman pemutaran video dengan daftar playlist modul.
 * Diakses dari module/[id].tsx saat memilih video.
 * 
 * Best practices yang diterapkan:
 * 1. Thumbnail-first: WebView hanya dibuat saat play diklik
 * 2. FlatList dengan getItemLayout: scroll performa tinggi
 * 3. React.memo pada VideoCard: mencegah re-render list
 * 4. useCallback pada semua handler: mencegah closure re-create
 * 5. Cleanup pada unmount via useRef isMounted
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../src/contexts/ThemeContext';
import { Colors } from '../src/constants/colors';
import { MODULES } from '../src/constants/modules';
import { VideoPlayer } from '../src/components/VideoPlayer';
import { VideoCard, VIDEO_CARD_HEIGHT } from '../src/components/VideoCard';
import { NotificationHelper } from '../src/utils/notificationHelper';
import { ProgressHelper } from '../src/utils/progressHelper';
import { auth } from '../src/config/firebase';

const PROGRESS_KEY = '@edubidan_progress';
const USER_ID = 'user123';

interface Lesson {
  id: string;
  title: string;
  videoId: string;
  duration: string;
  description?: string;
}

export default function VideoPlayerScreen() {
  const router = useRouter();
  const { moduleId, lessonId } = useLocalSearchParams<{ moduleId: string; lessonId?: string }>();
  const { isDark, theme, toggleTheme } = useTheme();
  const isMounted = useRef(true);

  const module = useMemo(() => MODULES.find(m => m.id === moduleId), [moduleId]);
  const allLessons = useMemo<Lesson[]>(() => {
    if (!module) return [];
    return module.chapters.flatMap(ch =>
      ch.lessons.map(l => ({
        id: l.id,
        title: l.title,
        videoId: l.videoId,
        duration: l.duration,
        description: l.description,
      }))
    );
  }, [module]);

  const initialLesson = useMemo(
    () => allLessons.find(l => l.id === lessonId) ?? allLessons[0],
    [allLessons, lessonId]
  );

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(initialLesson ?? null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  // Load progress dari Firestore
  useEffect(() => {
    if (!moduleId) return;
    ProgressHelper.loadProgress(moduleId as string)
      .then(progress => {
        if (progress && isMounted.current) {
          setCompletedIds(progress.completedLessons ?? []);
        }
      })
      .catch(() => {});
  }, [moduleId]);

  const saveCompletion = useCallback(async (lessonId: string) => {
    if (!moduleId) return;
    try {
      const progress = await ProgressHelper.saveProgress(moduleId as string, { lessonId });
      if (isMounted.current) {
        setCompletedIds(progress.completedLessons);
      }
    } catch (_) {}
  }, [moduleId]);

  const handleVideoComplete = useCallback(async () => {
    if (!activeLesson || !module) return;
    await saveCompletion(activeLesson.id);

    // Suggest next lesson
    const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id);
    const nextLesson = allLessons[currentIndex + 1];

    if (nextLesson) {
      Alert.alert(
        '🎉 Video Selesai!',
        `Lanjutkan ke "${nextLesson.title}"?`,
        [
          { text: 'Nanti', style: 'cancel' },
          {
            text: 'Lanjutkan ▶',
            onPress: () => {
              if (isMounted.current) setActiveLesson(nextLesson);
            },
          },
        ]
      );
    } else {
      // All videos done
      Alert.alert(
        '🏆 Semua Video Selesai!',
        `Anda telah menyelesaikan semua video modul "${module.title}". Ikuti kuis evaluasi sekarang?`,
        [
          { text: 'Nanti', style: 'cancel' },
          { text: 'Ikuti Kuis', onPress: () => router.push(`/quiz/${moduleId}`) },
        ]
      );
    }
  }, [activeLesson, allLessons, module, moduleId, saveCompletion]);

  const handleSelectLesson = useCallback((lesson: Lesson) => {
    setActiveLesson(lesson);
  }, []);

  // FlatList perf optimization
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: VIDEO_CARD_HEIGHT + 10,
      offset: (VIDEO_CARD_HEIGHT + 10) * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback((item: Lesson) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: Lesson }) => (
      <VideoCard
        videoId={item.videoId}
        title={item.title}
        description={item.description}
        duration={item.duration}
        moduleTitle={module?.title}
        isCompleted={completedIds.includes(item.id)}
        isActive={activeLesson?.id === item.id}
        onPress={() => handleSelectLesson(item)}
      />
    ),
    [activeLesson, completedIds, module, handleSelectLesson]
  );

  if (!module || !activeLesson) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Modul tidak ditemukan</Text>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: Colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const completedCount = completedIds.length;
  const totalCount = allLessons.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* ── Video Player ── */}
      <VideoPlayer
        videoId={activeLesson.videoId}
        title={activeLesson.title}
        duration={activeLesson.duration}
        moduleTitle={module.title}
        userId={USER_ID}
        showControls
        onVideoComplete={handleVideoComplete}
      />

      {/* ── Header below video ── */}
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={styles.infoBar}
      >
        <View style={styles.infoBarLeft}>
          <TouchableOpacity style={styles.infoBackBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.infoText}>
            <Text style={styles.infoModuleTitle} numberOfLines={1}>{module.title}</Text>
            <Text style={styles.infoProgress}>
              {completedCount}/{totalCount} video selesai • {progressPercent}%
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
          <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={Colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* ── Progress bar ── */}
      <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${progressPercent}%`, backgroundColor: Colors.primary },
          ]}
        />
      </View>

      {/* ── Current video info ── */}
      <View style={[styles.currentVideoInfo, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.currentVideoTitle, { color: theme.text }]} numberOfLines={2}>
          {activeLesson.title}
        </Text>
        {activeLesson.description && (
          <Text style={[styles.currentVideoDesc, { color: theme.textMuted }]} numberOfLines={2}>
            {activeLesson.description}
          </Text>
        )}
        <View style={styles.currentVideoMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color={theme.textMuted} />
            <Text style={[styles.metaText, { color: theme.textMuted }]}>{activeLesson.duration}</Text>
          </View>
          {completedIds.includes(activeLesson.id) && (
            <View style={[styles.completedTag, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="checkmark-circle" size={13} color={Colors.primary} />
              <Text style={[styles.completedTagText, { color: Colors.primary }]}>Sudah Ditonton</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Video List ── */}
      <View style={[styles.listHeader, { backgroundColor: theme.background }]}>
        <Text style={[styles.listTitle, { color: theme.text }]}>
          Playlist ({allLessons.length} video)
        </Text>
        <TouchableOpacity onPress={() => router.push(`/quiz/${moduleId}`)}>
          <Text style={[styles.quizLink, { color: Colors.primary }]}>Ikuti Kuis ›</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={allLessons}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={8}
        windowSize={5}
        initialNumToRender={6}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={[styles.emptyListText, { color: theme.textMuted }]}>
              Tidak ada video dalam modul ini
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoBarLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  infoBackBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  infoText: { flex: 1 },
  infoModuleTitle: { fontSize: 14, fontWeight: '700', color: Colors.white, marginBottom: 2 },
  infoProgress: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  themeToggle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Progress bar
  progressBarBg: { height: 3, width: '100%' },
  progressBarFill: { height: '100%' },

  // Current video info
  currentVideoInfo: {
    padding: 16,
    borderBottomWidth: 1,
  },
  currentVideoTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4, lineHeight: 20 },
  currentVideoDesc: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  currentVideoMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12 },
  completedTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  completedTagText: { fontSize: 11, fontWeight: '700' },

  // List
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  listTitle: { fontSize: 15, fontWeight: '700' },
  quizLink: { fontSize: 13, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyList: { paddingVertical: 24, alignItems: 'center' },
  emptyListText: { fontSize: 14 },

  // Empty / error
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  backBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { color: Colors.white, fontWeight: '700' },
});