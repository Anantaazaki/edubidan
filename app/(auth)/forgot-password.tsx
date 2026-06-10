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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { UserDatabase } from '../../src/utils/userDatabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [userFound, setUserFound] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert('Perhatian', 'Email harus diisi.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Format Email Salah', 'Silakan masukkan email dengan format yang benar.');
      return;
    }

    setLoading(true);
    
    try {
      // Check if email exists in database
      const emailExists = await UserDatabase.emailExists(email);
      
      if (emailExists) {
        setUserFound(true);
        // Simulate sending email (in real app, this would call an API)
        setTimeout(() => {
          setLoading(false);
          setSent(true);
        }, 2000);
      } else {
        setLoading(false);
        Alert.alert(
          'Email Tidak Ditemukan', 
          'Email yang Anda masukkan tidak terdaftar dalam sistem. Silakan periksa kembali atau daftar akun baru.',
          [
            { text: 'Coba Lagi', style: 'cancel' },
            { text: 'Daftar Akun', onPress: () => router.push('/(auth)/register') }
          ]
        );
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'light-content'} backgroundColor={Colors.primaryDark} />

      {/* Header */}
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/(auth)/login')}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerContent}>
          <View style={styles.logoWrap}>
            <Ionicons name="key" size={28} color={Colors.white} />
          </View>
          <Text style={styles.headerTitle}>Lupa Password</Text>
          <Text style={styles.headerSubtitle}>Reset password akun EduBidan Anda</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {!sent ? (
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={[styles.infoBox, { backgroundColor: Colors.blueLight }]}>
              <Ionicons name="information-circle" size={20} color={Colors.blue} />
              <Text style={[styles.infoText, { color: Colors.blue }]}>
                Masukkan email yang terdaftar di EduBidan. Kami akan mengirimkan instruksi untuk mereset password Anda.
              </Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Email Terdaftar</Text>
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

            <TouchableOpacity
              style={[styles.sendBtn, loading && styles.btnDisabled]}
              onPress={handleSend}
              activeOpacity={0.85}
              disabled={loading}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={Colors.white} />
                    <Text style={[styles.btnText, { marginLeft: 8 }]}>Memeriksa...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.btnText}>Kirim Link Reset</Text>
                    <Ionicons name="send" size={16} color={Colors.white} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backToLogin} onPress={() => router.push('/(auth)/login')}>
              <Ionicons name="arrow-back" size={14} color={Colors.primary} />
              <Text style={[styles.backToLoginText, { color: Colors.primary }]}>Kembali ke Login</Text>
            </TouchableOpacity>

            {/* Help Section */}
            <View style={[styles.helpSection, { backgroundColor: theme.surfaceSecondary }]}>
              <Text style={[styles.helpTitle, { color: theme.text }]}>Butuh Bantuan?</Text>
              <Text style={[styles.helpText, { color: theme.textMuted }]}>
                Jika Anda tidak memiliki akses ke email atau mengalami masalah lain, silakan hubungi:
              </Text>
              <View style={styles.contactInfo}>
                <View style={styles.contactItem}>
                  <Ionicons name="mail" size={16} color={Colors.primary} />
                  <Text style={[styles.contactText, { color: theme.text }]}>support@edubidan.ac.id</Text>
                </View>
                <View style={styles.contactItem}>
                  <Ionicons name="call" size={16} color={Colors.primary} />
                  <Text style={[styles.contactText, { color: theme.text }]}>Admin EduBidan</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={styles.successContainer}>
              <View style={styles.successIconWrap}>
                <Ionicons name="checkmark-circle" size={64} color={Colors.primary} />
              </View>
              <Text style={[styles.successTitle, { color: theme.text }]}>Email Terkirim!</Text>
              <Text style={[styles.successText, { color: theme.textMuted }]}>
                Instruksi reset password telah dikirim ke{'\n'}
                <Text style={styles.successEmail}>{email}</Text>
              </Text>
              <Text style={[styles.successNote, { color: theme.textMuted }]}>
                Periksa kotak masuk atau folder spam Anda. Link akan kadaluarsa dalam 30 menit.
              </Text>

              {/* Demo Instructions */}
              <View style={[styles.demoBox, { backgroundColor: Colors.amberLight }]}>
                <Ionicons name="bulb" size={20} color={Colors.amber} />
                <View style={styles.demoContent}>
                  <Text style={[styles.demoTitle, { color: Colors.amber }]}>Demo Mode</Text>
                  <Text style={[styles.demoText, { color: Colors.amber }]}>
                    Ini adalah aplikasi demo. Untuk reset password sesungguhnya, hubungi admin EduBidan.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.sendBtn}
                onPress={() => router.replace('/(auth)/login')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.btnGradient}
                >
                  <Text style={styles.btnText}>Kembali ke Login</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
  scrollContent: { padding: 20, paddingTop: 24 },

  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },

  infoBox: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },

  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15 },

  sendBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  btnDisabled: { opacity: 0.7 },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  btnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  backToLoginText: { fontSize: 14, fontWeight: '600' },

  // Help Section
  helpSection: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  helpTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  helpText: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  contactInfo: { gap: 8 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactText: { fontSize: 13, fontWeight: '600' },

  // Success state
  successContainer: { alignItems: 'center', paddingVertical: 16 },
  successIconWrap: { marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  successText: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 12 },
  successEmail: { fontWeight: '700', color: Colors.primary },
  successNote: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },

  // Demo Box
  demoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  demoContent: { flex: 1 },
  demoTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  demoText: { fontSize: 13, lineHeight: 18 },
});
