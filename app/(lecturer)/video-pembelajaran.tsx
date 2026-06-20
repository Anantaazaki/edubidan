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
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { LecturerDatabase, Video, Material } from '../../src/utils/lecturerDatabase';

export default function VideoPembelajaranScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateVideoModal, setShowCreateVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  
  // Form state for creating new video
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    materialId: '',
    url: '',
    thumbnailUrl: '',
    duration: '',
  });

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, searchQuery, selectedFilter]);

  const initializeData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadVideos(),
        loadMaterials(),
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      Alert.alert('Error', 'Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async () => {
    try {
      const videosData = await LecturerDatabase.getAllVideos();
      setVideos(videosData);
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  };

  const loadMaterials = async () => {
    try {
      const materialsData = await LecturerDatabase.getAllMaterials();
      setMaterials(materialsData);
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  };

  const filterVideos = () => {
    let filtered = videos;

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(video => video.status === selectedFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(query) ||
        video.description.toLowerCase().includes(query)
      );
    }

    setFilteredVideos(filtered);
  };

  const getFilterCounts = () => {
    return {
      all: videos.length,
      published: videos.filter(v => v.status === 'published').length,
      draft: videos.filter(v => v.status === 'draft').length,
      processing: videos.filter(v => v.status === 'processing').length,
    };
  };

  const handleCreateVideo = async () => {
    try {
      if (!newVideo.title.trim()) {
        Alert.alert('Error', 'Judul video harus diisi.');
        return;
      }

      if (!newVideo.materialId) {
        Alert.alert('Error', 'Pilih materi untuk video ini.');
        return;
      }

      if (!newVideo.url.trim()) {
        Alert.alert('Error', 'URL video harus diisi.');
        return;
      }

      const result = await LecturerDatabase.createVideo({
        title: newVideo.title,
        description: newVideo.description || 'Video pembelajaran.',
        materialId: newVideo.materialId,
        url: newVideo.url,
        thumbnailUrl: newVideo.thumbnailUrl,
        duration: newVideo.duration || '0:00',
        views: 0,
        status: 'draft',
        createdBy: require('../../src/config/firebase').auth.currentUser?.uid || 'lecturer1', // TODO: Get from auth context
      });

      if (result.success) {
        Alert.alert('Sukses', result.message);
        setShowCreateVideoModal(false);
        setShowUploadModal(false);
        setNewVideo({
          title: '',
          description: '',
          materialId: '',
          url: '',
          thumbnailUrl: '',
          duration: '',
        });
        await loadVideos();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error creating video:', error);
      Alert.alert('Error', 'Gagal menambahkan video. Silakan coba lagi.');
    }
  };

  const handleEditVideo = (videoId: string) => {
    Alert.alert('Info', 'Fitur edit video akan tersedia segera.');
  };

  const handleDeleteVideo = (video: Video) => {
    Alert.alert(
      'Konfirmasi Hapus',
      `Apakah Anda yakin ingin menghapus video "${video.title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await LecturerDatabase.deleteVideo(video.id);
              if (result.success) {
                Alert.alert('Sukses', result.message);
                await loadVideos();
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              console.error('Error deleting video:', error);
              Alert.alert('Error', 'Gagal menghapus video.');
            }
          },
        },
      ]
    );
  };

  const handlePublishVideo = async (video: Video) => {
    try {
      const newStatus = video.status === 'published' ? 'draft' : 'published';
      const result = await LecturerDatabase.updateVideo(video.id, {
        status: newStatus,
      });
      
      if (result.success) {
        Alert.alert('Sukses', result.message);
        await loadVideos();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error updating video:', error);
      Alert.alert('Error', 'Gagal mengubah status video.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return Colors.primary;
      case 'draft': return Colors.amber;
      case 'processing': return Colors.blue;
      default: return Colors.gray500;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Dipublikasi';
      case 'draft': return 'Draft';
      case 'processing': return 'Diproses';
      default: return 'Unknown';
    }
  };

  const getMaterialTitle = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    return material ? material.title : 'Material tidak ditemukan';
  };

  const filters = [
    { id: 'all', label: 'Semua', count: getFilterCounts().all },
    { id: 'published', label: 'Dipublikasi', count: getFilterCounts().published },
    { id: 'draft', label: 'Draft', count: getFilterCounts().draft },
    { id: 'processing', label: 'Diproses', count: getFilterCounts().processing },
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
            <Text style={styles.headerTitle}>Video Pembelajaran</Text>
            <Text style={styles.headerSubtitle}>
              Kelola dan pantau semua video pembelajaran
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
              style={styles.uploadBtn}
              onPress={() => setShowUploadModal(true)}
            >
              <Ionicons name="cloud-upload" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color="rgba(255,255,255,0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari video pembelajaran..."
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
                <Ionicons name="play-circle" size={18} color={Colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{videos.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Video</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.blueLight }]}>
                <Ionicons name="eye" size={18} color={Colors.blue} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {videos.reduce((sum, v) => sum + v.views, 0)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Views</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.amberLight }]}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.amber} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{getFilterCounts().published}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Dipublikasi</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.roseLight }]}>
                <Ionicons name="create" size={18} color={Colors.rose} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{getFilterCounts().draft}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]}>Draft</Text>
            </View>
          </View>
        </View>

        {/* ── Video List ── */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Video ({filteredVideos.length})
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
              <Text style={[styles.loadingText, { color: theme.textMuted }]}>Memuat video...</Text>
            </View>
          ) : filteredVideos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="play-circle-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {searchQuery ? 'Tidak ada video ditemukan' : 'Belum ada video'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                {searchQuery ? 'Coba ubah kata kunci pencarian' : 'Upload video pembelajaran pertama Anda'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => setShowUploadModal(true)}
                >
                  <Text style={styles.emptyButtonText}>Upload Video</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredVideos.map((video) => (
              <TouchableOpacity
                key={video.id}
                style={[styles.videoCard, { backgroundColor: theme.card }]}
                onPress={() => setSelectedVideo(video)}
              >
                <View style={styles.videoThumbnail}>
                  <View style={styles.thumbnailPlaceholder}>
                    <Ionicons name="play" size={32} color={Colors.white} />
                  </View>
                  <View style={styles.videoDuration}>
                    <Text style={styles.videoDurationText}>{video.duration}</Text>
                  </View>
                  <View style={[styles.videoStatus, { backgroundColor: getStatusColor(video.status) }]}>
                    <Text style={styles.videoStatusText}>{getStatusText(video.status)}</Text>
                  </View>
                </View>

                <View style={styles.videoInfo}>
                  <View style={styles.videoHeader}>
                    <Text style={[styles.videoTitle, { color: theme.text }]} numberOfLines={2}>
                      {video.title}
                    </Text>
                    <TouchableOpacity 
                      style={styles.videoMoreBtn}
                      onPress={() => Alert.alert('Info', 'Menu lebih lanjut akan tersedia segera.')}
                    >
                      <Ionicons name="ellipsis-vertical" size={16} color={theme.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.videoModule, { color: theme.textMuted }]} numberOfLines={1}>
                    {getMaterialTitle(video.materialId)}
                  </Text>

                  <Text style={[styles.videoDescription, { color: theme.textMuted }]} numberOfLines={2}>
                    {video.description}
                  </Text>

                  <View style={styles.videoMeta}>
                    <View style={styles.videoMetaItem}>
                      <Ionicons name="eye-outline" size={12} color={theme.textMuted} />
                      <Text style={[styles.videoMetaText, { color: theme.textMuted }]}>
                        {video.views} tayangan
                      </Text>
                    </View>
                    <View style={styles.videoMetaItem}>
                      <Ionicons name="time-outline" size={12} color={theme.textMuted} />
                      <Text style={[styles.videoMetaText, { color: theme.textMuted }]}>
                        {new Date(video.createdAt).toLocaleDateString('id-ID')}
                      </Text>
                    </View>
                    <View style={styles.videoMetaItem}>
                      <Ionicons name="link-outline" size={12} color={theme.textMuted} />
                      <Text style={[styles.videoMetaText, { color: theme.textMuted }]} numberOfLines={1}>
                        {video.url.length > 30 ? video.url.substring(0, 30) + '...' : video.url}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.videoActions}>
                    <TouchableOpacity 
                      style={[styles.videoActionBtn, { backgroundColor: theme.surface }]}
                      onPress={() => handleEditVideo(video.id)}
                    >
                      <Ionicons name="create-outline" size={14} color={Colors.primary} />
                      <Text style={[styles.videoActionText, { color: Colors.primary }]}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.videoActionBtn, { backgroundColor: theme.surface }]}
                      onPress={() => handlePublishVideo(video)}
                    >
                      <Ionicons 
                        name={video.status === 'published' ? 'eye-off-outline' : 'eye-outline'} 
                        size={14} 
                        color={Colors.blue} 
                      />
                      <Text style={[styles.videoActionText, { color: Colors.blue }]}>
                        {video.status === 'published' ? 'Sembunyikan' : 'Publikasi'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.videoActionBtn, { backgroundColor: theme.surface }]}
                      onPress={() => handleDeleteVideo(video)}
                    >
                      <Ionicons name="trash-outline" size={14} color={Colors.rose} />
                      <Text style={[styles.videoActionText, { color: Colors.rose }]}>Hapus</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
      {/* Upload Video Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Upload Video Baru</Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowUploadModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={[styles.uploadArea, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="cloud-upload-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.uploadAreaTitle, { color: theme.text }]}>
                Pilih atau Drop Video
              </Text>
              <Text style={[styles.uploadAreaSubtitle, { color: theme.textMuted }]}>
                Format: MP4, MOV, AVI • Maksimal 500MB
              </Text>
              <TouchableOpacity 
                style={styles.selectBtn}
                onPress={() => Alert.alert('Info', 'Fitur upload file akan tersedia segera.')}
              >
                <Text style={styles.selectBtnText}>Pilih File</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.uploadOption, { backgroundColor: theme.card }]}
              onPress={() => Alert.alert('Info', 'Fitur rekam video akan tersedia segera.')}
            >
              <View style={[styles.uploadOptionIcon, { backgroundColor: Colors.blueLight }]}>
                <Ionicons name="videocam-outline" size={24} color={Colors.blue} />
              </View>
              <View style={styles.uploadOptionContent}>
                <Text style={[styles.uploadOptionTitle, { color: theme.text }]}>Rekam Video Baru</Text>
                <Text style={[styles.uploadOptionDesc, { color: theme.textMuted }]}>
                  Gunakan kamera untuk merekam langsung
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.uploadOption, { backgroundColor: theme.card }]}
              onPress={() => {
                setShowUploadModal(false);
                setShowCreateVideoModal(true);
              }}
            >
              <View style={[styles.uploadOptionIcon, { backgroundColor: Colors.amberLight }]}>
                <Ionicons name="link-outline" size={24} color={Colors.amber} />
              </View>
              <View style={styles.uploadOptionContent}>
                <Text style={[styles.uploadOptionTitle, { color: theme.text }]}>Link Video</Text>
                <Text style={[styles.uploadOptionDesc, { color: theme.textMuted }]}>
                  Embed video dari YouTube atau platform lain
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Video Modal */}
      <Modal
        visible={showCreateVideoModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateVideoModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Tambah Video Link</Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowCreateVideoModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>Judul Video *</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Masukkan judul video..."
                placeholderTextColor={theme.textMuted}
                value={newVideo.title}
                onChangeText={(text) => setNewVideo(prev => ({ ...prev, title: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>Pilih Materi *</Text>
              <TouchableOpacity
                style={[styles.formInput, styles.formPicker, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => {
                  if (materials.length === 0) {
                    Alert.alert('Info', 'Belum ada materi. Buat materi terlebih dahulu.');
                    return;
                  }
                  
                  Alert.alert(
                    'Pilih Materi',
                    'Pilih materi untuk video ini:',
                    materials.map(material => ({
                      text: material.title,
                      onPress: () => setNewVideo(prev => ({ ...prev, materialId: material.id }))
                    })).concat([{ text: 'Batal', onPress: () => {} }])
                  );
                }}
              >
                <Text style={[styles.formPickerText, { color: newVideo.materialId ? theme.text : theme.textMuted }]}>
                  {newVideo.materialId ? getMaterialTitle(newVideo.materialId) : 'Pilih materi...'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>URL Video *</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="https://youtu.be/... atau https://..."
                placeholderTextColor={theme.textMuted}
                value={newVideo.url}
                onChangeText={(text) => setNewVideo(prev => ({ ...prev, url: text }))}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>Deskripsi</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Deskripsi video pembelajaran..."
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={newVideo.description}
                onChangeText={(text) => setNewVideo(prev => ({ ...prev, description: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>Durasi</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="e.g. 15:30, 1:45:20"
                placeholderTextColor={theme.textMuted}
                value={newVideo.duration}
                onChangeText={(text) => setNewVideo(prev => ({ ...prev, duration: text }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.text }]}>URL Thumbnail (Opsional)</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="https://... (gambar thumbnail)"
                placeholderTextColor={theme.textMuted}
                value={newVideo.thumbnailUrl}
                onChangeText={(text) => setNewVideo(prev => ({ ...prev, thumbnailUrl: text }))}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity 
                style={[styles.formButton, styles.formButtonSecondary, { backgroundColor: theme.surface }]}
                onPress={() => setShowCreateVideoModal(false)}
              >
                <Text style={[styles.formButtonText, { color: theme.text }]}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.formButton, styles.formButtonPrimary]}
                onPress={handleCreateVideo}
              >
                <Text style={styles.formButtonText}>Tambah Video</Text>
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
  uploadBtn: {
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

  // Video Card Styles
  videoCard: {
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  videoThumbnail: {
    height: 180,
    backgroundColor: Colors.gray500,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.gray500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoDurationText: { fontSize: 11, color: Colors.white, fontWeight: '600' },
  videoStatus: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoStatusText: { fontSize: 10, color: Colors.white, fontWeight: '700' },

  // Video Info
  videoInfo: { padding: 16 },
  videoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  videoTitle: { flex: 1, fontSize: 16, fontWeight: '600', lineHeight: 20 },
  videoMoreBtn: { padding: 4, marginLeft: 8 },
  videoModule: { fontSize: 12, marginBottom: 6 },
  videoDescription: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  videoMeta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  videoMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  videoMetaText: { fontSize: 11 },

  // Video Actions
  videoActions: { flexDirection: 'row', gap: 8 },
  videoActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  videoActionText: { fontSize: 10, fontWeight: '600' },

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
  modalContent: { padding: 20, gap: 16 },
  
  uploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  uploadAreaTitle: { fontSize: 18, fontWeight: '600', marginTop: 12, marginBottom: 4 },
  uploadAreaSubtitle: { fontSize: 13, textAlign: 'center', marginBottom: 16 },
  selectBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectBtnText: { color: Colors.white, fontSize: 14, fontWeight: '600' },
  
  uploadOption: {
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
  uploadOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadOptionContent: { flex: 1 },
  uploadOptionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  uploadOptionDesc: { fontSize: 13, lineHeight: 18 },

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
  formPicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  formPickerText: { fontSize: 14 },
  formActions: { flexDirection: 'row', gap: 12, marginTop: 24, paddingBottom: 20 },
  formButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  formButtonPrimary: { backgroundColor: Colors.primary },
  formButtonSecondary: { borderWidth: 1, borderColor: Colors.gray500 },
  formButtonText: { fontSize: 14, fontWeight: '600', color: Colors.white },
});
