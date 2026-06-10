import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { UserDatabase } from '../../src/utils/userDatabase';

export default function RegisterScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [prodi, setProdi] = useState('Kebidanan');
  const [universitas, setUniversitas] = useState('Universitas Singaperbangsa Karawang');
  const [angkatan, setAngkatan] = useState('');
  const [role, setRole] = useState<'student' | 'lecturer'>('student'); // Add role state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!name.trim() || !nim.trim() || !email.trim() || !password.trim() || !angkatan.trim()) {
      Alert.alert('Perhatian', 'Semua field wajib harus diisi.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Perhatian', 'Password dan konfirmasi password tidak cocok.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Perhatian', 'Password minimal 6 karakter.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Format Email Salah', 'Silakan masukkan email dengan format yang benar.');
      return;
    }

    // Validate NIM (should be numbers)
    if (!/^\d+$/.test(nim)) {
      Alert.alert('Format NIM Salah', 'NIM harus berupa angka.');
      return;
    }

    setLoading(true);

    try {
      const result = await UserDatabase.registerUser({
        name: name.trim(),
        nim: nim.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        prodi: prodi,
        universitas: universitas,
        angkatan: angkatan.trim(),
        role: role, // Add role field
      });

      if (result.success) {
        Alert.alert(
          'Registrasi Berhasil', 
          `Akun berhasil dibuat untuk ${result.user?.name}! Silakan login dengan akun baru Anda.`,
          [
            { 
              text: 'Login Sekarang', 
              onPress: () => router.replace('/(auth)/login')
            }
          ]
        );
      } else {
        Alert.alert('Registrasi Gagal', result.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat membuat akun. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? theme.background : Colors.primaryDark} />

      {/* Header */}
      <LinearGradient colors={isDark ? [theme.surfaceSecondary, theme.surface] : [Colors.primaryDark, Colors.primary]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          
          {/* Theme Toggle */}
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerContent}>
          <View style={styles.logoWrap}>
            <Ionicons name="person-add" size={28} color={Colors.white} />
          </View>
          <Text style={styles.headerTitle}>Buat Akun</Text>
          <Text style={styles.headerSubtitle}>Daftar dan mulai belajar kebidanan</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Registrasi</Text>

          {/* Name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Nama Lengkap</Text>
            <View style={[styles.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
              <Ionicons name="person-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor={theme.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* NIM */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.text }]}>NIM</Text>
            <View style={[styles.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
              <Ionicons name="card-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Masukkan NIM Anda"
                placeholderTextColor={theme.textMuted}
                value={nim}
                onChangeText={setNim}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Angkatan */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Angkatan</Text>
            <View style={[styles.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
              <Ionicons name="calendar-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Contoh: 2022"
                placeholderTextColor={theme.textMuted}
                value={angkatan}
                onChangeText={setAngkatan}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Email</Text>
            <View style={[styles.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
              <Ionicons name="mail-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Masukkan email Anda"
                placeholderTextColor={theme.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Password</Text>
            <View style={[styles.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputPassword, { color: theme.text }]}
                placeholder="Minimal 6 karakter"
                placeholderTextColor={theme.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Konfirmasi Password</Text>
            <View style={[styles.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputPassword, { color: theme.text }]}
                placeholder="Ulangi password Anda"
                placeholderTextColor={theme.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerBtn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={loading}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Text style={styles.btnText}>{loading ? 'Memproses...' : 'Daftar Sekarang'}</Text>
              {!loading && <Ionicons name="arrow-forward" size={18} color={Colors.white} />}
            </LinearGradient>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={[styles.loginText, { color: theme.textMuted }]}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Masuk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.slate50 },
  header: { paddingTop: 50, paddingBottom: 28, paddingHorizontal: 20 },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: { alignItems: 'center' },
  logoWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 24, paddingBottom: 40 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: Colors.slate900, marginBottom: 20 },

  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.slate700, marginBottom: 7 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.slate50,
    borderWidth: 1.5,
    borderColor: Colors.slate200,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: Colors.slate900 },
  inputPassword: { paddingRight: 8 },
  eyeBtn: { padding: 4 },

  registerBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8, marginBottom: 20 },
  btnDisabled: { opacity: 0.7 },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  btnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },

  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 14, color: Colors.slate500 },
  loginLink: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
});
