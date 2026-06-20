import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
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
import { UserDatabase } from '../../src/utils/userDatabase';

interface LecturerProfile {
  id: string;
  name: string;
  email: string;
  nidn: string;
  specialization: string;
  phone: string;
  address: string;
  joinDate: string;
  avatar: string | null;
  totalMaterials: number;
  totalVideos: number;
  totalStudents: number;
  totalQuizzes: number;
}

export default function LecturerProfileScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<LecturerProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editSpecialization, setEditSpecialization] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Load user data dari Firebase Auth + AsyncStorage
      const { UserDatabase } = await import('../../src/utils/userDatabase');
      const currentUser = await UserDatabase.getCurrentUser();
      
      // Load stats real dari Firebase
      const { LecturerDatabase } = await import('../../src/utils/lecturerDatabase');
      const stats = await LecturerDatabase.getStatistics();
      
      const lecturerProfile: LecturerProfile = {
        id: currentUser?.id || 'lecturer1',
        name: currentUser?.name || 'Dr. Siti Aisyah, SST., M.Kes',
        email: currentUser?.email || 'dosen@edubidan.com',
        nidn: currentUser?.nim || '0410087801',
        specialization: currentUser?.prodi || 'Kebidanan Komunitas & Asuhan Kebidanan',
        phone: currentUser?.phone || '-',
        address: currentUser?.alamat || '-',
        joinDate: '15 Agustus 2020',
        avatar: null,
        totalMaterials: stats.totalMaterials,
        totalVideos: stats.totalVideos,
        totalStudents: stats.totalStudents,
        totalQuizzes: stats.totalQuizzes,
      };
      
      setProfile(lecturerProfile);
      setEditName(lecturerProfile.name);
      setEditEmail(lecturerProfile.email);
      setEditPhone(lecturerProfile.phone);
      setEditAddress(lecturerProfile.address);
      setEditSpecialization(lecturerProfile.specialization);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Error', 'Nama dan email tidak boleh kosong');
      return;
    }

    try {
      setEditLoading(true);
      // In real app, save to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update profile state
      if (profile) {
        setProfile({
          ...profile,
          name: editName.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim(),
          address: editAddress.trim(),
          specialization: editSpecialization.trim(),
        });
      }

      setShowEditModal(false);
      Alert.alert('Sukses', 'Profil berhasil diperbarui!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Gagal menyimpan profil');
    } finally {
      setEditLoading(false);
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
          onPress: async () => {
            try {
              // Clear user session (in real app, this would clear AsyncStorage)
              router.replace('/(auth)/login');
              // Would show toast notification in real app
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>Memuat profil...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.root, styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>Profil tidak ditemukan</Text>
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>Profil Dosen</Text>
          </View>
          
          <View style={styles.headerRight}>
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
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setShowEditModal(true)}
            >
              <Ionicons name="create-outline" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color={Colors.white} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
            <Text style={styles.profileNidn}>NIDN: {profile.nidn}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Details */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Informasi Pribadi</Text>
          
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="person-outline" size={16} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Nama Lengkap</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{profile.name}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: Colors.blueLight }]}>
                <Ionicons name="mail-outline" size={16} color={Colors.blue} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Email</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{profile.email}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: Colors.amberLight }]}>
                <Ionicons name="card-outline" size={16} color={Colors.amber} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>NIDN</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{profile.nidn}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: Colors.roseLight }]}>
                <Ionicons name="school-outline" size={16} color={Colors.rose} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Bidang Keahlian</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{profile.specialization}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="call-outline" size={16} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Nomor Telepon</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{profile.phone}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: Colors.blueLight }]}>
                <Ionicons name="location-outline" size={16} color={Colors.blue} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Alamat</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{profile.address}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: Colors.amberLight }]}>
                <Ionicons name="calendar-outline" size={16} color={Colors.amber} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Tanggal Bergabung</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{profile.joinDate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.card }]}
            onPress={() => router.push('/(lecturer)/settings')}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="settings-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={[styles.actionText, { color: theme.text }]}>Pengaturan Akun</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.card }]}
            onPress={() => router.push('/(lecturer)/notifications')}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.blueLight }]}>
              <Ionicons name="notifications-outline" size={20} color={Colors.blue} />
            </View>
            <Text style={[styles.actionText, { color: theme.text }]}>Notifikasi</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: Colors.rose }]}
            onPress={handleLogout}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.roseLight }]}>
              <Ionicons name="log-out-outline" size={20} color={Colors.rose} />
            </View>
            <Text style={[styles.actionText, { color: Colors.rose }]}>Keluar</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.rose} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowEditModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profil</Text>
            <TouchableOpacity
              style={[styles.modalSaveBtn, { backgroundColor: Colors.primary }]}
              onPress={handleSaveProfile}
              disabled={editLoading}
            >
              {editLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.modalSaveBtnText}>Simpan</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Nama Lengkap *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Email *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Masukkan email"
                placeholderTextColor={theme.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Bidang Keahlian</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                value={editSpecialization}
                onChangeText={setEditSpecialization}
                placeholder="Masukkan bidang keahlian"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Nomor Telepon</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Masukkan nomor telepon"
                placeholderTextColor={theme.textMuted}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Alamat</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                value={editAddress}
                onChangeText={setEditAddress}
                placeholder="Masukkan alamat lengkap"
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },

  // Header
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeToggle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  editBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  // Profile Card
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.white },
  avatarText: { fontSize: 28, fontWeight: '700', color: Colors.white },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.white },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  profileEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  profileNidn: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },

  // Sections
  section: { paddingHorizontal: 20, paddingVertical: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },

  // Stats
  statsSection: { paddingHorizontal: 20, paddingVertical: 20 },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, alignItems: 'center', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  statIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11, textAlign: 'center' },

  // Info Card
  infoCard: { borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  infoIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: '500' },

  // Action Buttons
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  actionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  actionText: { flex: 1, fontSize: 16, fontWeight: '500' },

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
  textArea: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, textAlignVertical: 'top', minHeight: 80 },

  bottomPad: { height: 20 },
});