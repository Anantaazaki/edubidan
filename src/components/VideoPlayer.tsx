/**
 * VideoPlayer.tsx
 * Menggunakan react-native-youtube-iframe untuk pemutaran YouTube
 * yang lebih stabil dan native di Expo Go Android/iOS.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { NotificationHelper } from '../utils/notificationHelper';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16;

const getThumbnailUrl = (videoId: string) =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

export interface VideoPlayerProps {
  videoId: string;
  title?: string;
  duration?: string;
  moduleTitle?: string;
  userId?: string;
  showControls?: boolean;
  onVideoComplete?: () => void;
  onVideoChange?: (videoId: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  title,
  duration,
  moduleTitle,
  userId,
  showControls = true,
  onVideoComplete,
}) => {
  const { isDark } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const playerRef = useRef<any>(null);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    setIsLoading(true);
    setHasError(false);
  }, []);

  const handleOpenYouTube = useCallback(() => {
    Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`).catch(() => {
      Linking.openURL(`vnd.youtube://${videoId}`).catch(() => {});
    });
  }, [videoId]);

  const handleStateChange = useCallback(async (state: string) => {
    if (state === 'ended') {
      setIsPlaying(false);
      // Trigger congratulatory notification
      if (userId && title && moduleTitle) {
        await NotificationHelper.createVideoCompletionNotification(
          userId,
          title,
          moduleTitle,
          [
            `Lanjutkan ke video berikutnya dalam modul "${moduleTitle}"`,
            'Kerjakan latihan soal terkait materi ini',
            'Review catatan untuk memperdalam pemahaman',
            'Diskusikan materi dengan teman atau dosen',
          ]
        );
      }
      onVideoComplete?.();
    }
    if (state === 'playing') {
      setIsLoading(false);
    }
    if (state === 'unstarted') {
      setIsLoading(false);
    }
  }, [userId, title, moduleTitle, onVideoComplete]);

  const handleError = useCallback((error: string) => {
    console.log('YouTube player error:', error);
    setIsLoading(false);
    setHasError(true);
  }, []);

  // ── Error State ───────────────────────────────────────────────────────────
  if (isPlaying && hasError) {
    return (
      <View style={[styles.container, { backgroundColor: '#1a1a2e' }]}>
        <View style={styles.errorBox}>
          <Ionicons name="wifi-outline" size={40} color="rgba(255,255,255,0.6)" />
          <Text style={styles.errorTitle}>Video gagal dimuat</Text>
          <Text style={styles.errorSub}>Periksa koneksi internet Anda</Text>
          <View style={styles.errorActions}>
            <TouchableOpacity style={styles.retryBtn} onPress={() => {
              setHasError(false);
              setIsLoading(true);
              setIsPlaying(true);
            }}>
              <Ionicons name="refresh" size={16} color={Colors.white} />
              <Text style={styles.retryBtnText}>Coba Lagi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ytBtn} onPress={handleOpenYouTube}>
              <Ionicons name="logo-youtube" size={16} color={Colors.white} />
              <Text style={styles.ytBtnText}>Buka YouTube</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ── Playing State: YouTube Player ─────────────────────────────────────────
  if (isPlaying) {
    return (
      <View style={styles.container}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Memuat video...</Text>
          </View>
        )}

        <YoutubePlayer
          ref={playerRef}
          height={VIDEO_HEIGHT}
          width={SCREEN_WIDTH}
          videoId={videoId}
          play={true}
          onChangeState={handleStateChange}
          onError={handleError}
          onReady={() => setIsLoading(false)}
          webViewProps={{
            allowsFullscreenVideo: true,
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
          }}
          initialPlayerParams={{
            controls: true,
            modestbranding: true,
            rel: false,
            preventFullScreen: false,
          }}
        />

        {/* Open in YouTube fallback */}
        <TouchableOpacity style={styles.ytFallbackBtn} onPress={handleOpenYouTube}>
          <Ionicons name="logo-youtube" size={14} color="rgba(255,255,255,0.7)" />
          <Text style={styles.ytFallbackText}>Buka di YouTube</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Thumbnail State ────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: thumbnailError
          ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
          : getThumbnailUrl(videoId)
        }}
        style={styles.thumbnail}
        resizeMode="cover"
        onError={() => setThumbnailError(true)}
      />

      {/* Dark overlay */}
      <View style={styles.thumbnailOverlay} />

      {/* Duration badge */}
      {duration && (
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{duration}</Text>
        </View>
      )}

      {/* Title */}
      {title && showControls && (
        <View style={styles.titleOverlay}>
          <Text style={styles.thumbnailTitle} numberOfLines={2}>{title}</Text>
        </View>
      )}

      {/* Play button */}
      <TouchableOpacity
        style={styles.playButtonWrap}
        onPress={handlePlay}
        activeOpacity={0.85}
      >
        <View style={styles.playButton}>
          <Ionicons name="play" size={32} color={Colors.white} style={{ marginLeft: 4 }} />
        </View>
      </TouchableOpacity>

      {/* YouTube fallback */}
      <TouchableOpacity style={styles.ytFallbackBtn} onPress={handleOpenYouTube}>
        <Ionicons name="logo-youtube" size={14} color="rgba(255,255,255,0.7)" />
        <Text style={styles.ytFallbackText}>Buka di YouTube</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },
  thumbnail: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%', height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 48, left: 0, right: 0,
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  thumbnailTitle: {
    color: Colors.white,
    fontSize: 14, fontWeight: '600', lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  durationBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  durationText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  playButtonWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
  },
  playButton: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10, gap: 12,
  },
  loadingText: { color: Colors.white, fontSize: 14, fontWeight: '500' },
  errorBox: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 24, gap: 10,
  },
  errorTitle: { color: Colors.white, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  errorSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center' },
  errorActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
  },
  retryBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  ytBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FF0000',
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
  },
  ytBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  ytFallbackBtn: {
    position: 'absolute', bottom: 8, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  ytFallbackText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
});