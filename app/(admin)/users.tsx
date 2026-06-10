import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  FlatList,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { AdminDatabase, Student, Lecturer, AdminUser } from '../../src/utils/adminDatabase';

type UserType = 'students' | 'lecturers' | 'admins';
type User = Student | Lecturer | AdminUser;

export default function UsersManagementScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  
  // State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<UserType>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nim: '',
    nip: '',
    specialization: '',
    role: 'admin' as AdminUser['role'],
    isActive: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      await AdminDatabase.initializeDatabase();
      
      const [studentsData, lecturersData, adminsData] = await Promise.all([
        AdminDatabase.getAllStudents(),
        AdminDatabase.getAllLecturers(),
        AdminDatabase.getAllAdmins(),
      ]);
      
      setStudents(studentsData);
      setLecturers(lecturersData);
      setAdmins(adminsData);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };
  const getCurrentUsers = (): User[] => {
    switch (activeTab) {
      case 'students': return students;
      case 'lecturers': return lecturers;
      case 'admins': return admins;
      default: return [];
    }
  };

  const getFilteredUsers = (): User[] => {
    const users = getCurrentUsers();
    if (!searchQuery.trim()) return users;
    
    return users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ('nim' in user && user.nim.includes(searchQuery)) ||
      ('nip' in user && user.nip.includes(searchQuery))
    );
  };

  const handleCreateUser = async () => {
    try {
      if (!formData.name || !formData.email) {
        Alert.alert('Error', 'Nama dan email harus diisi');
        return;
      }

      if (activeTab === 'admins') {
        const result = await AdminDatabase.createAdmin({
          name: formData.name,
          email: formData.email,
          password: 'defaultpass123',
          role: formData.role,
          phone: formData.phone,
          isActive: formData.isActive,
          permissions: formData.role === 'super_admin' ? ['all'] : ['content_management'],
        });
        
        if (result.success) {
          Alert.alert('Sukses', 'Admin berhasil dibuat');
          setShowCreateModal(false);
          resetForm();
          loadUsers();
        } else {
          Alert.alert('Error', result.message);
        }
      } else {
        // For students and lecturers, we'll simulate creation
        Alert.alert('Info', 'Fitur tambah mahasiswa/dosen akan segera tersedia');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Gagal membuat pengguna');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      nim: '',
      nip: '',
      specialization: '',
      role: 'admin',
      isActive: true,
    });
  };
  const handleToggleUserStatus = async (user: User) => {
    const newStatus = !user.isActive;
    const action = newStatus ? 'mengaktifkan' : 'menonaktifkan';
    
    Alert.alert(
      'Konfirmasi',
      `Apakah Anda yakin ingin ${action} pengguna ${user.name}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya',
          onPress: async () => {
            try {
              if ('role' in user) {
                await AdminDatabase.updateAdmin(user.id, { isActive: newStatus });
              }
              Alert.alert('Sukses', `Pengguna berhasil di${action.slice(1)}`);
              loadUsers();
            } catch (error) {
              Alert.alert('Error', `Gagal ${action} pengguna`);
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = async (user: User) => {
    Alert.alert(
      'Konfirmasi Hapus',
      `Apakah Anda yakin ingin menghapus pengguna ${user.name}? Tindakan ini tidak dapat dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              if ('role' in user) {
                const result = await AdminDatabase.deleteAdmin(user.id);
                if (result.success) {
                  Alert.alert('Sukses', 'Admin berhasil dihapus');
                  loadUsers();
                } else {
                  Alert.alert('Error', result.message);
                }
              }
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus pengguna');
            }
          },
        },
      ]
    );
  };

  const getUserStatusColor = (user: User) => {
    if (!user.isActive) return Colors.gray500;
    
    const lastActive = 'lastActive' in user ? user.lastActive : 
                      'lastLogin' in user ? user.lastLogin : Date.now();
    
    const daysSinceActive = (Date.now() - (lastActive || 0)) / (1000 * 60 * 60 * 24);
    
    if (daysSinceActive <= 1) return Colors.green;
    if (daysSinceActive <= 7) return Colors.amber;
    return Colors.rose;
  };

  const getUserStatusText = (user: User) => {
    if (!user.isActive) return 'Nonaktif';
    
    const lastActive = 'lastActive' in user ? user.lastActive : 
                      'lastLogin' in user ? user.lastLogin : Date.now();
    
    const daysSinceActive = (Date.now() - (lastActive || 0)) / (1000 * 60 * 60 * 24);
    
    if (daysSinceActive <= 1) return 'Online';
    if (daysSinceActive <= 7) return 'Aktif';
    return 'Tidak Aktif';
  };
  const renderUserCard = ({ item: user }: { item: User }) => (
    <TouchableOpacity
      style={[styles.userCard, { backgroundColor: theme.card }]}
      onPress={() => {
        setSelectedUser(user);
        setShowUserModal(true);
      }}
      activeOpacity={0.8}
    >
      <View style={styles.userCardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
              {user.name}
            </Text>
            <Text style={[styles.userEmail, { color: theme.textMuted }]} numberOfLines={1}>
              {user.email}
            </Text>
            {'nim' in user && (
              <Text style={[styles.userMeta, { color: theme.textMuted }]}>
                NIM: {user.nim}
              </Text>
            )}
            {'nip' in user && (
              <Text style={[styles.userMeta, { color: theme.textMuted }]}>
                NIP: {user.nip}
              </Text>
            )}
            {'role' in user && (
              <Text style={[styles.userMeta, { color: theme.textMuted }]}>
                Role: {user.role}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.userActions}>
          <View style={[styles.statusBadge, { backgroundColor: getUserStatusColor(user) + '20' }]}>
            <Text style={[styles.statusText, { color: getUserStatusColor(user) }]}>
              {getUserStatusText(user)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.moreBtn}
            onPress={() => {
              setSelectedUser(user);
              setShowUserModal(true);
            }}
          >
            <Ionicons name="ellipsis-vertical" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
      
      {activeTab === 'students' && 'completedModules' in user && (
        <View style={styles.userStats}>
          <View style={styles.userStat}>
            <Text style={[styles.userStatValue, { color: Colors.primary }]}>
              {user.completedModules.length}
            </Text>
            <Text style={[styles.userStatLabel, { color: theme.textMuted }]}>Modul Selesai</Text>
          </View>
          <View style={styles.userStatDivider} />
          <View style={styles.userStat}>
            <Text style={[styles.userStatValue, { color: Colors.blue }]}>
              {user.totalQuizzes}
            </Text>
            <Text style={[styles.userStatLabel, { color: theme.textMuted }]}>Quiz Dikerjakan</Text>
          </View>
          <View style={styles.userStatDivider} />
          <View style={styles.userStat}>
            <Text style={[styles.userStatValue, { color: Colors.amber }]}>
              {user.averageScore.toFixed(1)}
            </Text>
            <Text style={[styles.userStatLabel, { color: theme.textMuted }]}>Rata-rata</Text>
          </View>
        </View>
      )}
      
      {activeTab === 'lecturers' && 'totalMaterials' in user && (
        <View style={styles.userStats}>
          <View style={styles.userStat}>
            <Text style={[styles.userStatValue, { color: Colors.primary }]}>
              {user.totalMaterials}
            </Text>
            <Text style={[styles.userStatLabel, { color: theme.textMuted }]}>Materi</Text>
          </View>
          <View style={styles.userStatDivider} />
          <View style={styles.userStat}>
            <Text style={[styles.userStatValue, { color: Colors.blue }]}>
              {user.totalVideos}
            </Text>
            <Text style={[styles.userStatLabel, { color: theme.textMuted }]}>Video</Text>
          </View>
          <View style={styles.userStatDivider} />
          <View style={styles.userStat}>
            <Text style={[styles.userStatValue, { color: Colors.amber }]}>
              {user.totalStudents}
            </Text>
            <Text style={[styles.userStatLabel, { color: theme.textMuted }]}>Mahasiswa</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'light-content'}
        backgroundColor={Colors.primaryDark}
      />
      
      {/* ── Header ── */}
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Manajemen Pengguna</Text>
            <Text style={styles.headerSubtitle}>
              Kelola mahasiswa, dosen, dan admin
            </Text>
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
              style={styles.addBtn}
              onPress={() => {
                resetForm();
                setShowCreateModal(true);
              }}
            >
              <Ionicons name="add" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color="rgba(255,255,255,0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari pengguna..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close" size={16} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* ── Filter Tabs ── */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {[
            { key: 'students', label: 'Mahasiswa', count: students.length },
            { key: 'lecturers', label: 'Dosen', count: lecturers.length },
            { key: 'admins', label: 'Admin', count: admins.length },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && { backgroundColor: Colors.primary },
                activeTab !== tab.key && { backgroundColor: theme.card }
              ]}
              onPress={() => setActiveTab(tab.key as UserType)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key ? { color: Colors.white } : { color: theme.text }
                ]}
              >
                {tab.label}
              </Text>
              <View
                style={[
                  styles.tabBadge,
                  activeTab === tab.key 
                    ? { backgroundColor: 'rgba(255,255,255,0.2)' }
                    : { backgroundColor: theme.border }
                ]}
              >
                <Text
                  style={[
                    styles.tabBadgeText,
                    activeTab === tab.key ? { color: Colors.white } : { color: theme.textMuted }
                  ]}
                >
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* ── User List ── */}
      <FlatList
        data={getFilteredUsers()}
        keyExtractor={(item) => item.id}
        renderItem={renderUserCard}
        contentContainerStyle={styles.usersList}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadUsers}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {searchQuery ? 'Tidak ada hasil' : 'Belum ada pengguna'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              {searchQuery ? 'Coba kata kunci lain' : 'Tambah pengguna baru dengan tombol +'}
            </Text>
          </View>
        }
      />

      {/* Create User Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Tambah {activeTab === 'students' ? 'Mahasiswa' : 
                     activeTab === 'lecturers' ? 'Dosen' : 'Admin'}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowCreateModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>Nama Lengkap *</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor={theme.textMuted}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>Email *</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Masukkan email"
                placeholderTextColor={theme.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>Nomor Telepon</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Masukkan nomor telepon"
                placeholderTextColor={theme.textMuted}
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
              />
            </View>

            {activeTab === 'students' && (
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.text }]}>NIM *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                  placeholder="Masukkan NIM"
                  placeholderTextColor={theme.textMuted}
                  value={formData.nim}
                  onChangeText={(text) => setFormData({...formData, nim: text})}
                />
              </View>
            )}
            {activeTab === 'lecturers' && (
              <>
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: theme.text }]}>NIP *</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                    placeholder="Masukkan NIP"
                    placeholderTextColor={theme.textMuted}
                    value={formData.nip}
                    onChangeText={(text) => setFormData({...formData, nip: text})}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: theme.text }]}>Spesialisasi</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                    placeholder="Masukkan spesialisasi"
                    placeholderTextColor={theme.textMuted}
                    value={formData.specialization}
                    onChangeText={(text) => setFormData({...formData, specialization: text})}
                  />
                </View>
              </>
            )}

            {activeTab === 'admins' && (
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.text }]}>Role *</Text>
                <View style={styles.roleOptions}>
                  {(['super_admin', 'admin', 'moderator'] as AdminUser['role'][]).map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleOption,
                        { backgroundColor: theme.surface, borderColor: theme.border },
                        formData.role === role && { borderColor: Colors.primary, backgroundColor: Colors.primaryLight }
                      ]}
                      onPress={() => setFormData({...formData, role})}
                    >
                      <Text style={[
                        styles.roleOptionText,
                        { color: theme.text },
                        formData.role === role && { color: Colors.primary }
                      ]}>
                        {role === 'super_admin' ? 'Super Admin' : 
                         role === 'admin' ? 'Admin' : 'Moderator'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={[styles.formLabel, { color: theme.text }]}>Status Aktif</Text>
                  <Text style={[styles.switchDescription, { color: theme.textMuted }]}>
                    Pengguna dapat login ke aplikasi
                  </Text>
                </View>
                <Switch
                  value={formData.isActive}
                  onValueChange={(value) => setFormData({...formData, isActive: value})}
                  trackColor={{ false: theme.border, true: Colors.primaryLight }}
                  thumbColor={formData.isActive ? Colors.primary : theme.textMuted}
                />
              </View>
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: theme.border }]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createBtn, { backgroundColor: Colors.primary }]}
                onPress={handleCreateUser}
              >
                <Text style={styles.createBtnText}>Buat Pengguna</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
      {/* User Detail Modal */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Detail Pengguna
            </Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowUserModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          
          {selectedUser && (
            <ScrollView style={styles.modalContent}>
              <View style={[styles.userDetailCard, { backgroundColor: theme.surface }]}>
                <View style={styles.userDetailHeader}>
                  <View style={styles.userDetailAvatar}>
                    <Text style={styles.userDetailAvatarText}>
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userDetailInfo}>
                    <Text style={[styles.userDetailName, { color: theme.text }]}>
                      {selectedUser.name}
                    </Text>
                    <Text style={[styles.userDetailEmail, { color: theme.textMuted }]}>
                      {selectedUser.email}
                    </Text>
                    <View style={[styles.userDetailStatus, { backgroundColor: getUserStatusColor(selectedUser) + '20' }]}>
                      <Text style={[styles.userDetailStatusText, { color: getUserStatusColor(selectedUser) }]}>
                        {getUserStatusText(selectedUser)}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.userDetailActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: selectedUser.isActive ? Colors.amberLight : Colors.greenLight }]}
                    onPress={() => handleToggleUserStatus(selectedUser)}
                  >
                    <Ionicons 
                      name={selectedUser.isActive ? "pause" : "play"} 
                      size={16} 
                      color={selectedUser.isActive ? Colors.amber : Colors.green} 
                    />
                    <Text style={[styles.actionBtnText, { color: selectedUser.isActive ? Colors.amber : Colors.green }]}>
                      {selectedUser.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.blueLight }]}
                    onPress={() => Alert.alert('Info', 'Fitur reset password akan segera tersedia')}
                  >
                    <Ionicons name="key" size={16} color={Colors.blue} />
                    <Text style={[styles.actionBtnText, { color: Colors.blue }]}>Reset Password</Text>
                  </TouchableOpacity>
                  
                  {'role' in selectedUser && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: Colors.roseLight }]}
                      onPress={() => handleDeleteUser(selectedUser)}
                    >
                      <Ionicons name="trash" size={16} color={Colors.rose} />
                      <Text style={[styles.actionBtnText, { color: Colors.rose }]}>Hapus</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  
  // Header Styles
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Search Bar
  searchContainer: { marginTop: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.white },

  // Tabs
  tabsContainer: { paddingVertical: 16, borderBottomWidth: 1 },
  tabs: { paddingHorizontal: 20, gap: 12 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  tabText: { fontSize: 14, fontWeight: '600' },
  tabBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  tabBadgeText: { fontSize: 10, fontWeight: '700' },

  // User List
  usersList: { padding: 20 },
  userCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  userCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: { fontSize: 18, fontWeight: '700', color: Colors.white },
  userDetails: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  userEmail: { fontSize: 13, marginBottom: 2 },
  userMeta: { fontSize: 11 },
  userActions: { alignItems: 'flex-end', gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  moreBtn: { padding: 4 },
  // User Stats
  userStats: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  userStat: { flex: 1, alignItems: 'center' },
  userStatValue: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  userStatLabel: { fontSize: 10, textAlign: 'center' },
  userStatDivider: { width: 1, height: 24, backgroundColor: 'rgba(0,0,0,0.1)' },

  // Empty State
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // Modal Styles
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalCloseBtn: { padding: 4 },
  modalContent: { flex: 1, padding: 20 },

  // Form Styles
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  formInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  roleOptions: { flexDirection: 'row', gap: 8 },
  roleOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  roleOptionText: { fontSize: 12, fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchDescription: { fontSize: 12, marginTop: 2 },
  formActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600' },
  createBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  createBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },

  // User Detail Modal
  userDetailCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  userDetailHeader: { alignItems: 'center', marginBottom: 20 },
  userDetailAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userDetailAvatarText: { fontSize: 28, fontWeight: '700', color: Colors.white },
  userDetailInfo: { alignItems: 'center' },
  userDetailName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  userDetailEmail: { fontSize: 14, marginBottom: 8 },
  userDetailStatus: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  userDetailStatusText: { fontSize: 12, fontWeight: '700' },
  userDetailActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnText: { fontSize: 12, fontWeight: '600' },
});