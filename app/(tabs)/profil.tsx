import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Switch,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../src/constants/colors';
import { UserDatabase, User } from '../../src/utils/userDatabase';
import { LecturerDatabase, Material, Video, Quiz } from '../../src/utils/lecturerDatabase';

const USER_DATA_KEY = '@edubidan_user_data';
const NOTIFICATIONS_KEY = '@edubidan_notifications';

interface UserData {
  name: string;
  nim: string;
  prodi: string;
  universitas: string;
  email: string;
  angkatan: string;
  phone?: string;
  alamat?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  isRead: boolean;
}

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  color?: string;
  rightElement?: React.ReactNode;
}

function MenuItem({ icon, label, value, onPress, color, rightElement }: MenuItemProps) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: theme.card }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !rightElement}
    >
      <View style={[styles.menuIconWrap, { backgroundColor: (color || Colors.primary) + '20' }]}>
        <Ionicons name={icon} size={20} color={color || Colors.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, { color: theme.text }]}>{label}</Text>
        {value && <Text style={[styles.menuValue, { color: theme.textMuted }]}>{value}</Text>}
      </View>
      {rightElement || (onPress && (
        <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
      ))}
    </TouchableOpacity>
  );
}

export default function ProfilScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  
  // User data state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    nim: '',
    prodi: '',
    universitas: '',
    email: '',
    angkatan: '',
    phone: '',
    alamat: '',
  });
  
  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userStats, setUserStats] = useState({ totalUsers: 0, recentRegistrations: 0 });
  
  // Form state
  const [editForm, setEditForm] = useState<UserData>(userData);

  // Load current user data on mount
  useEffect(() => {
    loadCurrentUser();
    loadUserStats();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await UserDatabase.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        
        // Cek apakah sudah ada data edit profil
        const stored = await AsyncStorage.getItem(USER_DATA_KEY);
        if (stored) {
          // Gunakan data edit profil yang sudah ada
          const parsedData = JSON.parse(stored);
          const newUserData = {
            name: parsedData.name || user.name,
            nim: parsedData.nim || user.nim,
            prodi: parsedData.prodi || user.prodi,
            universitas: parsedData.universitas || user.universitas,
            email: parsedData.email || user.email,
            angkatan: parsedData.angkatan || user.angkatan,
            phone: parsedData.phone || user.phone || '',
            alamat: parsedData.alamat || user.alamat || '',
          };
          setUserData(newUserData);
          setEditForm(newUserData);
        } else {
          // Inisialisasi dari data login
          const newUserData = {
            name: user.name,
            nim: user.nim,
            prodi: user.prodi,
            universitas: user.universitas,
            email: user.email,
            angkatan: user.angkatan,
            phone: user.phone || '',
            alamat: user.alamat || '',
          };
          setUserData(newUserData);
          setEditForm(newUserData);
          // Simpan ke storage agar home screen bisa baca
          await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(newUserData));
        }
      } else {
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('Error loading current user:', error);
      router.replace('/(auth)/login');
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await UserDatabase.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  // Load user data and notifications on mount
  useEffect(() => {
    loadUserData();
    loadNotifications();
  }, []);

  const loadUserData = async () => {
    try {
      const stored = await AsyncStorage.getItem(USER_DATA_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        setUserData(parsedData);
        setEditForm(parsedData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        const parsedNotifications: Notification[] = JSON.parse(stored);
        setNotifications(parsedNotifications);
        setUnreadCount(parsedNotifications.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const saveUserData = async (data: UserData) => {
    try {
      // Simpan ke AsyncStorage untuk cache lokal
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
      setUserData(data);

      // Sync ke Firestore
      if (currentUser?.id) {
        await UserDatabase.updateUser(currentUser.id, {
          name: data.name,
          nim: data.nim,
          prodi: data.prodi,
          universitas: data.universitas,
          angkatan: data.angkatan,
          phone: data.phone,
          alamat: data.alamat,
        });
      }
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'Gagal menyimpan data profil');
    }
  };

  const handleSaveProfile = () => {
    if (!editForm.name.trim()) {
      Alert.alert('Error', 'Nama tidak boleh kosong');
      return;
    }
    if (!editForm.nim.trim()) {
      Alert.alert('Error', 'NIM tidak boleh kosong');
      return;
    }
    if (!editForm.email.trim()) {
      Alert.alert('Error', 'Email tidak boleh kosong');
      return;
    }
    
    saveUserData(editForm);
    setShowEditProfile(false);
    Alert.alert('Sukses', 'Profil berhasil diperbarui');
  };

  // Real materials from Firestore
  const [materials, setMaterials] = React.useState<Material[]>([]);
  const [videos, setVideos] = React.useState<Video[]>([]);
  const [quizzes, setQuizzes] = React.useState<Quiz[]>([]);

  React.useEffect(() => {
    const loadFirestoreData = async () => {
      try {
        const cached = await AsyncStorage.getItem('@materi_cache');
        if (cached) {
          const { materials: m, videos: v, quizzes: q } = JSON.parse(cached);
          if (m) setMaterials(m.filter((mat: Material) => mat.status === 'published'));
          if (v) setVideos(v.filter((vid: Video) => vid.status === 'published'));
          if (q) setQuizzes(q.filter((qz: Quiz) => qz.status === 'published'));
        }
        const [m, v, q] = await Promise.all([
          LecturerDatabase.getAllMaterials(),
          LecturerDatabase.getAllVideos(),
          LecturerDatabase.getAllQuizzes(),
        ]);
        setMaterials(m.filter(mat => mat.status === 'published'));
        setVideos(v.filter(vid => vid.status === 'published'));
        setQuizzes(q.filter(qz => qz.status === 'published'));
      } catch (_) {}
    };
    loadFirestoreData();
  }, []);

  const totalMaterials = materials.length;
  const totalVideos = videos.length;
  const totalQuizzes = quizzes.length;

  const handleLogout = async () => {
    Alert.alert(
      'Keluar dari Akun',
      'Apakah Anda yakin ingin keluar dari aplikasi?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            
            try {
              console.log('Logout: Starting logout process...');
              
              // Clear all user data and session
              await AsyncStorage.multiRemove([
                '@edubidan_current_user',
                '@edubidan_user_data',
                '@edubidan_progress',
                '@edubidan_theme',
                '@edubidan_notifications'
              ]);
              
              // Also use UserDatabase logout
              await UserDatabase.logoutUser();
              
              console.log('Logout: All data cleared, navigating to login...');
              
              // Navigate directly to login page
              router.dismissAll();
              router.replace('/(auth)/login');
              
              console.log('Logout: Navigation to login completed!');
              
            } catch (error) {
              console.error('Logout error:', error);
              // Force navigate even on error
              router.dismissAll();
              router.replace('/(auth)/login');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'light-content'} backgroundColor={Colors.primaryDark} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.header}>
          <Text style={styles.headerTitle}>Profil Saya</Text>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity 
              style={styles.avatarWrap}
              onPress={() => setShowEditProfile(true)}
            >
              <Text style={styles.avatarText}>{userData.name.charAt(0)}</Text>
              <View style={styles.editIconWrap}>
                <Ionicons name="pencil" size={12} color={Colors.white} />
              </View>
            </TouchableOpacity>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userNim}>NIM: {userData.nim}</Text>
            <View style={styles.prodiTag}>
              <Ionicons name="school-outline" size={13} color={Colors.white} />
              <Text style={styles.prodiText}>{userData.prodi}</Text>
            </View>
          </View>

          {/* Stats — real data from Firestore */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalMaterials}</Text>
              <Text style={styles.statLabel}>Materi</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalVideos}</Text>
              <Text style={styles.statLabel}>Video</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalQuizzes}</Text>
              <Text style={styles.statLabel}>Kuis</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>INFORMASI AKUN</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="person-outline"
              label="Nama Lengkap"
              value={userData.name}
              onPress={() => setShowEditProfile(true)}
            />
            <MenuItem
              icon="card-outline"
              label="NIM"
              value={userData.nim}
              onPress={() => setShowEditProfile(true)}
            />
            <MenuItem
              icon="mail-outline"
              label="Email"
              value={userData.email}
              onPress={() => setShowEditProfile(true)}
            />
            <MenuItem
              icon="school-outline"
              label="Program Studi"
              value={userData.prodi}
              onPress={() => setShowEditProfile(true)}
            />
            <MenuItem
              icon="business-outline"
              label="Universitas"
              value={userData.universitas}
              onPress={() => setShowEditProfile(true)}
            />
            <MenuItem
              icon="calendar-outline"
              label="Angkatan"
              value={userData.angkatan}
              onPress={() => setShowEditProfile(true)}
            />
            {userData.phone && (
              <MenuItem
                icon="call-outline"
                label="No. Telepon"
                value={userData.phone}
                onPress={() => setShowEditProfile(true)}
              />
            )}
            {userData.alamat && (
              <MenuItem
                icon="location-outline"
                label="Alamat"
                value={userData.alamat}
                onPress={() => setShowEditProfile(true)}
              />
            )}
          </View>
        </View>

        {/* Materials Section — real data from Firestore */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>MATERI PEMBELAJARAN</Text>
          <View style={styles.menuGroup}>
            {materials.length === 0 ? (
              <View style={[styles.menuItem, { backgroundColor: theme.card }]}>
                <Text style={[styles.menuValue, { color: theme.textMuted, padding: 8 }]}>
                  Belum ada materi dari dosen.
                </Text>
              </View>
            ) : (
              materials.map((m) => {
                const colorMap: Record<string, string> = {
                  Kehamilan: '#4CAF50', Persalinan: '#2196F3', Nifas: '#9C27B0',
                  Neonatus: '#FF9800', Laktasi: '#E91E63', KB: '#00BCD4',
                };
                const color = colorMap[m.category] || Colors.primary;
                const matVideos = videos.filter(v => v.materialId === m.id);
                const matQuiz = quizzes.find(q => q.materialId === m.id);
                return (
                  <View key={m.id} style={[styles.menuItem, { backgroundColor: theme.card }]}>
                    <View style={[styles.menuIconWrap, { backgroundColor: color + '20' }]}>
                      <Ionicons name="book-outline" size={20} color={color} />
                    </View>
                    <View style={styles.menuContent}>
                      <Text style={[styles.menuLabel, { color: theme.text }]} numberOfLines={1}>
                        {m.title}
                      </Text>
                      <Text style={[styles.menuValue, { color: theme.textMuted }]}>
                        {m.category} • {matVideos.length} video • {matQuiz ? `${matQuiz.questions?.length || 0} soal` : 'Belum ada kuis'}
                      </Text>
                    </View>
                    <View style={[styles.menuIconWrap, { backgroundColor: color + '20' }]}>
                      <Text style={{ color, fontSize: 10, fontWeight: '700' }}>
                        {m.status === 'published' ? 'Aktif' : 'Draft'}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>PENGATURAN</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="create-outline"
              label="Edit Profil"
              onPress={() => setShowEditProfile(true)}
            />
            <MenuItem
              icon="moon-outline"
              label="Mode Gelap"
              rightElement={
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: Colors.slate200, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              }
            />
            <MenuItem
              icon="notifications-outline"
              label="Notifikasi"
              onPress={() => setShowNotifications(true)}
              rightElement={
                unreadCount > 0 ? (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                ) : null
              }
            />
            <MenuItem
              icon="help-circle-outline"
              label="Bantuan"
              onPress={() => Alert.alert('Bantuan', 'Hubungi: support@edubidan.ac.id')}
            />
            <MenuItem
              icon="information-circle-outline"
              label="Tentang Aplikasi"
              value="EduBidan v1.0.0"
              onPress={() =>
                Alert.alert(
                  'Tentang EduBidan',
                  'EduBidan adalah aplikasi pembelajaran kebidanan untuk mahasiswa Universitas Singaperbangsa Karawang.\n\nVersi: 1.0.0\n© 2024 EduBidan'
                )
              }
            />
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>AKUN</Text>
          
          {/* Simple Logout Button */}
          <TouchableOpacity 
            style={[styles.simpleLogoutBtn, { backgroundColor: theme.card, borderColor: Colors.rose + '30' }]}
            onPress={handleLogout}
            activeOpacity={0.6}
            disabled={isLoggingOut}
          >
            <View style={styles.logoutRow}>
              <View style={styles.logoutLeft}>
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color={Colors.rose} />
                ) : (
                  <Ionicons name="log-out-outline" size={24} color={Colors.rose} />
                )}
                <View style={styles.logoutTextWrap}>
                  <Text style={[styles.logoutTitle, { color: Colors.rose }]}>
                    {isLoggingOut ? 'Mengeluarkan...' : 'Keluar dari Akun'}
                  </Text>
                  <Text style={[styles.logoutSubtitle, { color: theme.textMuted }]}>
                    Logout dan kembali ke halaman login
                  </Text>
                </View>
              </View>
              {!isLoggingOut && (
                <Ionicons name="chevron-forward" size={20} color={Colors.rose} />
              )}
            </View>
          </TouchableOpacity>
          
          <View style={styles.logoutNote}>
            <Text style={[styles.logoutNoteText, { color: theme.textMuted }]}>
              💡 Data progress belajar Anda akan tetap tersimpan
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            © 2024 EduBidan · UNSIKA
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditProfile(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setShowEditProfile(false)}>
              <Text style={[styles.modalCancel, { color: Colors.primary }]}>Batal</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profil</Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Text style={[styles.modalSave, { color: Colors.primary }]}>Simpan</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>Nama Lengkap *</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>NIM *</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                value={editForm.nim}
                onChangeText={(text) => setEditForm({ ...editForm, nim: text })}
                placeholder="Masukkan NIM"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>Email *</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                value={editForm.email}
                onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                placeholder="Masukkan email"
                placeholderTextColor={theme.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>No. Telepon</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                value={editForm.phone}
                onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                placeholder="Masukkan nomor telepon"
                placeholderTextColor={theme.textMuted}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>Angkatan</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                value={editForm.angkatan}
                onChangeText={(text) => setEditForm({ ...editForm, angkatan: text })}
                placeholder="Contoh: 2022"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>Program Studi</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                value={editForm.prodi}
                onChangeText={(text) => setEditForm({ ...editForm, prodi: text })}
                placeholder="Contoh: Kebidanan"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>Universitas</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                value={editForm.universitas}
                onChangeText={(text) => setEditForm({ ...editForm, universitas: text })}
                placeholder="Nama universitas"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>Alamat</Text>
              <TextInput
                style={[styles.formTextArea, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                value={editForm.alamat}
                onChangeText={(text) => setEditForm({ ...editForm, alamat: text })}
                placeholder="Masukkan alamat lengkap"
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formNote}>
              <Text style={[styles.formNoteText, { color: theme.textMuted }]}>
                * Field wajib diisi
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setShowNotifications(false)}>
              <Text style={[styles.modalCancel, { color: Colors.primary }]}>Tutup</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Notifikasi</Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Ionicons name="notifications-off-outline" size={48} color={theme.textMuted} />
                <Text style={[styles.emptyNotificationsText, { color: theme.textMuted }]}>
                  Belum ada notifikasi
                </Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <View key={notification.id} style={[styles.notificationItem, { backgroundColor: theme.card }]}>
                  <View style={styles.notificationContent}>
                    <Text style={[styles.notificationTitle, { color: theme.text }]}>
                      {notification.title}
                    </Text>
                    <Text style={[styles.notificationMessage, { color: theme.textMuted }]}>
                      {notification.message}
                    </Text>
                    <Text style={[styles.notificationTime, { color: theme.textMuted }]}>
                      {new Date(notification.timestamp).toLocaleDateString('id-ID')}
                    </Text>
                  </View>
                  {!notification.isRead && (
                    <View style={[styles.unreadDot, { backgroundColor: Colors.primary }]} />
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: { paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.white, marginBottom: 20 },

  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
    position: 'relative',
  },
  editIconWrap: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: Colors.white },
  userName: { fontSize: 20, fontWeight: '800', color: Colors.white, marginBottom: 4, textAlign: 'center' },
  userNim: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  prodiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  prodiText: { fontSize: 12, color: Colors.white, fontWeight: '600' },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.white },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },

  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10, paddingHorizontal: 4 },

  menuGroup: { gap: 2 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
    marginBottom: 2,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600' },
  menuValue: { fontSize: 12, marginTop: 2 },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  progressBg: { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 11, fontWeight: '600', minWidth: 30 },

  logoutSection: { paddingBottom: 8 },
  simpleLogoutBtn: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    marginBottom: 16,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  logoutTextWrap: {
    flex: 1,
  },
  logoutTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  logoutSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  logoutNote: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  logoutNoteText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  footer: { paddingVertical: 20, alignItems: 'center' },
  footerText: { fontSize: 12 },

  // Modal styles
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalCancel: { fontSize: 16, fontWeight: '600' },
  modalSave: { fontSize: 16, fontWeight: '700' },
  modalContent: { flex: 1, padding: 20 },

  // Form styles
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  formInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  formTextArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
  },
  formNote: { marginTop: 10 },
  formNoteText: { fontSize: 12, fontStyle: 'italic' },

  // Notification styles
  notificationBadge: {
    backgroundColor: Colors.rose,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  notificationBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyNotifications: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyNotificationsText: {
    fontSize: 16,
    marginTop: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  notificationMessage: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  notificationTime: { fontSize: 11 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
});
