import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Switch, TextInput, Modal, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { AdminDatabase, SystemSettings } from '../../src/utils/adminDatabase';

export default function AdminSettingsScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSystemModal, setShowSystemModal] = useState(false);
  const [appName, setAppName] = useState('EduBidan');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      await AdminDatabase.initializeDatabase();
      const s = await AdminDatabase.getSystemSettings();
      setSettings(s);
      setAppName(s.appName);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAppName = async () => {
    if (!appName.trim()) { Alert.alert('Error', 'Nama aplikasi tidak boleh kosong'); return; }
    setSaving(true);
    try {
      const result = await AdminDatabase.updateSystemSettings({ appName });
      if (result.success) {
        Alert.alert('Sukses', 'Nama aplikasi berhasil diperbarui');
        setShowSystemModal(false);
        loadSettings();
      } else {
        Alert.alert('Error', result.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNotification = async (key: keyof SystemSettings['notificationSettings'], value: boolean) => {
    if (!settings) return;
    const newSettings = {
      ...settings,
      notificationSettings: { ...settings.notificationSettings, [key]: value },
    };
    setSettings(newSettings);
    await AdminDatabase.updateSystemSettings({ notificationSettings: newSettings.notificationSettings });
  };

  const handleToggleAutoBackup = async (value: boolean) => {
    if (!settings) return;
    const newSettings = {
      ...settings,
      backupSettings: { ...settings.backupSettings, autoBackup: value },
    };
    setSettings(newSettings);
    await AdminDatabase.updateSystemSettings({ backupSettings: newSettings.backupSettings });
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
          onPress: () => router.replace('/(auth)/login'),
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightElement, color = Colors.primary }: any) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.card }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />)}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Pengaturan Sistem</Text>
            <Text style={styles.headerSubtitle}>Konfigurasi dan manajemen sistem</Text>
          </View>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* App Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>APLIKASI</Text>
          <SettingItem
            icon="phone-portrait-outline"
            title="Nama Aplikasi"
            subtitle={settings?.appName || 'EduBidan'}
            onPress={() => setShowSystemModal(true)}
            color={Colors.primary}
          />
          <SettingItem
            icon="color-palette-outline"
            title="Tema Aplikasi"
            subtitle={isDark ? 'Mode Gelap' : 'Mode Terang'}
            onPress={toggleTheme}
            color={Colors.blue}
          />
          <SettingItem
            icon="information-circle-outline"
            title="Versi Aplikasi"
            subtitle={settings?.version || '1.0.0'}
            color={Colors.gray500}
          />
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>NOTIFIKASI</Text>
          <SettingItem
            icon="mail-outline"
            title="Notifikasi Email"
            subtitle="Kirim notifikasi via email"
            color={Colors.blue}
            rightElement={
              <Switch
                value={settings?.notificationSettings.emailEnabled ?? true}
                onValueChange={(val) => handleToggleNotification('emailEnabled', val)}
                trackColor={{ false: theme.border, true: Colors.primaryLight }}
                thumbColor={settings?.notificationSettings.emailEnabled ? Colors.primary : theme.textMuted}
              />
            }
          />
          <SettingItem
            icon="notifications-outline"
            title="Push Notification"
            subtitle="Kirim notifikasi push ke perangkat"
            color={Colors.amber}
            rightElement={
              <Switch
                value={settings?.notificationSettings.pushEnabled ?? true}
                onValueChange={(val) => handleToggleNotification('pushEnabled', val)}
                trackColor={{ false: theme.border, true: Colors.primaryLight }}
                thumbColor={settings?.notificationSettings.pushEnabled ? Colors.primary : theme.textMuted}
              />
            }
          />
          <SettingItem
            icon="chatbubble-outline"
            title="Notifikasi SMS"
            subtitle="Kirim notifikasi via SMS"
            color={Colors.green}
            rightElement={
              <Switch
                value={settings?.notificationSettings.smsEnabled ?? false}
                onValueChange={(val) => handleToggleNotification('smsEnabled', val)}
                trackColor={{ false: theme.border, true: Colors.primaryLight }}
                thumbColor={settings?.notificationSettings.smsEnabled ? Colors.primary : theme.textMuted}
              />
            }
          />
        </View>

        {/* Backup Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>BACKUP & RESTORE</Text>
          <SettingItem
            icon="cloud-upload-outline"
            title="Auto Backup"
            subtitle="Backup otomatis database"
            color={Colors.primary}
            rightElement={
              <Switch
                value={settings?.backupSettings.autoBackup ?? true}
                onValueChange={handleToggleAutoBackup}
                trackColor={{ false: theme.border, true: Colors.primaryLight }}
                thumbColor={settings?.backupSettings.autoBackup ? Colors.primary : theme.textMuted}
              />
            }
          />
          <SettingItem
            icon="download-outline"
            title="Backup Sekarang"
            subtitle="Buat backup database manual"
            onPress={() => Alert.alert('Info', 'Fitur backup manual akan segera tersedia')}
            color={Colors.blue}
          />
          <SettingItem
            icon="cloud-download-outline"
            title="Restore Database"
            subtitle="Pulihkan dari backup sebelumnya"
            onPress={() => Alert.alert('Info', 'Fitur restore akan segera tersedia')}
            color={Colors.amber}
          />
        </View>

        {/* Admin Navigation */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>NAVIGASI ADMIN</Text>
          <SettingItem icon="person-outline" title="Profil Admin" onPress={() => router.push('/(admin)/profile')} color={Colors.primary} />
          <SettingItem icon="notifications-outline" title="Notifikasi" onPress={() => router.push('/(admin)/notifications')} color={Colors.blue} />
        </View>

        {/* Logout */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: Colors.roseLight }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.rose} />
            <Text style={[styles.logoutText, { color: Colors.rose }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit App Name Modal */}
      <Modal visible={showSystemModal} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setShowSystemModal(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Nama Aplikasi</Text>
            <TouchableOpacity onPress={() => setShowSystemModal(false)}>
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={[styles.formLabel, { color: theme.text }]}>Nama Aplikasi</Text>
            <TextInput
              style={[styles.formInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              value={appName}
              onChangeText={setAppName}
              placeholder="Nama aplikasi"
              placeholderTextColor={theme.textMuted}
            />
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: Colors.primary }]}
              onPress={handleSaveAppName}
            >
              <Text style={styles.saveBtnText}>{saving ? 'Menyimpan...' : 'Simpan'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  themeToggle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  settingIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  settingContent: { flex: 1 },
  settingTitle: { fontSize: 15, fontWeight: '600' },
  settingSubtitle: { fontSize: 12, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, gap: 8 },
  logoutText: { fontSize: 16, fontWeight: '700' },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalContent: { padding: 20 },
  formLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  formInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, marginBottom: 20 },
  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
});