import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { LecturerDatabase, Material } from '../../src/utils/lecturerDatabase';

export default function MateriSayaScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  
  // Form state for creating new material
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    category: '',
    description: '',
    content: '',
    estimatedDuration: '',
    totalLessons: 1,
  });

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, searchQuery, selectedFilter]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const materialsData = await LecturerDatabase.getAllMaterials();
      setMaterials(materialsData);
    } catch (error) {
      console.error('Error loading materials:', error);
      Alert.alert('Error', 'Gagal memuat materi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = materials;

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(material => material.status === selectedFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(query) ||
        material.category.toLowerCase().includes(query) ||
        material.description.toLowerCase().includes(query)
      );
    }

    setFilteredMaterials(filtered);
  };

  const getFilterCounts = () => {
    return {
      all: materials.length,
      published: materials.filter(m => m.status === 'published').length,
      draft: materials.filter(m => m.status === 'draft').length,
      archived: materials.filter(m => m.status === 'archived').length,
    };
  };

  const handleCreateMaterial = async () => {
    try {
      if (!newMaterial.title.trim()) {
        Alert.alert('Error', 'Judul materi harus diisi.');
        return;
      }

      if (!newMaterial.category.trim()) {
        Alert.alert('Error', 'Kategori materi harus diisi.');
        return;
      }

      const result = await LecturerDatabase.createMaterial({
        title: newMaterial.title,
        category: newMaterial.category,
        description: newMaterial.description || 'Deskripsi materi pembelajaran.',
        content: newMaterial.content || 'Konten materi akan ditambahkan di sini.',
        status: 'draft',
        createdBy: require('../../src/config/firebase').auth.currentUser?.uid || 'lecturer1', // TODO: Get from auth context
        totalLessons: newMaterial.totalLessons,
        estimatedDuration: newMaterial.estimatedDuration || '1 jam',
      });

      if (result.success) {
        Alert.alert('Sukses', result.message);
        setShowCreateModal(false);
        setShowAddModal(false);
        setNewMaterial({
          title: '',
          category: '',
          description: '',
          content: '',
          estimatedDuration: '',
          totalLessons: 1,
        });
        await loadMaterials();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error creating material:', error);
      Alert.alert('Error', 'Gagal membuat materi. Silakan coba lagi.');
    }
  };

  const handleEditMaterial = (materialId: string) => {
    // TODO: Navigate to edit screen or show edit modal
    Alert.alert('Info', 'Fitur edit akan tersedia segera.');
  };

  const handleDeleteMaterial = (material: Material) => {
    Alert.alert(
      'Konfirmasi Hapus',
      `Apakah Anda yakin ingin menghapus materi "${material.title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await LecturerDatabase.deleteMaterial(material.id);
              if (result.success) {
                Alert.alert('Sukses', result.message);
                await loadMaterials();
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              console.error('Error deleting material:', error);
              Alert.alert('Error', 'Gagal menghapus materi.');
            }
          },
        },
      ]
    );
  };

  const handlePublishMaterial = async (material: Material) => {
    try {
      const result = await LecturerDatabase.updateMaterial(material.id, {
        status: material.status === 'published' ? 'draft' : 'published',
      });
      
      if (result.success) {
        Alert.alert('Sukses', result.message);
        await loadMaterials();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error updating material:', error);
      Alert.alert('Error', 'Gagal mengubah status materi.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return Colors.primary;
      case 'draft': return Colors.amber;
      case 'archived': return Colors.gray500;
      default: return Colors.gray500;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Dipublikasi';
      case 'draft': return 'Draft';
      case 'archived': return 'Diarsipkan';
      default: return 'Unknown';
    }
  };

  const filters = [
    { id: 'all', label: 'Semua', count: getFilterCounts().all },
    { id: 'published', label: 'Dipublikasi', count: getFilterCounts().published },
    { id: 'draft', label: 'Draft', count: getFilterCounts().draft },
    { id: 'archived', label: 'Diarsipkan', count: getFilterCounts().archived },
  ];

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
            <Text style={styles.headerTitle}>Materi Saya</Text>
            <Text style={styles.headerSubtitle}>
              Kelola dan pantau semua materi pembelajaran
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
              onPress={() => setShowAddModal(true)}
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
              placeholder="Cari materi pembelajaran..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Filter Tabs ── */}
        <View style={[styles.filterSection, { backgroundColor: theme.surface }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabs}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterTab,
                  selectedFilter === filter.id && { backgroundColor: Colors.primary },
                  selectedFilter !== filter.id && { backgroundColor: theme.card }
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    selectedFilter === filter.id ? { color: Colors.white } : { color: theme.text }
                  ]}
                >
                  {filter.label}
                </Text>
                <View
                  style={[
                    styles.filterTabBadge,
                    selectedFilter === filter.id 
                      ? { backgroundColor: 'rgba(255,255,255,0.2)' }
                      : { backgroundColor: theme.border }
                  ]}
                >
                  <Text
                    style={[
                      styles.filterTabBadgeText,
                      selectedFilter === filter.id ? { color: Colors.white } : { color: theme.textMuted }
                    ]}
                  >
                    {filter.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Quick Stats ── */}
        <View style={[styles.statsSection, { backgroundColor: theme.background }]}>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="book" size={18} color={Colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{materials.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Materi</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.blueLight }]}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.blue} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{getFilterCounts().published}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Dipublikasi</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.amberLight }]}>
                <Ionicons name="create" size={18} color={Colors.amber} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{getFilterCounts().draft}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Draft</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.roseLight }]}>
                <Ionicons name="people" size={18} color={Colors.rose} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>45</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Siswa Aktif</Text>
            </View>
          </View>
        </View>

        {/* ── Module List ── */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Materi Pembelajaran ({filteredMaterials.length})
            </Text>
            <TouchableOpacity 
              style={styles.sortBtn}
              onPress={() => Alert.alert('Info', 'Fitur sorting akan tersedia segera.')}
            >
              <Ionicons name="funnel-outline" size={16} color={theme.textMuted} />
              <Text style={[styles.sortBtnText, { color: theme.textMuted }]}>Urutkan</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={[styles.loadingText, { color: theme.textMuted }]}>Memuat materi...</Text>
            </View>
          ) : filteredMaterials.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {searchQuery ? 'Tidak ada materi ditemukan' : 'Belum ada materi'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                {searchQuery ? 'Coba ubah kata kunci pencarian' : 'Tambahkan materi pembelajaran pertama Anda'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => setShowAddModal(true)}
                >
                  <Text style={styles.emptyButtonText}>Tambah Materi</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredMaterials.map((material) => (
              <View key={material.id} style={[styles.moduleCard, { backgroundColor: theme.card }]}>
                <View style={styles.moduleCardHeader}>
                  <View style={styles.moduleCardLeft}>
                    <View style={[styles.moduleIcon, { backgroundColor: getStatusColor(material.status) + '20' }]}>
                      <Ionicons name="book-outline" size={20} color={getStatusColor(material.status)} />
                    </View>
                    <View style={styles.moduleInfo}>
                      <View style={styles.moduleTopRow}>
                        <View style={[styles.categoryBadge, { backgroundColor: Colors.blue + '20' }]}>
                          <Text style={[styles.categoryText, { color: Colors.blue }]}>
                            {material.category}
                          </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(material.status) + '20' }]}>
                          <Text style={[styles.statusText, { color: getStatusColor(material.status) }]}>
                            {getStatusText(material.status)}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.moduleTitle, { color: theme.text }]} numberOfLines={2}>
                        {material.title}
                      </Text>
                      <Text style={[styles.moduleDescription, { color: theme.textMuted }]} numberOfLines={2}>
                        {material.description}
                      </Text>
                      <View style={styles.moduleMetaRow}>
                        <View style={styles.moduleMetaItem}>
                          <Ionicons name="layers-outline" size={12} color={theme.textMuted} />
                          <Text style={[styles.moduleMetaText, { color: theme.textMuted }]}>
                            {material.totalLessons} pelajaran
                          </Text>
                        </View>
                        <View style={styles.moduleMetaItem}>
                          <Ionicons name="time-outline" size={12} color={theme.textMuted} />
                          <Text style={[styles.moduleMetaText, { color: theme.textMuted }]}>
                            {material.estimatedDuration}
                          </Text>
                        </View>
                        <View style={styles.moduleMetaItem}>
                          <Ionicons name="calendar-outline" size={12} color={theme.textMuted} />
                          <Text style={[styles.moduleMetaText, { color: theme.textMuted }]}>
                            {new Date(material.updatedAt).toLocaleDateString('id-ID')}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.moreBtn}
                    onPress={() => Alert.alert('Info', 'Menu lebih lanjut akan tersedia segera.')}
                  >
                    <Ionicons name="ellipsis-vertical" size={16} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>

                <View style={styles.moduleActions}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: theme.surface }]}
                    onPress={() => handleEditMaterial(material.id)}
                  >
                    <Ionicons name="create-outline" size={16} color={Colors.primary} />
                    <Text style={[styles.actionBtnText, { color: Colors.primary }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: theme.surface }]}
                    onPress={() => handlePublishMaterial(material)}
                  >
                    <Ionicons 
                      name={material.status === 'published' ? 'eye-off-outline' : 'eye-outline'} 
                      size={16} 
                      color={Colors.blue} 
                    />
                    <Text style={[styles.actionBtnText, { color: Colors.blue }]}>
                      {material.status === 'published' ? 'Sembunyikan' : 'Publikasi'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: theme.surface }]}
                    onPress={() => handleDeleteMaterial(material)}
                  >
                    <Ionicons name="trash-outline" size={16} color={Colors.rose} />
                    <Text style={[styles.actionBtnText, { color: Colors.rose }]}>Hapus</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
      {/* Add Material Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Tambah Materi Baru</Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowAddModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={[styles.addOption, { backgroundColor: theme.card }]}
              onPress={() => {
                setShowAddModal(false);
                setShowCreateModal(true);
              }}
            >
              <View style={[styles.addOptionIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="create-outline" size={24} color={Colors.primary} />
              </View>
              <View style={styles.addOptionContent}>
                <Text style={[styles.addOptionTitle, { color: theme.text }]}>Buat Materi Baru</Text>
                <Text style={[styles.addOptionDesc, { color: theme.textMuted }]}>
                  Mulai dari awal dengan template kosong
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.addOption, { backgroundColor: theme.card }]}
              onPress={() => Alert.alert('Info', 'Fitur duplikasi akan tersedia segera.')}
            >
              <View style={[styles.addOptionIcon, { backgroundColor: Colors.blueLight }]}>
                <Ionicons name="copy-outline" size={24} color={Colors.blue} />
              </View>
              <View style={styles.addOptionContent}>
                <Text style={[styles.addOptionTitle, { color: theme.text }]}>Duplikasi Materi</Text>
                <Text style={[styles.addOptionDesc, { color: theme.textMuted }]}>
                  Salin dari materi yang sudah ada
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.addOption, { backgroundColor: theme.card }]}
              onPress={() => Alert.alert('Info', 'Fitur import akan tersedia segera.')}
            >
              <View style={[styles.addOptionIcon, { backgroundColor: Colors.amberLight }]}>
                <Ionicons name="cloud-upload-outline" size={24} color={Colors.amber} />
              </View>
              <View style={styles.addOptionContent}>
                <Text style={[styles.addOptionTitle, { color: theme.text }]}>Import Materi</Text>
                <Text style={[styles.addOptionDesc, { color: theme.textMuted }]}>
                  Upload file materi dari perangkat
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Material Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Buat Materi Baru</Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowCreateModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>Judul Materi *</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Masukkan judul materi..."
                placeholderTextColor={theme.textMuted}
                value={newMaterial.title}
                onChangeText={(text) => setNewMaterial(prev => ({ ...prev, title: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>Kategori *</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="e.g. Kehamilan, Persalinan, Nifas..."
                placeholderTextColor={theme.textMuted}
                value={newMaterial.category}
                onChangeText={(text) => setNewMaterial(prev => ({ ...prev, category: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>Deskripsi</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Deskripsi singkat tentang materi ini..."
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={newMaterial.description}
                onChangeText={(text) => setNewMaterial(prev => ({ ...prev, description: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>Estimasi Durasi</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="e.g. 2 jam, 3 jam..."
                placeholderTextColor={theme.textMuted}
                value={newMaterial.estimatedDuration}
                onChangeText={(text) => setNewMaterial(prev => ({ ...prev, estimatedDuration: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>Jumlah Pelajaran</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="1"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                value={newMaterial.totalLessons.toString()}
                onChangeText={(text) => setNewMaterial(prev => ({ ...prev, totalLessons: parseInt(text) || 1 }))}
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity 
                style={[styles.formButton, styles.formButtonSecondary, { backgroundColor: theme.surface }]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={[styles.formButtonText, { color: theme.text }]}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.formButton, styles.formButtonPrimary]}
                onPress={handleCreateMaterial}
              >
                <Text style={styles.formButtonText}>Buat Materi</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.white,
  },

  // Filter Section
  filterSection: { paddingVertical: 16, borderBottomWidth: 1 },
  filterTabs: { paddingHorizontal: 20, gap: 12 },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  filterTabText: { fontSize: 14, fontWeight: '600' },
  filterTabBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  filterTabBadgeText: { fontSize: 10, fontWeight: '700' },

  // Stats Section
  statsSection: { paddingHorizontal: 20, paddingVertical: 20 },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 10, textAlign: 'center' },
  // Section Styles
  section: { paddingHorizontal: 20, paddingVertical: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4 },
  sortBtnText: { fontSize: 12, fontWeight: '500' },

  // Module Card Styles
  moduleCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  moduleCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  moduleCardLeft: { flex: 1, flexDirection: 'row', gap: 12 },
  moduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleInfo: { flex: 1 },
  moduleTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  categoryText: { fontSize: 10, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 9, fontWeight: '600' },
  moduleTitle: { fontSize: 14, fontWeight: '600', marginBottom: 6, lineHeight: 18 },
  moduleMetaRow: { flexDirection: 'row', gap: 12 },
  moduleMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  moduleMetaText: { fontSize: 11 },
  moreBtn: { padding: 4 },

  // Module Actions
  moduleActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionBtnText: { fontSize: 11, fontWeight: '600' },

  bottomPad: { height: 20 },

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
  modalContent: { padding: 20, gap: 12 },
  addOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  addOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addOptionContent: { flex: 1 },
  addOptionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  addOptionDesc: { fontSize: 13, lineHeight: 18 },

  // Loading and Empty States
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 12, fontSize: 14 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyButton: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  emptyButtonText: { color: Colors.white, fontSize: 14, fontWeight: '600' },

  // Form Styles
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  formInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  formTextArea: { height: 80, paddingTop: 12 },
  formActions: { flexDirection: 'row', gap: 12, marginTop: 24, paddingBottom: 20 },
  formButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  formButtonPrimary: { backgroundColor: Colors.primary },
  formButtonSecondary: { borderWidth: 1, borderColor: Colors.gray500 },
  formButtonText: { fontSize: 14, fontWeight: '600', color: Colors.white },

  // Module Description
  moduleDescription: { fontSize: 12, marginBottom: 6, lineHeight: 16 },
});
