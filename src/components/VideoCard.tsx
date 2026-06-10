/**
 * VideoCard.tsx
 * 
 * Komponen card video yang dioptimalkan untuk performa:
 * - Hanya render thumbnail (Image) bukan WebView
 * - Tidak ada video yang dimuat sampai user klik
 * - Mendukung FlatList dengan getItemLayout untuk scroll performa tinggi
 * - Memo-ized untuk mencegah re-render yang tidak perlu
 */

import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface VideoCardProps {
  videoId: string;
  title: string;
  description?: string;
  duration?: string;
  moduleTitle?: string;
  isCompleted?: boolean;
  isActive?: boolean;
  onPress: () => void;
}

export const VideoCard = memo<VideoCardProps>(({
  videoId,
  title,
  description,
  duration,
  moduleTitle,
  isCompleted = false,
  isActive = false,
  onPress,
}) => {
  const { isDark, theme } = useTheme();
  const [thumbnailError, setThumbnailError] = useState(false);

  const thumbnailUri = thumbnailError
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.card },
        isActive && { borderColor: Colors.primary, borderWidth: 2 },
        isCompleted && { opacity: 0.85 },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailWrap}>
        <Image
          source={{ uri: thumbnailUri }}
          style={styles.thumbnail}
          resizeMode="cover"
          onError={() => setThumbnailError(true)}
        />
        {/* Overlay */}
        <View style={styles.thumbnailOverlay} />

        {/* Play / Completed icon */}
        <View style={styles.playIconWrap}>
          {isCompleted ? (
            <View style={[styles.playIcon, { backgroundColor: Colors.primary }]}>
              <Ionicons name="checkmark" size={16} color={Colors.white} />
            </View>
          ) : isActive ? (
            <View style={[styles.playIcon, { backgroundColor: Colors.primary }]}>
              <Ionicons name="pause" size={16} color={Colors.white} />
            </View>
          ) : (
            <View style={styles.playIcon}>
              <Ionicons name="play" size={16} color={Colors.white} style={{ marginLeft: 2 }} />
            </View>
          )}
        </View>

        {/* Duration badge */}
        {duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{duration}</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        {moduleTitle && (
          <Text style={[styles.moduleLabel, { color: Colors.primary }]} numberOfLines={1}>
            {moduleTitle}
          </Text>
        )}
        <Text
          style={[styles.title, { color: theme.text }, isActive && { color: Colors.primary }]}
          numberOfLines={2}
        >
          {title}
        </Text>
        {description && (
          <Text style={[styles.description, { color: theme.textMuted }]} numberOfLines={2}>
            {description}
          </Text>
        )}
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={theme.textMuted} />
            <Text style={[styles.metaText, { color: theme.textMuted }]}>
              {duration || '—'}
            </Text>
          </View>
          {isCompleted && (
            <View style={[styles.completedBadge, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="checkmark-circle" size={12} color={Colors.primary} />
              <Text style={[styles.completedText, { color: Colors.primary }]}>Selesai</Text>
            </View>
          )}
          {isActive && !isCompleted && (
            <View style={[styles.activeBadge, { backgroundColor: Colors.blueLight }]}>
              <Ionicons name="play-circle" size={12} color={Colors.blue} />
              <Text style={[styles.activeText, { color: Colors.blue }]}>Sedang diputar</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

VideoCard.displayName = 'VideoCard';

export const VIDEO_CARD_HEIGHT = 100; // for FlatList.getItemLayout

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    height: VIDEO_CARD_HEIGHT,
  },
  thumbnailWrap: {
    width: 140,
    height: VIDEO_CARD_HEIGHT,
    position: 'relative',
    backgroundColor: '#000',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  playIconWrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  moduleLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 4,
  },
  description: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  completedText: {
    fontSize: 10,
    fontWeight: '700',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});