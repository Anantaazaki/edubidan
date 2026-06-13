import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationManager from '../../src/utils/notifications';
import { NotificationHelper } from '../../src/utils/notificationHelper';
import { ProgressHelper } from '../../src/utils/progressHelper';
import { VideoPlayer } from '../../src/components/VideoPlayer';
import { MODULES } from '../../src/constants/modules';
import { Colors } from '../../src/constants/colors';
import { useTheme } from '../../src/contexts/ThemeContext';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = (width * 9) / 16;
const PROGRESS_KEY = '@edubidan_progress';

export default function ModuleDetailSimpleScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('deskripsi');
  const [activeVideoId, setActiveVideoId] = useState('');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);
  const [currentUserId] = useState('user123'); // In real app, get from auth context

  // Debug: Log the ID and available modules
  console.log('Module ID from params:', id);
  console.log('Available modules:', MODULES.map(m => ({ id: m.id, title: m.title })));
  
  const module = MODULES.find((m) => m.id === String(id));

  useEffect(() => {
    if (module && module.chapters && module.chapters.length > 0) {
      const firstLesson = module.chapters[0]?.lessons[0];
      if (firstLesson && !activeVideoId) {
        setActiveVideoId(firstLesson.videoId);
      }
    }
    loadProgress();
  }, [module]);

  const loadProgress = async () => {
    try {
      const progress = await ProgressHelper.loadProgress(String(id));
      if (progress) {
        setCompletedLessons(progress.completedLessons || []);
        setWatchedVideos(progress.watchedVideos || []);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async (lessonId?: string, videoId?: string) => {
    try {
      const progress = await ProgressHelper.saveProgress(String(id), {
        lessonId, videoId,
      });
      if (lessonId && !completedLessons.includes(lessonId)) {
        setCompletedLessons(prev => [...prev, lessonId]);
      }
      if (videoId && !watchedVideos.includes(videoId)) {
        setWatchedVideos(prev => [...prev, videoId]);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleVideoComplete = async (videoId: string) => {
    try {
      console.log('Video completed:', videoId);
      saveProgress(undefined, videoId);
      
      // Find current lesson and mark as completed
      const currentLesson = module?.chapters
        ?.flatMap(chapter => chapter.lessons)
        ?.find(l => l.videoId === videoId);
      if (currentLesson && module) {
        handleLessonCompletion(currentLesson, module);
      }
    } catch (error) {
      console.error('Error handling video completion:', error);
    }
  };

  const handleLessonCompletion = async (lesson: any, module: any) => {
    try {
      // Save lesson completion
      await saveProgress(lesson.id, lesson.videoId);
      
      // Calculate progress
      const newCompletedLessons = [...completedLessons, lesson.id];
      const totalLessons = getTotalLessonsCount();
      const completedCount = newCompletedLessons.length;
      const completionPercentage = Math.round((completedCount / totalLessons) * 100);

      // Create congratulatory notification for video completion
      await NotificationHelper.createVideoCompletionNotification(
        currentUserId,
        lesson.title,
        module.title,
        [
          `Lanjutkan ke video berikutnya dalam modul "${module.title}"`,
          'Kerjakan latihan soal terkait materi ini',
          'Review catatan pembelajaran untuk memperdalam pemahaman',
          'Diskusikan materi dengan teman atau dosen',
        ]
      );
      
      // Check if module is now complete
      if (completedCount >= totalLessons) {
        // Create module completion notification
        await NotificationHelper.createModuleCompletionNotification(
          currentUserId,
          module.title,
          100
        );
        
        // Create achievement notification for first completed module
        const completedModulesCount = await getCompletedModulesCount();
        if (completedModulesCount === 0) {
          await NotificationHelper.createStreakAchievementNotification(
            currentUserId,
            1 // First module completed
          );
        }
        
        // Show module completion alert
        Alert.alert(
          '🏆 Materi Selesai!',
          `Luar biasa! Anda telah menyelesaikan semua pelajaran dalam materi "${module.title}". Ikuti kuis untuk menguji pemahaman Anda!`,
          [
            { text: 'Nanti', style: 'cancel' },
            { 
              text: 'Ikuti Kuis', 
              onPress: () => router.push(`/quiz/${module.id}`)
            }
          ]
        );
      } else {
        // Show lesson completion alert with next lesson suggestion
        const nextLesson = getNextLesson(lesson.id);
        Alert.alert(
          '🎉 Pelajaran Selesai!',
          `Selamat! Anda telah menyelesaikan "${lesson.title}". Lanjutkan pembelajaran untuk mencapai ${completionPercentage}% dari total materi.`,
          [
            { text: 'Istirahat', style: 'cancel' },
            ...(nextLesson ? [{ 
              text: 'Lanjutkan', 
              onPress: () => setActiveVideoId(nextLesson.videoId)
            }] : [])
          ]
        );
      }
      
      // Check for learning streak
      await checkLearningStreak();
      
    } catch (error) {
      console.error('Error handling lesson completion:', error);
    }
  };

  const getTotalLessonsCount = () => {
    if (!module) return 0;
    return module.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
  };

  const getCompletedModulesCount = async (): Promise<number> => {
    try {
      // Check all modules for completion status
      let completedCount = 0;
      for (const mod of MODULES) {
        const stored = await AsyncStorage.getItem(`${PROGRESS_KEY}_${mod.id}`);
        if (stored) {
          const progress = JSON.parse(stored);
          const completedLessons = progress.completedLessons?.length || 0;
          const totalLessons = mod.chapters?.reduce((sum, chapter) => sum + (chapter.lessons?.length || 0), 0) || 0;
          if (completedLessons >= totalLessons) {
            completedCount++;
          }
        }
      }
      return completedCount;
    } catch (error) {
      console.error('Error getting completed modules count:', error);
      return 0;
    }
  };

  const checkLearningStreak = async () => {
    try {
      const streak = await ProgressHelper.checkLearningStreak();
      // Notify on milestone streaks
      if (streak === 7 || streak === 30 || (streak > 0 && streak % 7 === 0)) {
        await NotificationHelper.createStreakAchievementNotification(currentUserId, streak);
      }
    } catch (error) {
      console.error('Error checking learning streak:', error);
    }
  };

  const getNextLesson = (currentLessonId: string) => {
    if (!module) return null;
    
    // Flatten all lessons from all chapters
    const allLessons = module.chapters.flatMap(chapter => chapter.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
    
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1];
    }
    return null;
  };

  const handleVideoChange = (videoId: string) => {
    setActiveVideoId(videoId);
  };

  if (!module) {
    console.log('Module not found! ID:', id, 'Available IDs:', MODULES.map(m => m.id));
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'light-content'} backgroundColor={Colors.primaryDark} />
        <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.textMuted} />
          <Text style={[styles.errorText, { color: theme.text }]}>Modul tidak ditemukan</Text>
          <Text style={[styles.errorSubtext, { color: theme.textMuted }]}>ID: {id}</Text>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: Colors.primary }]} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const TABS = [
    { key: 'deskripsi', label: 'Deskripsi' },
    { key: 'langkah', label: 'Langkah' },
    { key: 'alat', label: 'Alat' },
    { key: 'pelajaran', label: 'Pelajaran' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'light-content'} backgroundColor={Colors.primaryDark} />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={[module.color, module.color + 'CC', module.color + '99']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
            <Text style={styles.backBtnText}>Kembali</Text>
          </TouchableOpacity>
          
          {/* Theme Toggle */}
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerContent}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{module.category}</Text>
          </View>
          <Text style={styles.moduleTitle}>{module.title}</Text>
        </View>
      </LinearGradient>

      {/* Video Player */}
      <View style={[styles.videoContainer, { height: VIDEO_HEIGHT }]}>
        <VideoPlayer
          videoId={activeVideoId || (module.chapters?.[0]?.lessons?.[0]?.videoId ?? '')}
          title={module?.chapters
            ?.flatMap(chapter => chapter.lessons)
            ?.find(l => l.videoId === activeVideoId)?.title || module.chapters?.[0]?.lessons?.[0]?.title || 'Video Pembelajaran'}
          moduleTitle={module.title}
          userId={currentUserId}
          onVideoComplete={() => handleVideoComplete(activeVideoId)}
          showControls={true}
        />
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabRow}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  { backgroundColor: theme.surface },
                  activeTab === tab.key && [styles.tabActive, { backgroundColor: module.color }]
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[
                  styles.tabText,
                  { color: theme.text },
                  activeTab === tab.key && styles.tabTextActive
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={[styles.content, { backgroundColor: theme.background }]}>
        {activeTab === 'deskripsi' && (
          <View style={[styles.section, { backgroundColor: theme.background }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Tentang Materi</Text>
            <Text style={[styles.description, { color: theme.textMuted }]}>{module.description}</Text>
            
            <View style={[styles.infoGrid, { backgroundColor: theme.surface }]}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: theme.text }]}>📹 Video</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{module.videos}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: theme.text }]}>📝 Pelajaran</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{getTotalLessonsCount()}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: theme.text }]}>🛠️ Alat</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{(module.tools || []).length}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: theme.text }]}>📊 Progress</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{module.progress}%</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.quizButton, { backgroundColor: module.color }]}
              onPress={() => router.push(`/quiz/${module.id}`)}
            >
              <Text style={styles.quizButtonText}>🧠 Ikuti Kuis Materi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.startVideoBtn, { backgroundColor: Colors.primaryDark }]}
              onPress={() => {
                // Langsung play video pertama di halaman ini
                const firstLesson = module.chapters?.[0]?.lessons?.[0];
                if (firstLesson) {
                  setActiveVideoId(firstLesson.videoId);
                  setActiveTab('pelajaran');
                }
              }}
            >
              <Ionicons name="play-circle" size={18} color={Colors.white} />
              <Text style={styles.startVideoBtnText}>▶ Tonton Video Pembelajaran</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'langkah' && (
          <View style={[styles.section, { backgroundColor: theme.background }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Langkah-Langkah Prosedur</Text>
            {(module.steps || []).map((step, index) => (
              <View key={step.id || index} style={[styles.stepItem, { backgroundColor: theme.surface }]}>
                <View style={[styles.stepNumber, { backgroundColor: module.color }]}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: theme.text }]}>{step.title}</Text>
                  <Text style={[styles.stepText, { color: theme.textMuted }]}>{step.detail}</Text>
                  {step.tips && step.tips.length > 0 && (
                    <View style={[styles.tipsContainer, { backgroundColor: theme.surfaceSecondary }]}>
                      <Text style={[styles.tipsTitle, { color: theme.text }]}>💡 Tips:</Text>
                      {step.tips.map((tip, tipIndex) => (
                        <Text key={tipIndex} style={[styles.tipText, { color: theme.textMuted }]}>• {tip}</Text>
                      ))}
                    </View>
                  )}
                  {step.isImportant && (
                    <View style={styles.importantBadge}>
                      <Ionicons name="warning" size={12} color={Colors.white} />
                      <Text style={styles.importantText}>Penting</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'alat' && (
          <View style={[styles.section, { backgroundColor: theme.background }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Alat yang Dibutuhkan</Text>
            
            {/* Primary Tools */}
            <Text style={[styles.toolCategoryTitle, { color: theme.text }]}>🔧 Alat Utama</Text>
            <View style={styles.toolsGrid}>
              {(module.tools || [])
                .filter(tool => typeof tool === 'object' ? tool.category === 'primary' : true)
                .map((tool, index) => (
                <View key={tool.id || `primary-${index}`} style={[styles.toolItem, styles.primaryToolItem, { backgroundColor: theme.surface }]}>
                  <View style={[styles.toolIconContainer, { backgroundColor: module.color + '20' }]}>
                    <Text style={styles.toolIcon}>🛠️</Text>
                  </View>
                  <View style={styles.toolContent}>
                    <Text style={[styles.toolName, { color: theme.text }]}>{typeof tool === 'string' ? tool : tool.name}</Text>
                    {typeof tool === 'object' && tool.description && (
                      <Text style={[styles.toolDescription, { color: theme.textMuted }]}>{tool.description}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Secondary Tools */}
            {(module.tools || []).some(tool => typeof tool === 'object' && tool.category === 'secondary') && (
              <>
                <Text style={[styles.toolCategoryTitle, { color: theme.text }]}>📦 Alat Pendukung</Text>
                <View style={styles.toolsGrid}>
                  {(module.tools || [])
                    .filter(tool => typeof tool === 'object' && tool.category === 'secondary')
                    .map((tool, index) => (
                    <View key={tool.id || `secondary-${index}`} style={[styles.toolItem, styles.secondaryToolItem, { backgroundColor: theme.surface }]}>
                      <View style={[styles.toolIconContainer, { backgroundColor: theme.surfaceSecondary }]}>
                        <Text style={styles.toolIcon}>📋</Text>
                      </View>
                      <View style={styles.toolContent}>
                        <Text style={[styles.toolName, { color: theme.text }]}>{tool.name}</Text>
                        {tool.description && (
                          <Text style={[styles.toolDescription, { color: theme.textMuted }]}>{tool.description}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {activeTab === 'pelajaran' && (
          <View style={[styles.section, { backgroundColor: theme.background }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Daftar Pelajaran</Text>
            <View style={[styles.progressSummary, { backgroundColor: theme.surface }]}>
              <Text style={[styles.progressText, { color: theme.text }]}>
                Progress: {completedLessons.length}/{getTotalLessonsCount()} pelajaran selesai
              </Text>
              <View style={[styles.progressBar, { backgroundColor: theme.surfaceSecondary }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${(completedLessons.length / getTotalLessonsCount()) * 100}%`,
                      backgroundColor: module.color 
                    }
                  ]} 
                />
              </View>
            </View>
            
            {module.chapters.map((chapter, chapterIndex) => (
              <View key={chapter.id}>
                <Text style={[styles.chapterTitle, { color: module.color }]}>
                  {chapter.title}
                </Text>
                <Text style={[styles.chapterDescription, { color: theme.textMuted }]}>
                  {chapter.description}
                </Text>
                
                {chapter.lessons.map((lesson, lessonIndex) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  const isWatched = watchedVideos.includes(lesson.videoId);
                  const isActive = activeVideoId === lesson.videoId;
                  
                  return (
                    <TouchableOpacity
                      key={lesson.id}
                      style={[
                        styles.lessonItem,
                        { backgroundColor: theme.surface, borderColor: theme.border },
                        isActive && { borderColor: module.color, borderWidth: 2 },
                        isCompleted && { backgroundColor: `${module.color}10` }
                      ]}
                      onPress={() => router.push(`/video-player?moduleId=${id}&lessonId=${lesson.id}`)}
                    >
                      <View style={[
                        styles.lessonNumber,
                        { 
                          backgroundColor: isCompleted 
                            ? module.color 
                            : isActive 
                              ? module.color 
                              : theme.surfaceSecondary 
                        }
                      ]}>
                        {isCompleted ? (
                          <Ionicons name="checkmark" size={16} color={Colors.white} />
                        ) : (
                          <Text style={[
                            styles.lessonNumberText,
                            { color: isActive ? Colors.white : theme.textMuted }
                          ]}>
                            {isActive ? '▶️' : (lessonIndex + 1)}
                          </Text>
                        )}
                      </View>
                      
                      <View style={styles.lessonContent}>
                        <View style={styles.lessonTitleRow}>
                          <Text style={[
                            styles.lessonTitle,
                            { color: theme.text },
                            isCompleted && { color: module.color }
                          ]}>
                            {lesson.title}
                          </Text>
                          {isWatched && !isCompleted && (
                            <Ionicons name="eye" size={14} color={Colors.blue} />
                          )}
                        </View>
                        <Text style={[styles.lessonDuration, { color: theme.textMuted }]}>⏱️ {lesson.duration}</Text>
                        {lesson.description && (
                          <Text style={[styles.lessonDescription, { color: theme.textMuted }]}>{lesson.description}</Text>
                        )}
                      </View>
                      
                      <View style={styles.lessonActions}>
                        {isCompleted && (
                          <View style={[styles.completedBadge, { backgroundColor: module.color }]}>
                            <Ionicons name="checkmark-circle" size={12} color={Colors.white} />
                          </View>
                        )}
                        <Text style={styles.playIcon}>
                          {isActive ? '⏸️' : '▶️'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
            
            {/* Next Module Suggestion */}
            {completedLessons.length === getTotalLessonsCount() && (
              <View style={[styles.completionCard, { borderColor: module.color, backgroundColor: theme.surface }]}>
                <Ionicons name="trophy" size={32} color={module.color} />
                <Text style={[styles.completionTitle, { color: module.color }]}>
                  🎉 Materi Selesai!
                </Text>
                <Text style={[styles.completionText, { color: theme.text }]}>
                  Selamat! Anda telah menyelesaikan semua pelajaran dalam materi ini.
                </Text>
                <TouchableOpacity
                  style={[styles.nextModuleBtn, { backgroundColor: module.color }]}
                  onPress={() => router.push(`/quiz/${module.id}`)}
                >
                  <Text style={styles.nextModuleBtnText}>Ikuti Kuis Evaluasi</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.white} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.gray50,
  },
  errorText: {
    fontSize: 18,
    color: Colors.slate700,
    marginBottom: 8,
    fontWeight: '600',
  },
  errorSubtext: {
    fontSize: 14,
    color: Colors.slate500,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  backButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 25,
    alignSelf: 'flex-start',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  backBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  headerContent: {
    gap: 10,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  categoryText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  moduleTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 30,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  videoContainer: {
    backgroundColor: '#000',
    position: 'relative',
  },
  videoPlayerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoThumbnail: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
  },
  playButton: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  videoInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 16,
  },
  videoTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    minWidth: 32,
  },
  playingIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,167,142,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  playingText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    gap: 12,
  },
  videoPlaceholderText: {
    color: Colors.white,
    fontSize: 16,
  },
  tabBar: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    paddingVertical: 16,
    shadowColor: Colors.slate400,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  tab: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.slate600,
  },
  tabTextActive: {
    color: Colors.white,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.slate800,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: Colors.slate600,
    lineHeight: 24,
    marginBottom: 28,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  infoItem: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 20,
    width: (width - 64) / 2,
    alignItems: 'center',
    shadowColor: Colors.slate400,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.slate500,
    marginBottom: 12,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.slate800,
  },
  quizButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 12,
  },
  quizButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  startVideoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  startVideoBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    flexShrink: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  stepNumberText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.gray900,
    marginBottom: 8,
    lineHeight: 22,
  },
  stepText: {
    fontSize: 14,
    color: Colors.gray700,
    lineHeight: 22,
    marginBottom: 12,
  },
  tipsContainer: {
    backgroundColor: Colors.blue + '15',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.blue,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.blue,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: Colors.blue,
    lineHeight: 18,
    marginBottom: 4,
  },
  importantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.orange,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 12,
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  importantText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  toolCategoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray900,
    marginBottom: 12,
    marginTop: 8,
  },
  toolItem: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    width: (width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.slate200,
  },
  primaryToolItem: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  secondaryToolItem: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.amber,
  },
  toolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  toolIcon: {
    fontSize: 24,
  },
  toolContent: {
    flex: 1,
    width: '100%',
  },
  toolName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray900,
    marginBottom: 6,
    lineHeight: 18,
  },
  toolDescription: {
    fontSize: 12,
    color: Colors.gray500,
    lineHeight: 16,
  },
  
  // Enhanced Lesson Styles
  progressSummary: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  
  chapterTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  chapterDescription: {
    fontSize: 13,
    color: Colors.gray500,
    marginBottom: 12,
    lineHeight: 18,
  },
  
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lessonNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray900,
    flex: 1,
  },
  lessonDuration: {
    fontSize: 12,
    color: Colors.gray500,
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 11,
    color: Colors.gray400,
    lineHeight: 14,
  },
  lessonActions: {
    alignItems: 'center',
    gap: 8,
  },
  completedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 20,
  },
  
  // Completion Card
  completionCard: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 2,
    gap: 12,
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  completionText: {
    fontSize: 14,
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
  nextModuleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  nextModuleBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});