import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Modal, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';

const ADMIN_PROFILE = {
  name: 'Admin EduBidan',
  email: 'admin@edubidan.com',
  role: 'Super Administrator',
  phone: '+62812-3456-7890',
  joinDate: 'Januari 2024',
  avatar: 'A',
};

export default function AdminProfileScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({ name: ADMIN_PROFILE.name, phone: ADMIN_PROFILE.phone });
  const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSaveProfile = () => {
    if (!formData.name.trim()) { Alert.alert('Error', 'Nama tidak boleh kosong'); return; }
    Alert.alert('Sukses', 'Profil berhasil diperbarui');
    setShowEditModal(false);
  };

  const handleChangePassword = () => {
    if (!passwordData.current || !passwordData.newPass || !passwordData.confirm) {
      Alert.alert('Error', 'Semua field harus diisi'); return;
    }
    if (passwordData.newPass !== passwordData.confirm) {
      Alert.alert('Error', 'Password baru tidak cocok'); return;
    }
    if (passwordData.newPass.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter'); return;
    }
    Alert.alert('Sukses', 'Password berhasil diubah');
    setShowPasswordModal(false);
    setPasswordData({ current: '', newPass: '', confirm: '' });
  };

  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar dari akun?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => router.replace('/(auth)/login') },
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* Header */}
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil Admin</Text>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{ADMIN_PROFILE.avatar}</Text>
            </View>
            <TouchableOpacity style={styles.editAvatarBtn} onPress={() => Alert.alert('Info', 'Fitur ganti foto akan segera tersedia')}>
              <Ionicons name="camera" size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{ADMIN_PROFILE.name}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={12} color={Colors.white} />
            <Text style={styles.roleBadgeText}>{ADMIN_PROFILE.role}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.infoCardTitle, { color: theme.text }]}>Informasi Akun</Text>
          {[
            { icon: 'person-outline', label: 'Nama Lengkap', value: ADMIN_PROFILE.name },
            { icon: 'mail-outline', label: 'Email', value: ADMIN_PROFILE.email },
            { icon: 'call-outline', label: 'Nomor Telepon', value: ADMIN_PROFILE.phone },
            { icon: 'shield-outline', label: 'Role', value: ADMIN_PROFILE.role },
            { icon: 'calendar-outline', label: 'Bergabung', value: ADMIN_PROFILE.joinDate },
          ].map((item, index) => (
            <View key={index} style={[styles.infoRow, { borderBottomColor: theme.border }]}>
              <View style={[styles.infoIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name={item.icon as any} size={16} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{item.label}</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionItem, { backgroundColor: theme.card }]}
            onPress={() => setShowEditModal(true)}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="create-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: theme.text }]}>Edit Profil</Text>
              <Text style={[styles.actionSubtitle, { color: theme.textMuted }]}>Perbarui nama dan kontak</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionItem, { backgroundColor: theme.card }]}
            onPress={() => setShowPasswordModal(true)}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.blueLight }]}>
              <Ionicons name="key-outline" size={20} color={Colors.blue} />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: theme.text }]}>Ubah Password</Text>
              <Text style={[styles.actionSubtitle, { color: theme.textMuted }]}>Ganti password akun admin</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionItem, { backgroundColor: Colors.roseLight }]}
            onPress={handleLogout}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.rose + '30' }]}>
              <Ionicons name="log-out-outline" size={20} color={Colors.rose} />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: Colors.rose }]}>Logout</Text>
              <Text style={[styles.actionSubtitle, { color: Colors.rose + 'aa' }]}>Keluar dari akun admin</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.rose} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setShowEditModal(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profil</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={[styles.formLabel, { color: theme.text }]}>Nama Lengkap *</Text>
            <TextInput
              style={[styles.formInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Masukkan nama"
              placeholderTextColor={theme.textMuted}
            />
            <Text style={[styles.formLabel, { color: theme.text }]}>Nomor Telepon</Text>
            <TextInput
              style={[styles.formInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Nomor telepon"
              placeholderTextColor={theme.textMuted}
              keyboardType="phone-pad"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: theme.border }]} onPress={() => setShowEditModal(false)}>
                <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: Colors.primary }]} onPress={handleSaveProfile}>
                <Text style={styles.saveBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setShowPasswordModal(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Ubah Password</Text>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            {[
              { label: 'Password Saat Ini *', key: 'current', show: showCurrent, toggle: setShowCurrent },
              { label: 'Password Baru *', key: 'newPass', show: showNew, toggle: setShowNew },
              { label: 'Konfirmasi Password Baru *', key: 'confirm', show: showNew, toggle: setShowNew },
            ].map((field, i) => (
              <View key={i}>
                <Text style={[styles.formLabel, { color: theme.text }]}>{field.label}</Text>
                <View style={[styles.passwordInput, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <TextInput
                    style={[styles.passwordTextInput, { color: theme.text }]}
                    value={passwordData[field.key as keyof typeof passwordData]}
                    onChangeText={(text) => setPasswordData({ ...passwordData, [field.key]: text })}
                    secureTextEntry={!field.show}
                    placeholder={field.label.replace(' *', '')}
                    placeholderTextColor={theme.textMuted}
                  />
                  <TouchableOpacity onPress={() => field.toggle(!field.show)}>
                    <Ionicons name={field.show ? 'eye-off-outline' : 'eye-outline'} size={18} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: theme.border }]} onPress={() => setShowPasswordModal(false)}>
                <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: Colors.primary }]} onPress={handleChangePassword}>
                <Text style={styles.saveBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 32, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: Colors.white },
  themeToggle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  avatarSection: { alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.white },
  avatarText: { fontSize: 36, fontWeight: '800', color: Colors.white },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.white },
  profileName: { fontSize: 22, fontWeight: '800', color: Colors.white, marginBottom: 8 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  roleBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.white },
  infoCard: { margin: 20, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  infoCardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  infoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600' },
  actionsSection: { paddingHorizontal: 20, gap: 10, marginBottom: 32 },
  actionItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  actionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '600' },
  actionSubtitle: { fontSize: 12, marginTop: 2 },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalContent: { padding: 20 },
  formLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  formInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, marginBottom: 16 },
  passwordInput: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 },
  passwordTextInput: { flex: 1, fontSize: 14 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderWidth: 1, borderRadius: 12 },
  cancelBtnText: { fontSize: 14, fontWeight: '600' },
  saveBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12 },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});