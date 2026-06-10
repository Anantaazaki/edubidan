import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { LecturerDatabase, Quiz, QuizQuestion, Material } from '../../src/utils/lecturerDatabase';

export default function QuizEditScreen() {
  const router = useRouter();
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const { isDark, theme, toggleTheme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [timeLimit, setTimeLimit] = useState('30');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    loadData();
  }, [quizId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quizData, materialsData] = await Promise.all([
        LecturerDatabase.getQuizById(quizId),
        LecturerDatabase.getAllMaterials()
      ]);

      if (quizData) {
        setQuiz(quizData);
        setTitle(quizData.title);
        setDescription(quizData.description);
        setMaterialId(quizData.materialId);
        setTimeLimit(quizData.timeLimit.toString());
        setQuestions(quizData.questions);
      } else {
        Alert.alert('Error', 'Quiz tidak ditemukan');
        router.back();
      }
      
      setMaterials(materialsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim() || questions.length === 0) {
      Alert.alert('Error', 'Lengkapi semua field yang diperlukan');
      return;
    }

    try {
      setSaving(true);
      const result = await LecturerDatabase.updateQuiz(quizId, {
        title: title.trim(),
        description: description.trim(),
        materialId,
        timeLimit: parseInt(timeLimit),
        questions
      });

      if (result.success) {
        Alert.alert('Sukses', 'Quiz berhasil diperbarui!');
        router.back();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
      Alert.alert('Error', 'Gagal menyimpan quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>Memuat quiz...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'light-content'} backgroundColor={Colors.primaryDark} />
      
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Edit Quiz</Text>
            <Text style={styles.headerSubtitle}>Perbarui informasi quiz</Text>
          </View>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Informasi Quiz</Text>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Judul Quiz *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Masukkan judul quiz"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Deskripsi *</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Masukkan deskripsi quiz"
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Durasi (menit) *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                value={timeLimit}
                onChangeText={setTimeLimit}
                placeholder="30"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Pertanyaan ({questions.length})
            </Text>
            
            {questions.map((question, index) => (
              <View key={question.id} style={[styles.questionCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.questionNumber, { color: theme.text }]}>
                  Pertanyaan {index + 1}
                </Text>
                <Text style={[styles.questionText, { color: theme.text }]}>
                  {question.question}
                </Text>
                
                {question.type === 'multiple-choice' && question.options && (
                  <View style={styles.options}>
                    {question.options.map((option: string, optIndex: number) => (
                      <Text key={optIndex} style={[styles.optionText, { color: theme.textMuted }]}>
                        {String.fromCharCode(65 + optIndex)}. {option}
                        {optIndex === question.correctAnswer && (
                          <Text style={{ color: Colors.primary }}> ✓</Text>
                        )}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.cancelBtn, { backgroundColor: theme.card }]}
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={[styles.cancelBtnText, { color: theme.text }]}>Batal</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: Colors.primary, opacity: saving ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark" size={16} color={Colors.white} />
              <Text style={styles.saveBtnText}>Simpan</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  themeToggle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  content: { padding: 20, paddingBottom: 100 },
  section: { borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },

  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  textArea: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, textAlignVertical: 'top' },

  questionCard: { borderRadius: 8, padding: 12, marginBottom: 12 },
  questionNumber: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  questionText: { fontSize: 14, marginBottom: 8 },
  options: { marginTop: 8 },
  optionText: { fontSize: 12, marginBottom: 4 },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 16, borderTopWidth: 1, gap: 12 },
  cancelBtn: { flex: 1, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '600' },
  saveBtn: { flex: 1, borderRadius: 8, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  saveBtnText: { fontSize: 14, fontWeight: '600', color: Colors.white },
});