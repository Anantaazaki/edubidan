import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, LightTheme, DarkTheme } from '../constants/colors';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';
import { Lesson, Chapter } from '../types';

interface LessonListProps {
  chapters: Chapter[];
  activeVideoId: string;
  onLessonPress: (lesson: Lesson) => void;
  moduleColor: string;
}

export const LessonList: React.FC<LessonListProps> = ({
  chapters,
  activeVideoId,
  onLessonPress,
  moduleColor,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? DarkTheme : LightTheme;

  const getTotalLessons = () => {
    return chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
  };

  const getCompletedLessons = () => {
    return chapters.reduce((total, chapter) => {
      return total + chapter.lessons.filter(lesson => lesson.isCompleted).length;
    }, 0);
  };

  const getChapterProgress = (chapter: Chapter) => {
    const completed = chapter.lessons.filter(lesson => lesson.isCompleted).length;
    return completed / chapter.lessons.length;
  };

  const formatDuration = (duration: string) => {
    return duration.replace(':', ' menit ').replace(':', ' detik');
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Progress Overview */}
      <Card style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressTitle, { color: theme.text }]}>
            Progress Pembelajaran
          </Text>
          <Text style={[styles.progressStats, { color: theme.textMuted }]}>
            {getCompletedLessons()} dari {getTotalLessons()} pelajaran
          </Text>
        </View>
        <ProgressBar
          progress={getCompletedLessons() / getTotalLessons()}
          color={moduleColor}
          showPercentage
          style={styles.progressBar}
        />
      </Card>

      {/* Chapters */}
      {chapters.map((chapter, chapterIndex) => (
        <Card key={chapter.id} style={styles.chapterCard}>
          {/* Chapter Header */}
          <View style={styles.chapterHeader}>
            <LinearGradient
              colors={[`${moduleColor}15`, `${moduleColor}08`]}
              style={styles.chapterHeaderGradient}
            >
              <View style={styles.chapterHeaderContent}>
                <View style={[styles.chapterNumber, { backgroundColor: moduleColor }]}>
                  <Text style={styles.chapterNumberText}>{chapterIndex + 1}</Text>
                </View>
                <View style={styles.chapterInfo}>
                  <Text style={[styles.chapterTitle, { color: theme.text }]}>
                    {chapter.title}
                  </Text>
                  <Text style={[styles.chapterDescription, { color: theme.textMuted }]}>
                    {chapter.description}
                  </Text>
                  <View style={styles.chapterMeta}>
                    <View style={styles.chapterMetaItem}>
                      <Ionicons name="play-circle-outline" size={14} color={theme.textMuted} />
                      <Text style={[styles.chapterMetaText, { color: theme.textMuted }]}>
                        {chapter.lessons.length} video
                      </Text>
                    </View>
                    <View style={styles.chapterMetaItem}>
                      <Ionicons name="time-outline" size={14} color={theme.textMuted} />
                      <Text style={[styles.chapterMetaText, { color: theme.textMuted }]}>
                        {chapter.lessons.reduce((total, lesson) => {
                          const [minutes] = lesson.duration.split(':').map(Number);
                          return total + minutes;
                        }, 0)} menit
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <ProgressBar
                progress={getChapterProgress(chapter)}
                color={moduleColor}
                height={4}
                style={styles.chapterProgress}
              />
            </LinearGradient>
          </View>

          {/* Lessons */}
          <View style={styles.lessonsContainer}>
            {chapter.lessons.map((lesson, lessonIndex) => {
              const isActive = lesson.videoId === activeVideoId;
              const isCompleted = lesson.isCompleted;
              
              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={[
                    styles.lessonItem,
                    isActive && [styles.lessonItemActive, { borderColor: moduleColor }],
                    { backgroundColor: isActive ? `${moduleColor}08` : 'transparent' },
                  ]}
                  onPress={() => onLessonPress(lesson)}
                  activeOpacity={0.7}
                >
                  <View style={styles.lessonLeft}>
                    <View style={[
                      styles.lessonNumber,
                      isCompleted && { backgroundColor: Colors.green },
                      isActive && { backgroundColor: moduleColor },
                      !isCompleted && !isActive && { backgroundColor: theme.border },
                    ]}>
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={12} color={Colors.white} />
                      ) : (
                        <Text style={[
                          styles.lessonNumberText,
                          isActive && { color: Colors.white },
                          !isActive && { color: theme.textMuted },
                        ]}>
                          {lessonIndex + 1}
                        </Text>
                      )}
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text style={[
                        styles.lessonTitle,
                        { color: isActive ? moduleColor : theme.text },
                        isActive && styles.lessonTitleActive,
                      ]}>
                        {lesson.title}
                      </Text>
                      {lesson.description && (
                        <Text style={[styles.lessonDescription, { color: theme.textMuted }]}>
                          {lesson.description}
                        </Text>
                      )}
                      <View style={styles.lessonMeta}>
                        <Ionicons 
                          name="time-outline" 
                          size={12} 
                          color={isActive ? moduleColor : theme.textMuted} 
                        />
                        <Text style={[
                          styles.lessonDuration,
                          { color: isActive ? moduleColor : theme.textMuted },
                        ]}>
                          {lesson.duration}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.lessonRight}>
                    {isActive ? (
                      <View style={[styles.playingIndicator, { backgroundColor: moduleColor }]}>
                        <Ionicons name="play" size={12} color={Colors.white} />
                      </View>
                    ) : (
                      <Ionicons 
                        name="play-circle-outline" 
                        size={20} 
                        color={isCompleted ? Colors.green : theme.textMuted} 
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  progressCard: {
    marginBottom: 16,
  },
  progressHeader: {
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressStats: {
    fontSize: 13,
  },
  progressBar: {
    marginTop: 8,
  },
  chapterCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  chapterHeader: {
    marginBottom: 16,
  },
  chapterHeaderGradient: {
    padding: 16,
  },
  chapterHeaderContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chapterNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chapterNumberText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  chapterDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  chapterMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  chapterMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chapterMetaText: {
    fontSize: 12,
  },
  chapterProgress: {
    marginTop: 8,
  },
  lessonsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  lessonItemActive: {
    borderWidth: 1,
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lessonNumberText: {
    fontSize: 11,
    fontWeight: '600',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  lessonTitleActive: {
    fontWeight: '600',
  },
  lessonDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonDuration: {
    fontSize: 11,
    fontWeight: '500',
  },
  lessonRight: {
    marginLeft: 12,
  },
  playingIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});