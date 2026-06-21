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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Colors } from '../../src/constants/colors';
import { LecturerDatabase } from '../../src/utils/lecturerDatabase';

type ContentItem = {
  id: string;
  title: string;
  description: string;
  type: 'material' | 'video' | 'quiz';
  category?: string;
  status: 'published' | 'draft' | 'archived' | 'processing' | 'closed';
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  [key: string]: any;
};

type ContentType = 'all' | 'material' | 'video' | 'quiz';

export default function ContentManagementScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  
  // State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ContentType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [contents, setContents] = useState<any[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [showContentModal, setShowContentModal] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      // Load real data from Firestore
      const [materials, videos, quizzes] = await Promise.all([
        LecturerDatabase.getAllMaterials(),
        LecturerDatabase.getAllVideos(),
        LecturerDatabase.getAllQuizzes(),
      ]);

      const allContent = [
        ...materials.map(m => ({ ...m, type: 'material' as const })),
        ...videos.map(v => ({ ...v, type: 'video' as const })),
        ...quizzes.map(q => ({ ...q, type: 'quiz' as const })),
      ];

      setContents(allContent);
    } catch (error) {
      console.error('Error loading content:', error);
      Alert.alert('Error', 'Gagal memuat data konten');
    } finally {
      setLoading(false);
    }
  };
  const getFilteredContent = (): ContentItem[] => {
    let filtered = contents;
    
    // Filter by type
    if (activeTab !== 'all') {
      filtered = filtered.filter(content => content.type === activeTab);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(content =>
        content.title.toLowerCase().includes(query) ||
        content.description.toLowerCase().includes(query) ||
        content.category.toLowerCase().includes(query) ||
        content.creatorName.toLowerCase().includes(query)
      );
    }
    
    return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  };

  const getContentCounts = () => {
    return {
      all: contents.length,
      material: contents.filter(c => c.type === 'material').length,
      video: contents.filter(c => c.type === 'video').length,
      quiz: contents.filter(c => c.type === 'quiz').length,
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return Colors.green;
      case 'draft': return Colors.amber;
      case 'pending': return Colors.blue;
      case 'rejected': return Colors.rose;
      default: return Colors.gray500;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Dipublikasi';
      case 'draft': return 'Draft';
      case 'pending': return 'Pending';
      case 'rejected': return 'Ditolak';
      default: return 'Unknown';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'material': return 'document-text-outline';
      case 'video': return 'play-circle-outline';
      case 'quiz': return 'help-circle-outline';
      default: return 'document-outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'material': return Colors.blue;
      case 'video': return Colors.rose;
      case 'quiz': return Colors.amber;
      default: return Colors.gray500;
    }
  };

  const formatDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hari ini';
    if (days === 1) return '1 hari yang lalu';
    if (days < 30) return `${days} hari yang lalu`;
    return `${Math.floor(days / 30)} bulan yang lalu`;
  };
  const handleTogglePublish = async (content: ContentItem) => {
    const newStatus = content.status === 'published' ? 'draft' : 'published';
    const action = newStatus === 'published' ? 'mempublikasi' : 'mengarsipkan';
    
    Alert.alert(
      'Konfirmasi',
      `Apakah Anda yakin ingin ${action} konten "${content.title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya',
          onPress: async () => {
            try {
              // In real app, this would update the content status
              const updatedContents = contents.map(c => 
                c.id === content.id ? { ...c, status: newStatus as ContentItem['status'], updatedAt: Date.now() } : c
              );
              setContents(updatedContents);
              
              Alert.alert('Sukses', `Konten berhasil ${newStatus === 'published' ? 'dipublikasi' : 'diarsipkan'}`);
            } catch (error) {
              Alert.alert('Error', `Gagal ${action} konten`);
            }
          },
        },
      ]
    );
  };

  const handleDeleteContent = async (content: ContentItem) => {
    Alert.alert(
      'Konfirmasi Hapus',
      `Apakah Anda yakin ingin menghapus konten "${content.title}"? Tindakan ini tidak dapat dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedContents = contents.filter(c => c.id !== content.id);
              setContents(updatedContents);
              Alert.alert('Sukses', 'Konten berhasil dihapus');
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus konten');
            }
          },
        },
      ]
    );
  };

  const renderContentCard = ({ item: content }: { item: ContentItem }) => (
    <TouchableOpacity
      style={[styles.contentCard, { backgroundColor: theme.card }]}
      onPress={() => {
        setSelectedContent(content);
        setShowContentModal(true);
      }}
      activeOpacity={0.8}
    >
      <View style={styles.contentCardHeader}>
        <View style={styles.contentInfo}>
          <View style={[styles.contentTypeIcon, { backgroundColor: getTypeColor(content.type) + '20' }]}>
            <Ionicons name={getTypeIcon(content.type)} size={20} color={getTypeColor(content.type)} />
          </View>
          <View style={styles.contentDetails}>
            <View style={styles.contentTitleRow}>
              <Text style={[styles.contentTitle, { color: theme.text }]} numberOfLines={2}>
                {content.title}
              </Text>
              <View style={[styles.contentStatus, { backgroundColor: getStatusColor(content.status) + '20' }]}>
                <Text style={[styles.contentStatusText, { color: getStatusColor(content.status) }]}>
                  {getStatusText(content.status)}
                </Text>
              </View>
            </View>
            <Text style={[styles.contentDescription, { color: theme.textMuted }]} numberOfLines={2}>
              {content.description}
            </Text>
            <View style={styles.contentMeta}>
              <Text style={[styles.contentMetaText, { color: theme.textMuted }]}>
                {content.creatorName} • {content.category}
              </Text>
              <Text style={[styles.contentMetaText, { color: theme.textMuted }]}>
                {formatDate(content.updatedAt)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.contentStats}>
        <View style={styles.contentStat}>
          <Ionicons name="eye-outline" size={14} color={theme.textMuted} />
          <Text style={[styles.contentStatText, { color: theme.textMuted }]}>
            {content.views}
          </Text>
        </View>
        <View style={styles.contentStat}>
          <Ionicons name="heart-outline" size={14} color={theme.textMuted} />
          <Text style={[styles.contentStatText, { color: theme.textMuted }]}>
            {content.likes}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.contentAction, { backgroundColor: content.status === 'published' ? Colors.amberLight : Colors.greenLight }]}
          onPress={() => handleTogglePublish(content)}
        >
          <Ionicons 
            name={content.status === 'published' ? 'pause' : 'play'} 
            size={12} 
            color={content.status === 'published' ? Colors.amber : Colors.green} 
          />
          <Text style={[styles.contentActionText, { color: content.status === 'published' ? Colors.amber : Colors.green }]}>
            {content.status === 'published' ? 'Arsip' : 'Publish'}
          </Text>
        </TouchableOpacity>
      </View>
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
            <Text style={styles.headerTitle}>Kelola Konten</Text>
            <Text style={styles.headerSubtitle}>
              Kelola materi, video, dan quiz pembelajaran
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
              style={styles.filterBtn}
              onPress={() => Alert.alert('Info', 'Fitur filter lanjutan akan segera tersedia')}
            >
              <Ionicons name="filter" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color="rgba(255,255,255,0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari konten..."
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
            { key: 'all', label: 'Semua', count: getContentCounts().all, icon: 'grid-outline' },
            { key: 'material', label: 'Materi', count: getContentCounts().material, icon: 'document-text-outline' },
            { key: 'video', label: 'Video', count: getContentCounts().video, icon: 'play-circle-outline' },
            { key: 'quiz', label: 'Quiz', count: getContentCounts().quiz, icon: 'help-circle-outline' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && { backgroundColor: Colors.primary },
                activeTab !== tab.key && { backgroundColor: theme.card }
              ]}
              onPress={() => setActiveTab(tab.key as ContentType)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={16} 
                color={activeTab === tab.key ? Colors.white : theme.text} 
              />
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
      {/* ── Content List ── */}
      <FlatList
        data={getFilteredContent()}
        keyExtractor={(item) => item.id}
        renderItem={renderContentCard}
        contentContainerStyle={styles.contentList}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons 
              name={activeTab === 'all' ? 'library-outline' : getTypeIcon(activeTab)} 
              size={64} 
              color={theme.textMuted} 
            />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {searchQuery ? 'Tidak ada hasil' : 'Belum ada konten'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              {searchQuery ? 'Coba kata kunci lain' : 'Konten akan muncul di sini'}
            </Text>
          </View>
        }
      />

      {/* Content Detail Modal */}
      <Modal
        visible={showContentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowContentModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Detail Konten
            </Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowContentModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          
          {selectedContent && (
            <ScrollView style={styles.modalContent}>
              <View style={[styles.contentDetailCard, { backgroundColor: theme.surface }]}>
                <View style={styles.contentDetailHeader}>
                  <View style={[styles.contentDetailIcon, { backgroundColor: getTypeColor(selectedContent.type) + '20' }]}>
                    <Ionicons 
                      name={getTypeIcon(selectedContent.type)} 
                      size={32} 
                      color={getTypeColor(selectedContent.type)} 
                    />
                  </View>
                  <View style={styles.contentDetailInfo}>
                    <Text style={[styles.contentDetailTitle, { color: theme.text }]}>
                      {selectedContent.title}
                    </Text>
                    <Text style={[styles.contentDetailDescription, { color: theme.textMuted }]}>
                      {selectedContent.description}
                    </Text>
                    <View style={[styles.contentDetailStatus, { backgroundColor: getStatusColor(selectedContent.status) + '20' }]}>
                      <Text style={[styles.contentDetailStatusText, { color: getStatusColor(selectedContent.status) }]}>
                        {getStatusText(selectedContent.status)}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.contentDetailMeta}>
                  <View style={styles.contentDetailMetaItem}>
                    <Text style={[styles.contentDetailMetaLabel, { color: theme.textMuted }]}>Dibuat oleh</Text>
                    <Text style={[styles.contentDetailMetaValue, { color: theme.text }]}>{selectedContent.creatorName}</Text>
                  </View>
                  <View style={styles.contentDetailMetaItem}>
                    <Text style={[styles.contentDetailMetaLabel, { color: theme.textMuted }]}>Kategori</Text>
                    <Text style={[styles.contentDetailMetaValue, { color: theme.text }]}>{selectedContent.category}</Text>
                  </View>
                  <View style={styles.contentDetailMetaItem}>
                    <Text style={[styles.contentDetailMetaLabel, { color: theme.textMuted }]}>Terakhir diperbarui</Text>
                    <Text style={[styles.contentDetailMetaValue, { color: theme.text }]}>{formatDate(selectedContent.updatedAt)}</Text>
                  </View>
                </View>

                <View style={styles.contentDetailStats}>
                  <View style={styles.contentDetailStatItem}>
                    <Ionicons name="eye" size={16} color={Colors.blue} />
                    <Text style={[styles.contentDetailStatValue, { color: Colors.blue }]}>{selectedContent.views}</Text>
                    <Text style={[styles.contentDetailStatLabel, { color: theme.textMuted }]}>Views</Text>
                  </View>
                  <View style={styles.contentDetailStatItem}>
                    <Ionicons name="heart" size={16} color={Colors.rose} />
                    <Text style={[styles.contentDetailStatValue, { color: Colors.rose }]}>{selectedContent.likes}</Text>
                    <Text style={[styles.contentDetailStatLabel, { color: theme.textMuted }]}>Likes</Text>
                  </View>
                </View>
                
                <View style={styles.contentDetailActions}>
                  <TouchableOpacity
                    style={[styles.detailActionBtn, { backgroundColor: selectedContent.status === 'published' ? Colors.amberLight : Colors.greenLight }]}
                    onPress={() => handleTogglePublish(selectedContent)}
                  >
                    <Ionicons 
                      name={selectedContent.status === 'published' ? "pause" : "play"} 
                      size={16} 
                      color={selectedContent.status === 'published' ? Colors.amber : Colors.green} 
                    />
                    <Text style={[styles.detailActionBtnText, { color: selectedContent.status === 'published' ? Colors.amber : Colors.green }]}>
                      {selectedContent.status === 'published' ? 'Arsipkan' : 'Publikasi'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.detailActionBtn, { backgroundColor: Colors.blueLight }]}
                    onPress={() => Alert.alert('Info', 'Fitur edit konten akan segera tersedia')}
                  >
                    <Ionicons name="create" size={16} color={Colors.blue} />
                    <Text style={[styles.detailActionBtnText, { color: Colors.blue }]}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.detailActionBtn, { backgroundColor: Colors.roseLight }]}
                    onPress={() => {
                      setShowContentModal(false);
                      setTimeout(() => handleDeleteContent(selectedContent), 300);
                    }}
                  >
                    <Ionicons name="trash" size={16} color={Colors.rose} />
                    <Text style={[styles.detailActionBtnText, { color: Colors.rose }]}>Hapus</Text>
                  </TouchableOpacity>
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
  filterBtn: {
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

  // Content List
  contentList: { padding: 20 },
  contentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  contentCardHeader: { marginBottom: 12 },
  contentInfo: { flexDirection: 'row', gap: 12 },
  contentTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentDetails: { flex: 1 },
  contentTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  contentTitle: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  contentStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  contentStatusText: { fontSize: 10, fontWeight: '700' },
  contentDescription: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  contentMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contentMetaText: { fontSize: 11 },
  // Content Stats
  contentStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  contentStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contentStatText: { fontSize: 12, fontWeight: '500' },
  contentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  contentActionText: { fontSize: 11, fontWeight: '600' },

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

  // Content Detail Modal
  contentDetailCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  contentDetailHeader: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  contentDetailIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentDetailInfo: { flex: 1 },
  contentDetailTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  contentDetailDescription: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  contentDetailStatus: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start' },
  contentDetailStatusText: { fontSize: 12, fontWeight: '700' },
  contentDetailMeta: { marginBottom: 20 },
  contentDetailMetaItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  contentDetailMetaLabel: { fontSize: 12 },
  contentDetailMetaValue: { fontSize: 12, fontWeight: '600' },
  contentDetailStats: { flexDirection: 'row', gap: 24, marginBottom: 20 },
  contentDetailStatItem: { alignItems: 'center', gap: 4 },
  contentDetailStatValue: { fontSize: 16, fontWeight: '700' },
  contentDetailStatLabel: { fontSize: 10 },
  contentDetailActions: { flexDirection: 'row', gap: 8 },
  detailActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  detailActionBtnText: { fontSize: 12, fontWeight: '600' },
});