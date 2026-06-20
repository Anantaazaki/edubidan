import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { LecturerDatabase, Quiz, QuizQuestion } from '../../src/utils/lecturerDatabase';

// Form state untuk satu soal
interface QuestionForm {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

const EMPTY_QUESTION: QuestionForm = {
  id: '',
  question: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
};

export default function QuizEditScreen() {
  const router = useRouter();
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const { isDark, theme, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Quiz info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState('30');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Modal tambah/edit soal
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionForm>({ ...EMPTY_QUESTION });

  useEffect(() => { loadData(); }, [quizId]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (!quizId) { router.back(); return; }
      const quiz = await LecturerDatabase.getQuizById(quizId);
      if (!quiz) { Alert.alert('Error', 'Quiz tidak ditemukan'); router.back(); return; }

      setTitle(quiz.title);
      setDescription(quiz.description);
      setTimeLimit(quiz.timeLimit.toString());
      setQuestions(quiz.questions || []);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data quiz');
    } finally {
      setLoading(false);
    }
  };

  // ── Save Quiz ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Error', 'Judul quiz tidak boleh kosong'); return; }
    if (!description.trim()) { Alert.alert('Error', 'Deskripsi tidak boleh kosong'); return; }
    if (questions.length === 0) { Alert.alert('Error', 'Quiz harus memiliki minimal 1 soal'); return; }

    try {
      setSaving(true);
      const result = await LecturerDatabase.updateQuiz(quizId, {
        title: title.trim(),
        description: description.trim(),
        timeLimit: parseInt(timeLimit) || 30,
        questions,
        updatedAt: Date.now(),
      });

      if (result.success) {
        Alert.alert('Sukses ✅', 'Quiz berhasil disimpan ke Firebase', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan quiz');
    } finally {
      setSaving(false);
    }
  };

  // ── Tambah Soal ────────────────────────────────────────────────────────────
  const openAddQuestion = () => {
    setEditingIndex(null);
    setQuestionForm({
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
    });
    setShowQuestionModal(true);
  };

  // ── Edit Soal ──────────────────────────────────────────────────────────────
  const openEditQuestion = (index: number) => {
    const q = questions[index];
    setEditingIndex(index);
    setQuestionForm({
      id: q.id,
      question: q.question,
      options: q.options?.length === 4 ? [...q.options] : ['', '', '', ''],
      correctAnswer: q.correctAnswer ?? 0,
    });
    setShowQuestionModal(true);
  };

  // ── Hapus Soal ─────────────────────────────────────────────────────────────
  const handleDeleteQuestion = (index: number) => {
    Alert.alert(
      'Hapus Soal',
      `Apakah Anda yakin ingin menghapus Soal ${index + 1}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            const updated = questions.filter((_, i) => i !== index);
            setQuestions(updated);
          },
        },
      ]
    );
  };

  // ── Simpan Soal dari Modal ─────────────────────────────────────────────────
  const handleSaveQuestion = () => {
    // Validasi
    if (!questionForm.question.trim()) {
      Alert.alert('Error', 'Pertanyaan tidak boleh kosong'); return;
    }
    const emptyOption = questionForm.options.findIndex(o => !o.trim());
    if (emptyOption !== -1) {
      Alert.alert('Error', `Opsi ${String.fromCharCode(65 + emptyOption)} tidak boleh kosong`); return;
    }

    const newQuestion: QuizQuestion = {
      id: questionForm.id || Date.now().toString(),
      question: questionForm.question.trim(),
      options: questionForm.options.map(o => o.trim()),
      correctAnswer: questionForm.correctAnswer,
      type: 'multiple_choice',
    };

    if (editingIndex !== null) {
      // Edit soal yang ada
      const updated = [...questions];
      updated[editingIndex] = newQuestion;
      setQuestions(updated);
    } else {
      // Tambah soal baru
      setQuestions([...questions, newQuestion]);
    }

    setShowQuestionModal(false);
  };

  // ── Update opsi jawaban ────────────────────────────────────────────────────
  const updateOption = (index: number, value: string) => {
    const opts = [...questionForm.options];
    opts[index] = value;
    setQuestionForm({ ...questionForm, options: opts });
  };

  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>Memuat quiz...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* Header */}
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Edit Quiz</Text>
            <Text style={styles.headerSubtitle}>{questions.length} soal</Text>
          </View>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Informasi Quiz */}
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
                placeholder="Deskripsi quiz"
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
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

          {/* Daftar Soal */}
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Soal Quiz ({questions.length})
              </Text>
              <TouchableOpacity
                style={[styles.addQuestionBtn, { backgroundColor: Colors.primary }]}
                onPress={openAddQuestion}
              >
                <Ionicons name="add" size={16} color={Colors.white} />
                <Text style={styles.addQuestionBtnText}>Tambah Soal</Text>
              </TouchableOpacity>
            </View>

            {questions.length === 0 ? (
              <View style={styles.emptyQuestions}>
                <Ionicons name="help-circle-outline" size={48} color={theme.textMuted} />
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                  Belum ada soal. Tap "Tambah Soal" untuk mulai.
                </Text>
              </View>
            ) : (
              questions.map((question, index) => (
                <View key={question.id} style={[styles.questionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.questionHeader}>
                    <View style={[styles.questionNumBadge, { backgroundColor: Colors.primaryLight }]}>
                      <Text style={[styles.questionNum, { color: Colors.primary }]}>Soal {index + 1}</Text>
                    </View>
                    <View style={styles.questionActions}>
                      <TouchableOpacity
                        style={[styles.questionActionBtn, { backgroundColor: Colors.blueLight }]}
                        onPress={() => openEditQuestion(index)}
                      >
                        <Ionicons name="create-outline" size={14} color={Colors.blue} />
                        <Text style={[styles.questionActionText, { color: Colors.blue }]}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.questionActionBtn, { backgroundColor: Colors.roseLight }]}
                        onPress={() => handleDeleteQuestion(index)}
                      >
                        <Ionicons name="trash-outline" size={14} color={Colors.rose} />
                        <Text style={[styles.questionActionText, { color: Colors.rose }]}>Hapus</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={[styles.questionText, { color: theme.text }]} numberOfLines={3}>
                    {question.question}
                  </Text>

                  {question.options && (
                    <View style={styles.optionsList}>
                      {question.options.map((opt, optIdx) => (
                        <View
                          key={optIdx}
                          style={[
                            styles.optionRow,
                            optIdx === question.correctAnswer && styles.correctOptionRow,
                          ]}
                        >
                          <View style={[
                            styles.optionLetter,
                            { backgroundColor: optIdx === question.correctAnswer ? Colors.primary : theme.border }
                          ]}>
                            <Text style={[
                              styles.optionLetterText,
                              { color: optIdx === question.correctAnswer ? Colors.white : theme.textMuted }
                            ]}>
                              {String.fromCharCode(65 + optIdx)}
                            </Text>
                          </View>
                          <Text style={[
                            styles.optionText,
                            { color: optIdx === question.correctAnswer ? Colors.primary : theme.text },
                          ]} numberOfLines={2}>
                            {opt}
                          </Text>
                          {optIdx === question.correctAnswer && (
                            <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer Save */}
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
              <Ionicons name="cloud-upload-outline" size={16} color={Colors.white} />
              <Text style={styles.saveBtnText}>Simpan ke Firebase</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal Tambah/Edit Soal */}
      <Modal
        visible={showQuestionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowQuestionModal(false)}
      >
        <View style={[styles.modalRoot, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setShowQuestionModal(false)}>
              <Text style={[styles.modalCancel, { color: Colors.rose }]}>Batal</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingIndex !== null ? `Edit Soal ${editingIndex + 1}` : 'Tambah Soal Baru'}
            </Text>
            <TouchableOpacity onPress={handleSaveQuestion}>
              <Text style={[styles.modalSave, { color: Colors.primary }]}>Simpan</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Pertanyaan */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Pertanyaan *</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                value={questionForm.question}
                onChangeText={(t) => setQuestionForm({ ...questionForm, question: t })}
                placeholder="Tulis pertanyaan di sini..."
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                autoFocus
              />
            </View>

            {/* Opsi Jawaban */}
            <Text style={[styles.label, { color: theme.text }]}>Pilihan Jawaban *</Text>
            <Text style={[styles.labelHint, { color: theme.textMuted }]}>
              Tap tombol huruf untuk memilih jawaban yang benar
            </Text>

            {questionForm.options.map((option, idx) => (
              <View key={idx} style={styles.optionInputRow}>
                <TouchableOpacity
                  style={[
                    styles.optionLetterBtn,
                    {
                      backgroundColor: questionForm.correctAnswer === idx ? Colors.primary : theme.border,
                    }
                  ]}
                  onPress={() => setQuestionForm({ ...questionForm, correctAnswer: idx })}
                >
                  <Text style={[
                    styles.optionLetterBtnText,
                    { color: questionForm.correctAnswer === idx ? Colors.white : theme.textMuted }
                  ]}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </TouchableOpacity>
                <TextInput
                  style={[
                    styles.optionInput,
                    {
                      backgroundColor: questionForm.correctAnswer === idx
                        ? Colors.primaryLight
                        : theme.surface,
                      color: theme.text,
                      borderColor: questionForm.correctAnswer === idx ? Colors.primary : theme.border,
                    }
                  ]}
                  value={option}
                  onChangeText={(t) => updateOption(idx, t)}
                  placeholder={`Opsi ${String.fromCharCode(65 + idx)}`}
                  placeholderTextColor={theme.textMuted}
                />
                {questionForm.correctAnswer === idx && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                )}
              </View>
            ))}

            <View style={[styles.correctAnswerInfo, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="information-circle" size={16} color={Colors.primary} />
              <Text style={[styles.correctAnswerInfoText, { color: Colors.primary }]}>
                Jawaban benar: Opsi {String.fromCharCode(65 + questionForm.correctAnswer)} — {questionForm.options[questionForm.correctAnswer] || '(belum diisi)'}
              </Text>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingText: { marginTop: 12, fontSize: 14 },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  themeToggle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 100 },
  section: { borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  addQuestionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  addQuestionBtnText: { fontSize: 13, fontWeight: '700', color: Colors.white },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  labelHint: { fontSize: 12, marginBottom: 12, marginTop: -6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  textArea: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, minHeight: 80 },
  emptyQuestions: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  emptyText: { fontSize: 14, textAlign: 'center' },

  // Question card
  questionCard: { borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1 },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  questionNumBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  questionNum: { fontSize: 12, fontWeight: '700' },
  questionActions: { flexDirection: 'row', gap: 8 },
  questionActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  questionActionText: { fontSize: 11, fontWeight: '600' },
  questionText: { fontSize: 14, fontWeight: '500', lineHeight: 20, marginBottom: 10 },
  optionsList: { gap: 6 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  correctOptionRow: {},
  optionLetter: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  optionLetterText: { fontSize: 11, fontWeight: '700' },
  optionText: { flex: 1, fontSize: 13 },

  // Footer
  footer: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0 },
  cancelBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12 },
  cancelBtnText: { fontSize: 14, fontWeight: '600' },
  saveBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },

  // Modal
  modalRoot: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 16, fontWeight: '700' },
  modalCancel: { fontSize: 15, fontWeight: '600' },
  modalSave: { fontSize: 15, fontWeight: '700' },
  modalContent: { flex: 1, padding: 20 },

  // Option input in modal
  optionInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  optionLetterBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  optionLetterBtnText: { fontSize: 14, fontWeight: '700' },
  optionInput: { flex: 1, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  correctAnswerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, marginTop: 8 },
  correctAnswerInfoText: { flex: 1, fontSize: 13, fontWeight: '500' },
});