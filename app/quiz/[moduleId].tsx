import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, LightTheme, DarkTheme } from '../../src/constants/colors';
import { MODULES } from '../../src/constants/modules';
import { QUIZ_DATA } from '../../src/constants/quiz';
import { useHistory } from '../../src/hooks/useHistory';
import NotificationManager from '../../src/utils/notifications';
import { NotificationHelper } from '../../src/utils/notificationHelper';

const { width } = Dimensions.get('window');
const PASS_THRESHOLD = 0.6;

export default function QuizScreen() {
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;
  const { addHistory } = useHistory();

  const module = MODULES.find((m) => m.id === moduleId);
  const quizData = QUIZ_DATA.find((q) => q.moduleId === moduleId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [currentUserId] = useState('user123'); // In real app, get from auth context

  if (!module || !quizData) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={56} color={theme.textMuted} />
          <Text style={[styles.errorText, { color: theme.text }]}>Kuis tidak ditemukan.</Text>
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

  const questions = quizData.questions;
  const currentQuestion = questions[currentIndex];
  const progress = (currentIndex + 1) / questions.length;

  const handleSelectAnswer = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNext = async () => {
    if (selectedAnswer === null) return;
    const newAnswers = [...answers, selectedAnswer];
    if (currentIndex < questions.length - 1) {
      setAnswers(newAnswers);
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
    } else {
      const score: number = newAnswers.reduce((sum: number, ans, i) => {
        return sum + (ans === questions[i].correct ? 1 : 0);
      }, 0);
      const passed = score / questions.length >= PASS_THRESHOLD;
      
      // Create congratulatory notification for quiz completion using enhanced system
      await NotificationHelper.createQuizCompletionNotification(
        currentUserId,
        `Kuis ${module?.title || 'Pembelajaran'}`,
        score,
        questions.length
      );
      
      // Additional notifications for achievement milestones
      if (passed && module) {
        // Add delayed notification for next steps
        setTimeout(async () => {
          const nextSteps = [
            'Lanjutkan ke modul pembelajaran berikutnya',
            'Review materi yang telah dipelajari',
            'Praktikkan ilmu yang telah diperoleh',
            'Bagikan pencapaian dengan teman',
            'Ikuti kuis tambahan untuk memperdalam pemahaman'
          ];
          
          await NotificationHelper.createNotification({
            title: '🎯 Langkah Selanjutnya',
            message: `Setelah lulus kuis "${module.title}", saatnya melanjutkan perjalanan belajar Anda!`,
            type: 'info',
            userId: currentUserId,
            actionData: { nextSteps }
          });
        }, 3000); // Delay to avoid notification spam
      }
      
      addHistory({
        moduleId: module!.id,
        moduleTitle: module!.title,
        moduleColor: module!.color,
        type: 'quiz',
        score,
        total: questions.length,
        passed,
      });
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
    return sum + (ans === questions[i]?.correct ? 1 : 0);
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
            <Ionicons
              name={passed ? 'trophy' : 'close-circle'}
              size={56}
              color={Colors.white}
            />
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
              <View
                style={[
                  styles.scoreCircle,
                  { borderColor: passed ? Colors.primary : Colors.rose },
                ]}
              >
                <Text style={[styles.scoreValue, { color: passed ? Colors.primary : Colors.rose }]}>
                  {finalScore}
                </Text>
                <Text style={[styles.scoreTotal, { color: theme.textMuted }]}>
                  /{questions.length}
                </Text>
              </View>
            </View>
            <Text style={[styles.scorePercent, { color: theme.text }]}>
              {Math.round((finalScore / questions.length) * 100)}%
            </Text>
            <View
              style={[
                styles.passBadge,
                { backgroundColor: passed ? Colors.greenLight : Colors.roseLight },
              ]}
            >
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
            const isCorrect = userAns === q.correct;
            return (
              <View key={i} style={[styles.reviewCard, { backgroundColor: theme.card }]}>
                <View style={styles.reviewHeader}>
                  <View
                    style={[
                      styles.reviewBadge,
                      { backgroundColor: isCorrect ? Colors.greenLight : Colors.roseLight },
                    ]}
                  >
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
                {q.answers.map((ans, ai) => (
                  <View
                    key={ai}
                    style={[
                      styles.reviewAnswer,
                      ai === q.correct && styles.reviewAnswerCorrect,
                      ai === userAns && ai !== q.correct && styles.reviewAnswerWrong,
                    ]}
                  >
                    <Text
                      style={[
                        styles.reviewAnswerText,
                        ai === q.correct && styles.reviewAnswerTextCorrect,
                        ai === userAns && ai !== q.correct && styles.reviewAnswerTextWrong,
                      ]}
                    >
                      {ans}
                    </Text>
                    {ai === q.correct && (
                      <Ionicons name="checkmark-circle" size={16} color={Colors.green} />
                    )}
                    {ai === userAns && ai !== q.correct && (
                      <Ionicons name="close-circle" size={16} color={Colors.rose} />
                    )}
                  </View>
                ))}
              </View>
            );
          })}

          {/* Action Buttons */}
          <View style={styles.resultActions}>
            <TouchableOpacity
              style={[styles.retryBtn, { borderColor: module.color }]}
              onPress={handleRetry}
              activeOpacity={0.85}
            >
              <Ionicons name="refresh" size={18} color={module.color} />
              <Text style={[styles.retryBtnText, { color: module.color }]}>Coba Lagi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.homeBtn, { backgroundColor: module.color }]}
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
  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* Header */}
      <LinearGradient colors={[Colors.primaryDark, module.color]} style={styles.quizHeader}>
        <View style={styles.quizHeaderTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.quizHeaderTitle} numberOfLines={1}>Kuis: {module.title}</Text>
          <Text style={styles.quizCounter}>
            {currentIndex + 1}/{questions.length}
          </Text>
        </View>
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
          <View style={[styles.questionNumber, { backgroundColor: module.color + '20' }]}>
            <Text style={[styles.questionNumberText, { color: module.color }]}>
              Soal {currentIndex + 1}
            </Text>
          </View>
          <Text style={[styles.questionText, { color: theme.text }]}>
            {currentQuestion.question}
          </Text>
        </View>

        {/* Answers */}
        <View style={styles.answersContainer}>
          {currentQuestion.answers.map((answer, index) => {
            const isSelected = selectedAnswer === index;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.answerCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  isSelected && { borderColor: module.color, backgroundColor: module.color + '15' },
                ]}
                onPress={() => handleSelectAnswer(index)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={isSelected ? module.color : theme.textMuted}
                />
                <Text style={[
                  styles.answerText,
                  { color: theme.text },
                  isSelected && { color: module.color },
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
            style={[
              styles.nextBtn,
              { backgroundColor: selectedAnswer !== null ? module.color : theme.border },
            ]}
            onPress={handleNext}
            disabled={selectedAnswer === null}
            activeOpacity={0.85}
          >
            <Text style={[
              styles.nextBtnText,
              { color: selectedAnswer !== null ? Colors.white : theme.textMuted },
            ]}>
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

  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  errorText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  backHomeBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backHomeBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },

  quizHeader: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16 },
  quizHeaderTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  quizHeaderTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.white },
  quizCounter: {
    fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  quizProgressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden' },
  quizProgressFill: { height: '100%', backgroundColor: Colors.white, borderRadius: 3 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  questionCard: {
    borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  questionNumber: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  questionNumberText: { fontSize: 12, fontWeight: '700' },
  questionText: { fontSize: 17, fontWeight: '600', lineHeight: 26 },

  answersContainer: { gap: 10, marginBottom: 16 },
  answerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, padding: 16, borderWidth: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  answerCorrect: { backgroundColor: Colors.greenLight, borderColor: Colors.green },
  answerWrong: { backgroundColor: Colors.roseLight, borderColor: Colors.rose },
  answerText: { flex: 1, fontSize: 15, lineHeight: 22 },
  answerTextCorrect: { color: Colors.green, fontWeight: '600' },
  answerTextWrong: { color: Colors.rose, fontWeight: '600' },

  feedbackCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderRadius: 12, padding: 14, marginBottom: 16,
  },
  feedbackText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },

  actionContainer: { gap: 10 },
  confirmBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  confirmBtnText: { fontSize: 16, fontWeight: '700' },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, paddingVertical: 14,
  },
  nextBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },

  // Result
  resultHeader: {
    paddingTop: 50, paddingBottom: 32, paddingHorizontal: 20, alignItems: 'center',
  },
  resultIconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, marginTop: 8,
  },
  resultTitle: { fontSize: 28, fontWeight: '800', color: Colors.white, marginBottom: 8 },
  resultSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20 },

  resultContent: { padding: 16 },
  scoreCard: {
    borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 5,
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
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  reviewBadge: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
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
