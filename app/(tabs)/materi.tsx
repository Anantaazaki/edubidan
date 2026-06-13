import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { MODULES } from '../../src/constants/modules';
import { QUIZ_DATA } from '../../src/constants/quiz';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationManager from '../../src/utils/notifications';

const PROGRESS_KEY = '@edubidan_progress';
const CATEGORIES = ['Semua', 'Kehamilan', 'Persalinan', 'Nifas', 'Neonatus', 'Laktasi', 'Keluarga Berencana', 'Imunisasi', 'Gizi', 'Reproduksi', 'Skrining'];

export default function MateriScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [moduleProgress, setModuleProgress] = useState<{[key: string]: number}>({});
  
  // Quiz states
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  // Notification states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadProgress();
    loadNotifications();
  }, []);

  const loadProgress = async () => {
    try {
      const progressData: {[key: string]: number} = {};
      for (const module of MODULES) {
        const stored = await AsyncStorage.getItem(`@edubidan_progress_${module.id}`);
        if (stored) {
          const progress = JSON.parse(stored);
          const completedLessons = progress.completedLessons?.length || 0;
          // Calculate total lessons from chapters
          const totalLessons = module.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
          progressData[module.id] = totalLessons > 0 ? (completedLessons / totalLessons) : 0;
        } else {
          progressData[module.id] = 0;
        }
      }
      setModuleProgress(progressData);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const notifications = await NotificationManager.getNotifications();
      setNotifications(notifications);
      setUnreadCount(notifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const startQuiz = (moduleId: string) => {
    const quiz = QUIZ_DATA.find(q => q.moduleId === moduleId);
    if (quiz) {
      setSelectedQuiz(quiz);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setScore(0);
      setAnswers([]);
      setShowQuiz(true);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    let newScore = score;
    if (selectedAnswer === selectedQuiz.questions[currentQuestion].correct) {
      newScore = score + 1;
      setScore(newScore);
    }

    if (currentQuestion + 1 < selectedQuiz.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      const passed = newScore / selectedQuiz.questions.length >= 0.6;
      const module = MODULES.find(m => m.id === selectedQuiz.moduleId);
      
      // Create congratulatory notification for quiz completion
      if (passed && module) {
        await NotificationManager.createQuizPassedNotification(
          module.title,
          newScore,
          selectedQuiz.questions.length
        );
        
        // Check if this completes all requirements for next module suggestion
        const nextModules = NotificationManager.getRecommendedNextModules(module.id);
        if (nextModules.length > 0) {
          setTimeout(async () => {
            await NotificationManager.addNotification({
              title: '🎯 Siap Lanjut?',
              message: `Setelah menguasai ${module.title}, saatnya mempelajari "${nextModules[0]}". Lanjutkan perjalanan belajar Anda!`,
              type: 'info'
            });
          }, 2000);
        }
      }
      
      setShowResult(true);
      loadNotifications(); // Refresh notifications
    }
  };

  const closeQuiz = () => {
    setShowQuiz(false);
    setSelectedQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Pemula';
      case 'intermediate': return 'Menengah';
      case 'advanced': return 'Lanjutan';
      default: return 'Pemula';
    }
  };

  const filtered = (MODULES || []).filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'Semua' || m.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'light-content'} backgroundColor={Colors.primaryDark} />

      {/* Header */}
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Materi Pembelajaran</Text>
            <Text style={styles.headerSubtitle}>
              {MODULES ? MODULES.length : 0} modul tersedia untuk dipelajari
            </Text>
          </View>
          <View style={styles.headerRight}>
            {/* Theme Toggle */}
            <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={Colors.white} />
            </TouchableOpacity>
            
            {/* Notification Button */}
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => setShowNotifications(true)}
            >
              <Ionicons name="notifications" size={18} color={Colors.white} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={Colors.slate400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari materi..."
            placeholderTextColor={Colors.slate400}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.slate400} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Category Filter */}
      <View style={[styles.categoryWrap, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                activeCategory === cat
                  ? styles.categoryChipActive
                  : { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
              ]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === cat
                    ? styles.categoryChipTextActive
                    : { color: theme.textMuted },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Tidak Ditemukan</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Coba kata kunci lain atau ubah filter kategori
            </Text>
          </View>
        ) : (
          (filtered || []).map((module) => {
            const progress = moduleProgress[module.id] || 0;
            const totalLessons = module.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
            
            return (
              <TouchableOpacity
                key={module.id}
                style={[styles.moduleCard, { backgroundColor: theme.card }]}
                onPress={() => router.push(`/module/${module.id}`)}
                activeOpacity={0.85}
              >
                {/* Color accent */}
                <View style={[styles.colorAccent, { backgroundColor: module.color }]} />

                <View style={styles.cardBody}>
                  {/* Top row */}
                  <View style={styles.cardTopRow}>
                    <View style={[styles.iconWrap, { backgroundColor: module.color + '20' }]}>
                      <Ionicons name="book-outline" size={22} color={module.color} />
                    </View>
                    <View style={styles.headerBadges}>
                      <View style={[styles.categoryBadge, { backgroundColor: module.color + '20' }]}>
                        <Text style={[styles.categoryBadgeText, { color: module.color }]}>
                          {module.category}
                        </Text>
                      </View>
                      <View style={[styles.difficultyBadge, { backgroundColor: theme.surfaceSecondary }]}>
                        <Text style={[styles.difficultyBadgeText, { color: theme.textMuted }]}>
                          {getDifficultyText(module.difficulty)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Title */}
                  <Text style={[styles.moduleTitle, { color: theme.text }]}>{module.title}</Text>

                  {/* Description */}
                  <Text style={[styles.moduleDesc, { color: theme.textMuted }]} numberOfLines={2}>
                    {module.description || 'Deskripsi materi pembelajaran'}
                  </Text>

                  {/* Enhanced Meta */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="play-circle-outline" size={14} color={theme.textMuted} />
                      <Text style={[styles.metaText, { color: theme.textMuted }]}>
                        {module.videos} video
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="list-outline" size={14} color={theme.textMuted} />
                      <Text style={[styles.metaText, { color: theme.textMuted }]}>
                        {totalLessons} pelajaran
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color={theme.textMuted} />
                      <Text style={[styles.metaText, { color: theme.textMuted }]}>
                        {module.duration}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="construct-outline" size={14} color={theme.textMuted} />
                      <Text style={[styles.metaText, { color: theme.textMuted }]}>
                        {(module.tools || []).length} alat
                      </Text>
                    </View>
                  </View>

                  {/* Progress */}
                  <View style={styles.progressRow}>
                    <View style={[styles.progressBg, { backgroundColor: theme.border }]}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${progress * 100}%`, backgroundColor: module.color },
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressText, { color: theme.textMuted }]}>
                      {Math.round(progress * 100)}%
                    </Text>
                  </View>

                  {/* Action Row */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.studyBtn, { backgroundColor: module.color }]}
                      onPress={() => router.push(`/module/${module.id}`)}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="play" size={14} color={Colors.white} />
                      <Text style={styles.studyBtnText}>
                        {progress > 0 ? 'Lanjutkan' : 'Mulai Belajar'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.quizBtn, { borderColor: module.color }]}
                      onPress={() => startQuiz(module.id)}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="help-circle-outline" size={14} color={module.color} />
                      <Text style={[styles.quizBtnText, { color: module.color }]}>Kuis</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Quiz Modal */}
      <Modal
        visible={showQuiz}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeQuiz}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          {!showResult ? (
            <>
              {/* Quiz Header */}
              <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={closeQuiz}>
                  <Text style={[styles.modalCancel, { color: Colors.primary }]}>Tutup</Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {selectedQuiz?.title || 'Kuis'}
                </Text>
                <View style={{ width: 50 }} />
              </View>

              {/* Quiz Content */}
              <View style={styles.quizContent}>
                {selectedQuiz && (
                  <>
                    {/* Progress */}
                    <View style={styles.questionProgress}>
                      <Text style={[styles.questionNumber, { color: theme.textMuted }]}>
                        Pertanyaan {currentQuestion + 1} dari {selectedQuiz.questions.length}
                      </Text>
                      <View style={[styles.progressBarSmall, { backgroundColor: theme.border }]}>
                        <View
                          style={[
                            styles.progressFillSmall,
                            {
                              width: `${((currentQuestion + 1) / selectedQuiz.questions.length) * 100}%`,
                              backgroundColor: Colors.primary,
                            },
                          ]}
                        />
                      </View>
                    </View>

                    {/* Question */}
                    <Text style={[styles.questionText, { color: theme.text }]}>
                      {selectedQuiz.questions[currentQuestion]?.question}
                    </Text>

                    {/* Options */}
                    <View style={styles.optionsContainer}>
                      {selectedQuiz.questions[currentQuestion]?.answers.map((option: string, index: number) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor: selectedAnswer === index ? Colors.primaryLight : theme.card,
                              borderColor: selectedAnswer === index ? Colors.primary : theme.border,
                            },
                          ]}
                          onPress={() => handleAnswerSelect(index)}
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.optionIndicator,
                              {
                                backgroundColor: selectedAnswer === index ? Colors.primary : theme.surface,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.optionLetter,
                                { color: selectedAnswer === index ? Colors.white : theme.text },
                              ]}
                            >
                              {String.fromCharCode(65 + index)}
                            </Text>
                          </View>
                          <Text style={[styles.optionText, { color: theme.text }]}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Next Button */}
                    <TouchableOpacity
                      style={[
                        styles.nextButton,
                        {
                          backgroundColor: selectedAnswer !== null ? Colors.primary : theme.border,
                        },
                      ]}
                      onPress={handleNextQuestion}
                      disabled={selectedAnswer === null}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.nextButtonText,
                          {
                            color: selectedAnswer !== null ? Colors.white : theme.textMuted,
                          },
                        ]}
                      >
                        {currentQuestion + 1 === selectedQuiz.questions.length ? 'Selesai' : 'Lanjut'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </>
          ) : (
            /* Quiz Result */
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Ionicons
                  name={score / selectedQuiz.questions.length >= 0.6 ? 'checkmark-circle' : 'close-circle'}
                  size={80}
                  color={score / selectedQuiz.questions.length >= 0.6 ? Colors.success : Colors.rose}
                />
                <Text style={[styles.resultTitle, { color: theme.text }]}>
                  {score / selectedQuiz.questions.length >= 0.6 ? 'Selamat!' : 'Coba Lagi'}
                </Text>
                <Text style={[styles.resultScore, { color: theme.text }]}>
                  Skor: {score}/{selectedQuiz.questions.length}
                </Text>
                <Text style={[styles.resultPercentage, { color: theme.textMuted }]}>
                  {Math.round((score / selectedQuiz.questions.length) * 100)}%
                </Text>
              </View>

              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={[styles.nextButton, { backgroundColor: Colors.primary, marginBottom: 12 }]}
                  onPress={closeQuiz}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.nextButtonText, { color: Colors.white }]}>Selesai</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.nextButton, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}
                  onPress={() => {
                    setCurrentQuestion(0);
                    setSelectedAnswer(null);
                    setShowResult(false);
                    setScore(0);
                    setAnswers([]);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.nextButtonText, { color: theme.text }]}>Ulangi Kuis</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setShowNotifications(false)}>
              <Text style={[styles.modalCancel, { color: Colors.primary }]}>Tutup</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Notifikasi</Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Ionicons name="notifications-off-outline" size={48} color={theme.textMuted} />
                <Text style={[styles.emptyNotificationsText, { color: theme.textMuted }]}>
                  Belum ada notifikasi
                </Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <View key={notification.id} style={[styles.notificationItem, { backgroundColor: theme.card }]}>
                  <View style={styles.notificationContent}>
                    <Text style={[styles.notificationTitle, { color: theme.text }]}>
                      {notification.title}
                    </Text>
                    <Text style={[styles.notificationMessage, { color: theme.textMuted }]}>
                      {notification.message}
                    </Text>
                    <Text style={[styles.notificationTime, { color: theme.textMuted }]}>
                      {new Date(notification.timestamp).toLocaleDateString('id-ID')}
                    </Text>
                  </View>
                  {!notification.isRead && (
                    <View style={[styles.unreadDot, { backgroundColor: Colors.primary }]} />
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.rose,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.slate900 },

  categoryWrap: { borderBottomWidth: 1, paddingVertical: 10 },
  categoryScroll: { paddingHorizontal: 16, gap: 8 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: { fontSize: 13, fontWeight: '600' },
  categoryChipTextActive: { color: Colors.white },

  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  moduleCard: {
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  colorAccent: { width: 5 },
  cardBody: { flex: 1, padding: 16 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerBadges: { flexDirection: 'row', gap: 6 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryBadgeText: { fontSize: 11, fontWeight: '700' },
  difficultyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  difficultyBadgeText: { fontSize: 10, fontWeight: '600' },
  moduleTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6, lineHeight: 22 },
  moduleDesc: { fontSize: 13, lineHeight: 19, marginBottom: 12 },

  metaRow: { flexDirection: 'row', gap: 14, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12 },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  progressBg: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '600', minWidth: 32 },

  actionRow: { flexDirection: 'row', gap: 10 },
  studyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  studyBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  quizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  quizBtnText: { fontSize: 13, fontWeight: '700' },

  bottomPad: { height: 24 },

  // Quiz Modal Styles
  quizContainer: { flex: 1 },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  quizTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  quizContent: { flex: 1, padding: 20 },
  questionProgress: { marginBottom: 24 },
  questionNumber: { fontSize: 14, marginBottom: 8 },
  progressBarSmall: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFillSmall: { height: '100%', borderRadius: 2 },
  questionText: { fontSize: 18, fontWeight: '600', lineHeight: 26, marginBottom: 24 },
  optionsContainer: { gap: 12, marginBottom: 32 },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLetter: { fontSize: 14, fontWeight: 'bold' },
  optionText: { flex: 1, fontSize: 16, lineHeight: 22 },
  nextButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  nextButtonText: { fontSize: 16, fontWeight: 'bold' },
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  resultHeader: { alignItems: 'center', marginBottom: 40 },
  resultTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  resultScore: { fontSize: 18, marginBottom: 4 },
  resultPercentage: { fontSize: 16 },
  resultActions: { width: '100%' },

  // Modal styles
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalCancel: { fontSize: 16, fontWeight: '600' },
  modalContent: { flex: 1, padding: 20 },
  emptyNotifications: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyNotificationsText: { fontSize: 16, marginTop: 12 },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  notificationMessage: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  notificationTime: { fontSize: 11 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
});
