/**
 * video-player.tsx
 * Video playlist page — uses real Firestore data from LecturerDatabase.
 * Accessed from module/[id].tsx when a lesson is selected.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../src/contexts/ThemeContext';
import { Colors } from '../src/constants/colors';
import { LecturerDatabase, Material, Video } from '../src/utils/lecturerDatabase';
import { NotificationHelper } from '../src/utils/notificationHelper';
import { auth } from '../src/config/firebase';
import YoutubeIframe from 'react-native-youtube-iframe';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = (width * 9) / 16;

function extractYoutubeId(urlOrId: string): string {
  if (!urlOrId) return '';
  const match = urlOrId.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : urlOrId.trim();
}

export default function VideoPlayerScreen() {
  const router = useRouter();
  // moduleId = material ID, videoId = optional specific video to start on
  const { moduleId, videoId: initialVideoId } = useLocalSearchParams<{
    moduleId?: string;
    videoId?: string;
    lessonId?: string;
  }>();
  const { isDark, theme, toggleTheme } = useTheme();
  const isMounted = useRef(true);

  const currentUserId = auth.currentUser?.uid || 'user_anonymous';

  const [loading, setLoading] = useState(true);
  const [material, setMaterial] = useState<Material | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    loadData();
  }, [moduleId]);

  const loadData = async () => {
    if (!moduleId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [mat, allVideos] = await Promise.all([
        LecturerDatabase.getMaterialById(String(moduleId)),
        LecturerDatabase.getAllVideos(),
      ]);
      if (!isMounted.current) return;
      setMaterial(mat);
      const matVideos = allVideos.filter(
        v => v.materialId === String(moduleId) && v.status === 'published'
      );
      setVideos(matVideos);

      // If a specific videoId was requested, start on that one
      if (initialVideoId && matVideos.length > 0) {
        const idx = matVideos.findIndex(v => v.id === initialVideoId);
        if (idx >= 0) setActiveVideoIdx(idx);
      }
    } catch (e) {
      console.error('Error loading video player data:', e);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleVideoComplete = useCallback(async () => {
    const activeVideo = videos[activeVideoIdx];
    if (!activeVideo || !material) return;

    // Create notification
    try {
      await NotificationHelper.createVideoCompletionNotification(
        currentUserId,
        activeVideo.title,
        material.title,
        [
          'Tonton video berikutnya dalam materi ini',
          'Kerjakan kuis evaluasi untuk menguji pemahaman',
          'Review catatan pembelajaran',
          'Diskusikan dengan teman atau dosen',
        ]
      );
    } catch (_) {}

    // Auto-advance to next video
    if (activeVideoIdx < videos.length - 1) {
      setActiveVideoIdx(prev => prev + 1);
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  }, [activeVideoIdx, videos, material, currentUserId]);

  const handleSelectVideo = useCallback((idx: number) => {
    setActiveVideoIdx(idx);
    setPlaying(true);
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
        <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.infoBar}>
          <TouchableOpacity style={styles.infoBackBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.white} />
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>Memuat video...</Text>
        </View>
      </View>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!material || videos.length === 0) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
        <View style={styles.centerState}>
          <Ionicons name="videocam-off-outline" size={64} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            {!material ? 'Materi tidak ditemukan' : 'Belum ada video'}
          </Text>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            {!material
              ? 'Materi ini tidak ditemukan.'
              : 'Dosen belum menambahkan video untuk materi ini.'}
          </Text>
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

  const activeVideo = videos[activeVideoIdx];
  const videoId = extractYoutubeId(activeVideo.url);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* ── YouTube Player ── */}
      <View style={[styles.playerContainer, { height: VIDEO_HEIGHT }]}>
        <YoutubeIframe
          height={VIDEO_HEIGHT}
          width={width}
          videoId={videoId}
          play={playing}
          onChangeState={(state: string) => {
            if (state === 'ended') {
              setPlaying(false);
              handleVideoComplete();
            }
          }}
        />
      </View>

      {/* ── Info Bar ── */}
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.infoBar}>
        <View style={styles.infoBarLeft}>
          <TouchableOpacity style={styles.infoBackBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.infoText}>
            <Text style={styles.infoModuleTitle} numberOfLines={1}>{material.title}</Text>
            <Text style={styles.infoProgress}>
              {activeVideoIdx + 1}/{videos.length} video
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
          <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={Colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* ── Current Video Info ── */}
      <View style={[styles.currentVideoInfo, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.currentVideoRow}>
          <TouchableOpacity
            style={[styles.playPauseBtn, { backgroundColor: Colors.primary }]}
            onPress={() => setPlaying(p => !p)}
          >
            <Ionicons name={playing ? 'pause' : 'play'} size={18} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.currentVideoMeta}>
            <Text style={[styles.currentVideoTitle, { color: theme.text }]} numberOfLines={2}>
              {activeVideo.title}
            </Text>
            {activeVideo.duration ? (
              <Text style={[styles.currentVideoDuration, { color: theme.textMuted }]}>
                ⏱ {activeVideo.duration}
              </Text>
            ) : null}
          </View>
        </View>
        {activeVideo.description ? (
          <Text style={[styles.currentVideoDesc, { color: theme.textMuted }]} numberOfLines={2}>
            {activeVideo.description}
          </Text>
        ) : null}
      </View>

      {/* ── Video List Header ── */}
      <View style={[styles.listHeader, { backgroundColor: theme.background }]}>
        <Text style={[styles.listTitle, { color: theme.text }]}>
          Playlist ({videos.length} video)
        </Text>
      </View>

      {/* ── Video List ── */}
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isActive = index === activeVideoIdx;
          return (
            <TouchableOpacity
              style={[
                styles.videoListItem,
                { backgroundColor: theme.card, borderColor: theme.border },
                isActive && { borderColor: Colors.primary, borderWidth: 2 },
              ]}
              onPress={() => handleSelectVideo(index)}
              activeOpacity={0.85}
            >
              <View style={[
                styles.videoListIcon,
                { backgroundColor: isActive ? Colors.primary : theme.surfaceSecondary },
              ]}>
                <Ionicons
                  name={isActive && playing ? 'pause' : 'play'}
                  size={16}
                  color={isActive ? Colors.white : theme.textMuted}
                />
              </View>
              <View style={styles.videoListContent}>
                <Text
                  style={[styles.videoListTitle, { color: isActive ? Colors.primary : theme.text }]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                {item.duration ? (
                  <Text style={[styles.videoListDuration, { color: theme.textMuted }]}>
                    ⏱ {item.duration}
                  </Text>
                ) : null}
              </View>
              {isActive && (
                <View style={[styles.nowPlayingBadge, { backgroundColor: Colors.primaryLight }]}>
                  <Text style={[styles.nowPlayingText, { color: Colors.primary }]}>Aktif</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  playerContainer: { backgroundColor: '#000' },

  infoBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  infoBarLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  infoBackBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  infoText: { flex: 1 },
  infoModuleTitle: { fontSize: 14, fontWeight: '700', color: Colors.white, marginBottom: 2 },
  infoProgress: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  themeToggle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },

  currentVideoInfo: { padding: 16, borderBottomWidth: 1 },
  currentVideoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  playPauseBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  currentVideoMeta: { flex: 1 },
  currentVideoTitle: { fontSize: 15, fontWeight: '700', lineHeight: 20, marginBottom: 2 },
  currentVideoDuration: { fontSize: 12 },
  currentVideoDesc: { fontSize: 13, lineHeight: 18 },

  listHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
  },
  listTitle: { fontSize: 15, fontWeight: '700' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },

  videoListItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8,
  },
  videoListIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  videoListContent: { flex: 1 },
  videoListTitle: { fontSize: 14, fontWeight: '600', marginBottom: 3 },
  videoListDuration: { fontSize: 11 },
  nowPlayingBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  nowPlayingText: { fontSize: 10, fontWeight: '700' },

  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  backBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  backBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
