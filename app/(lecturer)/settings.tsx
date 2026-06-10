import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Settings states
  const [notifications, setNotifications] = useState({
    studentActivity: true,
    quizSubmissions: true,
    systemUpdates: false,
    emailNotifications: true,
  });
  
  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    showEmail: false,
    showPhone: false,
  });

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Semua field harus diisi');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Password baru dan konfirmasi tidak cocok');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }

    try {
      setPasswordLoading(true);
      // In real app, validate current password and update
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Sukses', 'Password berhasil diubah!');
    } catch (error) {
      Alert.alert('Error', 'Gagal mengubah password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar dari akun?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true, 
    rightComponent 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.card }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.settingIcon, { backgroundColor: Colors.primaryLight }]}>
        <Ionicons name={icon as any} size={20} color={Colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>
        )}
      </View>
      {rightComponent || (showArrow && (
        <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
      ))}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'light-content'}
        backgroundColor={Colors.primaryDark}
      />
      
      {/* Header */}
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Pengaturan</Text>
            <Text style={styles.headerSubtitle}>
              Kelola preferensi dan keamanan akun
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.themeToggle}
            onPress={toggleTheme}
          >
            <Ionicons 
              name={isDark ? 'sunny' : 'moon'} 
              size={20} 
              color={Colors.white} 
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Account Settings */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Keamanan Akun</Text>
          
          <SettingItem
            icon="lock-closed-outline"
            title="Ubah Password"
            subtitle="Perbarui password untuk keamanan akun"
            onPress={() => setShowPasswordModal(true)}
          />
          
          <SettingItem
            icon="shield-checkmark-outline"
            title="Verifikasi Dua Faktor"
            subtitle="Tingkatkan keamanan dengan 2FA"
            onPress={() => Alert.alert('Info', 'Fitur ini akan segera tersedia')}
          />
        </View>

        {/* Appearance */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Tampilan</Text>
          
          <SettingItem
            icon={isDark ? 'moon' : 'sunny'}
            title="Mode Gelap"
            subtitle={`Saat ini: ${isDark ? 'Gelap' : 'Terang'}`}
            onPress={toggleTheme}
            showArrow={false}
            rightComponent={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.border, true: Colors.primaryLight }}
                thumbColor={isDark ? Colors.primary : theme.surface}
              />
            }
          />
          
          <SettingItem
            icon="language-outline"
            title="Bahasa"
            subtitle="Bahasa Indonesia"
            onPress={() => Alert.alert('Info', 'Fitur ini akan segera tersedia')}
          />
        </View>

        {/* Notifications */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Notifikasi</Text>
          
          <SettingItem
            icon="notifications-outline"
            title="Aktivitas Mahasiswa"
            subtitle="Notifikasi saat mahasiswa mengakses materi"
            showArrow={false}
            rightComponent={
              <Switch
                value={notifications.studentActivity}
                onValueChange={(value) => setNotifications(prev => ({ ...prev, studentActivity: value }))}
                trackColor={{ false: theme.border, true: Colors.primaryLight }}
                thumbColor={notifications.studentActivity ? Colors.primary : theme.surface}
              />
            }
          />
          
          <SettingItem
            icon="checkmark-circle-outline"
            title="Pengumpulan Quiz"
            subtitle="Notifikasi saat mahasiswa mengumpulkan quiz"
            showArrow={false}
            rightComponent={
              <Switch
                value={notifications.quizSubmissions}
                onValueChange={(value) => setNotifications(prev => ({ ...prev, quizSubmissions: value }))}
                trackColor={{ false: theme.border, true: Colors.primaryLight }}
                thumbColor={notifications.quizSubmissions ? Colors.primary : theme.surface}
              />
            }
          />
          
          <SettingItem
            icon="mail-outline"
            title="Email Notifikasi"
            subtitle="Terima notifikasi melalui email"
            showArrow={false}
            rightComponent={
              <Switch
                value={notifications.emailNotifications}
                onValueChange={(value) => setNotifications(prev => ({ ...prev, emailNotifications: value }))}
                trackColor={{ false: theme.border, true: Colors.primaryLight }}
                thumbColor={notifications.emailNotifications ? Colors.primary : theme.surface}
              />
            }
          />
          
          <SettingItem
            icon="alert-circle-outline"
            title="Update Sistem"
            subtitle="Notifikasi tentang pembaruan aplikasi"
            showArrow={false}
            rightComponent={
              <Switch
                value={notifications.systemUpdates}
                onValueChange={(value) => setNotifications(prev => ({ ...prev, systemUpdates: value }))}
                trackColor={{ false: theme.border, true: Colors.primaryLight }}
                thumbColor={notifications.systemUpdates ? Colors.primary : theme.surface}
              />
            }
          />
        </View>

        {/* Privacy */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Privasi</Text>
          
          <SettingItem
            icon="eye-outline"
            title="Profil Publik"
            subtitle="Tampilkan profil ke mahasiswa"
            showArrow={false}
            rightComponent={
              <Switch
                value={privacy.profileVisibility}
                onValueChange={(value) => setPrivacy(prev => ({ ...prev, profileVisibility: value }))}
                trackColor={{ false: theme.border, true: Colors.primaryLight }}
                thumbColor={privacy.profileVisibility ? Colors.primary : theme.surface}
              />
            }
          />
          
          <SettingItem
            icon="mail-outline"
            title="Tampilkan Email"
            subtitle="Email terlihat di profil publik"
            showArrow={false}
            rightComponent={
              <Switch
                value={privacy.showEmail}
                onValueChange={(value) => setPrivacy(prev => ({ ...prev, showEmail: value }))}
                trackColor={{ false: theme.border, true: Colors.primaryLight }}
                thumbColor={privacy.showEmail ? Colors.primary : theme.surface}
              />
            }
          />
          
          <SettingItem
            icon="call-outline"
            title="Tampilkan Telepon"
            subtitle="Nomor telepon terlihat di profil publik"
            showArrow={false}
            rightComponent={
              <Switch
                value={privacy.showPhone}
                onValueChange={(value) => setPrivacy(prev => ({ ...prev, showPhone: value }))}
                trackColor={{ false: theme.border, true: Colors.primaryLight }}
                thumbColor={privacy.showPhone ? Colors.primary : theme.surface}
              />
            }
          />
        </View>

        {/* Other */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Lainnya</Text>
          
          <SettingItem
            icon="help-circle-outline"
            title="Bantuan"
            subtitle="FAQ dan dukungan teknis"
            onPress={() => Alert.alert('Info', 'Fitur ini akan segera tersedia')}
          />
          
          <SettingItem
            icon="information-circle-outline"
            title="Tentang Aplikasi"
            subtitle="Versi 1.0.0"
            onPress={() => Alert.alert('EduBidan', 'Aplikasi Edukasi Kebidanan\nVersi 1.0.0\n\nDikembangkan oleh Tim EduBidan')}
          />
          
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.card, borderColor: Colors.rose, borderWidth: 1 }]}
            onPress={handleLogout}
          >
            <View style={[styles.settingIcon, { backgroundColor: Colors.roseLight }]}>
              <Ionicons name="log-out-outline" size={20} color={Colors.rose} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: Colors.rose }]}>Keluar</Text>
              <Text style={[styles.settingSubtitle, { color: Colors.rose }]}>Logout dari akun dosen</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.rose} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowPasswordModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Ubah Password</Text>
            <TouchableOpacity
              style={[styles.modalSaveBtn, { backgroundColor: Colors.primary }]}
              onPress={handleChangePassword}
              disabled={passwordLoading}
            >
              {passwordLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.modalSaveBtnText}>Simpan</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Password Saat Ini *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Masukkan password saat ini"
                placeholderTextColor={theme.textMuted}
                secureTextEntry
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Password Baru *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Masukkan password baru"
                placeholderTextColor={theme.textMuted}
                secureTextEntry
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Konfirmasi Password Baru *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Masukkan ulang password baru"
                placeholderTextColor={theme.textMuted}
                secureTextEntry
              />
            </View>
            
            <View style={[styles.passwordTips, { backgroundColor: theme.card }]}>
              <Text style={[styles.passwordTipsTitle, { color: theme.text }]}>Tips Password Aman:</Text>
              <Text style={[styles.passwordTip, { color: theme.textMuted }]}>• Minimal 6 karakter</Text>
              <Text style={[styles.passwordTip, { color: theme.textMuted }]}>• Kombinasi huruf dan angka</Text>
              <Text style={[styles.passwordTip, { color: theme.textMuted }]}>• Gunakan karakter khusus (!@#$%)</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  themeToggle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  // Sections
  section: { paddingHorizontal: 20, paddingVertical: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },

  // Setting Items
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  settingIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  settingContent: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  settingSubtitle: { fontSize: 13 },

  // Modal
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalCloseBtn: { padding: 4 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalSaveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  modalSaveBtnText: { fontSize: 14, fontWeight: '600', color: Colors.white },
  modalContent: { flex: 1, padding: 20 },

  // Form
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },

  // Password Tips
  passwordTips: { borderRadius: 8, padding: 16, marginTop: 20 },
  passwordTipsTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  passwordTip: { fontSize: 12, marginBottom: 4 },

  bottomPad: { height: 20 },
});