import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, LightTheme, DarkTheme } from '../../src/constants/colors';
import { LecturerDatabase, Quiz, Material } from '../../src/utils/lecturerDatabase';
import { useHistory } from '../../src/hooks/useHistory';
import { NotificationHelper } from '../../src/utils/notificationHelper';
import { auth } from '../../src/config/firebase';
import { LecturerDatabase as LDB } from '../../src/utils/lecturerDatabase';

const PASS_THRESHOLD = 0.6;

export default function QuizScreen() {
  // moduleId param can be either a Quiz ID or a Material ID
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;
  const { addHistory } = useHistory();

  const currentUserId = auth.currentUser?.uid || 'user_anonymous';

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [material, setMaterial] = useState<Material | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    loadQuizData();
  }, [moduleId]);

  const loadQuizData = async () => {
    if (!moduleId) return;
    setLoading(true);
    try {
      // Try to load as a direct Quiz ID first
      let foundQuiz = await LecturerDatabase.getQuizById(String(moduleId));

      // If not found as quiz ID, try as material ID
      if (!foundQuiz) {
        const allQuizzes = await LecturerDatabase.getAllQuizzes();
        foundQuiz = allQuizzes.find(q => q.materialId === String(moduleId)) || null;
      }

      setQuiz(foundQuiz);

      // Load linked material for display
      if (foundQuiz?.materialId) {
        const mat = await LecturerDatabase.getMaterialById(foundQuiz.materialId);
        setMaterial(mat);
      }
    } catch (e) {
      console.error('Error loading quiz:', e);
    } finally {
      setLoading(false);
    }
  };

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
        <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.quizHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>Memuat kuis...</Text>
        </View>
      </View>
    );
  }

  // ── Not Found State ────────────────────────────────────────────────────────
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
        <View style={styles.errorContainer}>
          <Ionicons name="help-circle-outline" size={64} color={theme.textMuted} />
          <Text style={[styles.errorText, { color: theme.text }]}>
            {!quiz ? 'Kuis tidak ditemukan' : 'Kuis belum memiliki soal'}
          </Text>
          <Text style={[styles.errorSubtext, { color: theme.textMuted }]}>
            {!quiz
              ? 'Dosen belum menambahkan kuis untuk materi ini.'
              : 'Dosen belum menambahkan soal ke kuis ini.'}
          </Text>
          <TouchableOpacity
            style={[styles.backHomeBtn, { backgroundColor: Colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backHomeBtnText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const questions = quiz.questions;
  const currentQuestion = questions[currentIndex];

  // Normalize question format — supports both `options`/`correctAnswer` and legacy `answers`/`correct`
  const getOptions = (q: typeof questions[0]): string[] =>
    (q.options && q.options.length > 0) ? q.options : (q.answers || []);
  const getCorrect = (q: typeof questions[0]): number =>
    q.correctAnswer !== undefined ? q.correctAnswer : (q.correct ?? 0);

  const progress = (currentIndex + 1) / questions.length;
  const quizColor = Colors.primary;

  const handleSelectAnswer = (index: number) => setSelectedAnswer(index);

  const handleNext = async () => {
    if (selectedAnswer === null) return;
    const newAnswers = [...answers, selectedAnswer];

    if (currentIndex < questions.length - 1) {
      setAnswers(newAnswers);
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
    } else {
      // Calculate score
      const score: number = newAnswers.reduce((sum: number, ans, i) => {
        return sum + (ans === getCorrect(questions[i]) ? 1 : 0);
      }, 0);
      const passed = score / questions.length >= PASS_THRESHOLD;

      // Save to history
      addHistory({
        moduleId: quiz.id,
        moduleTitle: quiz.title,
        moduleColor: quizColor,
        type: 'quiz',
        score,
        total: questions.length,
        passed,
      });

      // Save grade to Firestore
      try {
        await LDB.saveGrade({
          studentId: currentUserId,
          studentName: auth.currentUser?.displayName || auth.currentUser?.email || 'Mahasiswa',
          quizId: quiz.id,
          quizTitle: quiz.title,
          score: Math.round((score / questions.length) * 100),
          maxScore: 100,
          completedAt: Date.now(),
          timeSpent: '-',
        });
      } catch (e) {
        console.error('Error saving grade:', e);
      }

      // Create completion notification
      try {
        await NotificationHelper.createQuizCompletionNotification(
          currentUserId,
          quiz.title,
          score,
          questions.length
        );

        if (passed) {
          setTimeout(async () => {
            await NotificationHelper.createNotification({
              title: '🎯 Langkah Selanjutnya',
              message: `Selamat lulus kuis "${quiz.title}"! Lanjutkan ke materi berikutnya untuk terus berkembang.`,
              type: 'info',
              userId: currentUserId,
              actionData: {},
            });
          }, 3000);
        }
      } catch (e) {
        console.error('Error creating notification:', e);
      }

      setAnswers(newAnswers);
      setShowResult(true);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResult(false);
  };

  const finalScore: number = answers.reduce((sum: number, ans, i) => {
    return sum + (ans === getCorrect(questions[i]) ? 1 : 0);
  }, 0);
  const passed = finalScore / questions.length >= PASS_THRESHOLD;

  // ── Result Screen ──────────────────────────────────────────────────────────
  if (showResult) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
        <LinearGradient
          colors={passed ? [Colors.primaryDark, Colors.primary] : ['#7F1D1D', Colors.rose]}
          style={styles.resultHeader}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.resultIconWrap}>
            <Ionicons name={passed ? 'trophy' : 'close-circle'} size={56} color={Colors.white} />
          </View>
          <Text style={styles.resultTitle}>{passed ? 'Selamat!' : 'Belum Lulus'}</Text>
          <Text style={styles.resultSubtitle}>
            {passed
              ? 'Anda berhasil lulus kuis ini dengan baik!'
              : 'Jangan menyerah, coba lagi untuk hasil lebih baik!'}
          </Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
          {/* Score Card */}
          <View style={[styles.scoreCard, { backgroundColor: theme.card }]}>
            <View style={styles.scoreCircleWrap}>
              <View style={[styles.scoreCircle, { borderColor: passed ? Colors.primary : Colors.rose }]}>
                <Text style={[styles.scoreValue, { color: passed ? Colors.primary : Colors.rose }]}>
                  {finalScore}
                </Text>
                <Text style={[styles.scoreTotal, { color: theme.textMuted }]}>/{questions.length}</Text>
              </View>
            </View>
            <Text style={[styles.scorePercent, { color: theme.text }]}>
              {Math.round((finalScore / questions.length) * 100)}%
            </Text>
            <View style={[styles.passBadge, { backgroundColor: passed ? Colors.greenLight : Colors.roseLight }]}>
              <Ionicons
                name={passed ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={passed ? Colors.green : Colors.rose}
              />
              <Text style={[styles.passBadgeText, { color: passed ? Colors.green : Colors.rose }]}>
                {passed ? 'LULUS' : 'TIDAK LULUS'}
              </Text>
            </View>
            <Text style={[styles.scoreNote, { color: theme.textMuted }]}>
              Nilai minimum kelulusan: {Math.round(PASS_THRESHOLD * 100)}%
            </Text>
          </View>

          {/* Answer Review */}
          <Text style={[styles.reviewTitle, { color: theme.text }]}>Pembahasan Jawaban</Text>
          {questions.map((q, i) => {
            const userAns = answers[i];
            const correct = getCorrect(q);
            const opts = getOptions(q);
            const isCorrect = userAns === correct;
            return (
              <View key={i} style={[styles.reviewCard, { backgroundColor: theme.card }]}>
                <View style={styles.reviewHeader}>
                  <View style={[styles.reviewBadge, { backgroundColor: isCorrect ? Colors.greenLight : Colors.roseLight }]}>
                    <Ionicons
                      name={isCorrect ? 'checkmark' : 'close'}
                      size={14}
                      color={isCorrect ? Colors.green : Colors.rose}
                    />
                  </View>
                  <Text style={[styles.reviewQuestion, { color: theme.text }]}>
                    {i + 1}. {q.question}
                  </Text>
                </View>
                {opts.map((ans, ai) => (
                  <View
                    key={ai}
                    style={[
                      styles.reviewAnswer,
                      ai === correct && styles.reviewAnswerCorrect,
                      ai === userAns && ai !== correct && styles.reviewAnswerWrong,
                    ]}
                  >
                    <Text style={[
                      styles.reviewAnswerText,
                      ai === correct && styles.reviewAnswerTextCorrect,
                      ai === userAns && ai !== correct && styles.reviewAnswerTextWrong,
                    ]}>
                      {ans}
                    </Text>
                    {ai === correct && <Ionicons name="checkmark-circle" size={16} color={Colors.green} />}
                    {ai === userAns && ai !== correct && <Ionicons name="close-circle" size={16} color={Colors.rose} />}
                  </View>
                ))}
                {q.explanation ? (
                  <View style={[styles.explanationBox, { backgroundColor: theme.surfaceSecondary }]}>
                    <Ionicons name="information-circle-outline" size={14} color={theme.textMuted} />
                    <Text style={[styles.explanationText, { color: theme.textMuted }]}>{q.explanation}</Text>
                  </View>
                ) : null}
              </View>
            );
          })}

          {/* Action Buttons */}
          <View style={styles.resultActions}>
            <TouchableOpacity
              style={[styles.retryBtn, { borderColor: quizColor }]}
              onPress={handleRetry}
              activeOpacity={0.85}
            >
              <Ionicons name="refresh" size={18} color={quizColor} />
              <Text style={[styles.retryBtnText, { color: quizColor }]}>Coba Lagi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.homeBtn, { backgroundColor: quizColor }]}
              onPress={() => router.replace('/(tabs)/home')}
              activeOpacity={0.85}
            >
              <Ionicons name="home" size={18} color={Colors.white} />
              <Text style={styles.homeBtnText}>Beranda</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bottomPad} />
        </ScrollView>
      </View>
    );
  }

  // ── Quiz Question Screen ───────────────────────────────────────────────────
  const opts = getOptions(currentQuestion);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      <LinearGradient colors={[Colors.primaryDark, quizColor]} style={styles.quizHeader}>
        <View style={styles.quizHeaderTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.quizHeaderTitle} numberOfLines={1}>
            {quiz.title}
          </Text>
          <Text style={styles.quizCounter}>{currentIndex + 1}/{questions.length}</Text>
        </View>
        {material ? (
          <Text style={styles.quizMaterialLabel} numberOfLines={1}>
            📚 {material.title}
          </Text>
        ) : null}
        <View style={styles.quizProgressBg}>
          <View style={[styles.quizProgressFill, { width: `${progress * 100}%` }]} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question */}
        <View style={[styles.questionCard, { backgroundColor: theme.card }]}>
          <View style={[styles.questionNumber, { backgroundColor: quizColor + '20' }]}>
            <Text style={[styles.questionNumberText, { color: quizColor }]}>Soal {currentIndex + 1}</Text>
          </View>
          <Text style={[styles.questionText, { color: theme.text }]}>{currentQuestion.question}</Text>
        </View>

        {/* Answers */}
        <View style={styles.answersContainer}>
          {opts.map((answer, index) => {
            const isSelected = selectedAnswer === index;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.answerCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  isSelected && { borderColor: quizColor, backgroundColor: quizColor + '15' },
                ]}
                onPress={() => handleSelectAnswer(index)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={isSelected ? quizColor : theme.textMuted}
                />
                <Text style={[
                  styles.answerText,
                  { color: theme.text },
                  isSelected && { color: quizColor },
                ]}>
                  {answer}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Next Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: selectedAnswer !== null ? quizColor : theme.border }]}
            onPress={handleNext}
            disabled={selectedAnswer === null}
            activeOpacity={0.85}
          >
            <Text style={[styles.nextBtnText, { color: selectedAnswer !== null ? Colors.white : theme.textMuted }]}>
              {currentIndex < questions.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil'}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={selectedAnswer !== null ? Colors.white : theme.textMuted}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  errorText: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  errorSubtext: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  backHomeBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backHomeBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },

  quizHeader: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16 },
  quizHeaderTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  quizHeaderTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.white },
  quizCounter: {
    fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  quizMaterialLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 10, paddingLeft: 4 },
  quizProgressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden' },
  quizProgressFill: { height: '100%', backgroundColor: Colors.white, borderRadius: 3 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  questionCard: {
    borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  questionNumber: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  questionNumberText: { fontSize: 12, fontWeight: '700' },
  questionText: { fontSize: 17, fontWeight: '600', lineHeight: 26 },

  answersContainer: { gap: 10, marginBottom: 16 },
  answerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, padding: 16, borderWidth: 2,
  },
  answerText: { flex: 1, fontSize: 15, lineHeight: 22 },

  actionContainer: { gap: 10 },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, paddingVertical: 14,
  },
  nextBtnText: { fontSize: 16, fontWeight: '700' },

  // Result
  resultHeader: { paddingTop: 50, paddingBottom: 32, paddingHorizontal: 20, alignItems: 'center' },
  resultIconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, marginTop: 8,
  },
  resultTitle: { fontSize: 28, fontWeight: '800', color: Colors.white, marginBottom: 8 },
  resultSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20 },
  resultContent: { padding: 16 },
  scoreCard: {
    borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 5,
  },
  scoreCircleWrap: { marginBottom: 12 },
  scoreCircle: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 6,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
  },
  scoreValue: { fontSize: 36, fontWeight: '800' },
  scoreTotal: { fontSize: 18, fontWeight: '600', marginTop: 8 },
  scorePercent: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  passBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 10,
  },
  passBadgeText: { fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  scoreNote: { fontSize: 12, textAlign: 'center' },

  reviewTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  reviewCard: {
    borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  reviewBadge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  reviewQuestion: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  reviewAnswer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, marginBottom: 4,
  },
  reviewAnswerCorrect: { backgroundColor: Colors.greenLight },
  reviewAnswerWrong: { backgroundColor: Colors.roseLight },
  reviewAnswerText: { flex: 1, fontSize: 13, color: Colors.slate600 },
  reviewAnswerTextCorrect: { color: Colors.green, fontWeight: '600' },
  reviewAnswerTextWrong: { color: Colors.rose, fontWeight: '600' },
  explanationBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, padding: 10, borderRadius: 8, marginTop: 6 },
  explanationText: { flex: 1, fontSize: 12, lineHeight: 18 },

  resultActions: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 8 },
  retryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 2,
  },
  retryBtnText: { fontSize: 15, fontWeight: '700' },
  homeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14,
  },
  homeBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  bottomPad: { height: 24 },
});
