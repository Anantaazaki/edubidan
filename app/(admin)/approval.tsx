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
import { AdminDatabase, ContentItem } from '../../src/utils/adminDatabase';

export default function ApprovalScreen() {
  const router = useRouter();
  const { isDark, theme, toggleTheme } = useTheme();
  
  // State
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingContents, setPendingContents] = useState<ContentItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  useEffect(() => {
    loadPendingContent();
  }, []);

  const loadPendingContent = async () => {
    try {
      setLoading(true);
      await AdminDatabase.initializeDatabase();
      
      const pendingData = await AdminDatabase.getPendingContent();
      setPendingContents(pendingData);
    } catch (error) {
      console.error('Error loading pending content:', error);
      Alert.alert('Error', 'Gagal memuat konten pending');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredContents = (): ContentItem[] => {
    if (!searchQuery.trim()) return pendingContents;
    
    const query = searchQuery.toLowerCase();
    return pendingContents.filter(content =>
      content.title.toLowerCase().includes(query) ||
      content.description.toLowerCase().includes(query) ||
      content.category.toLowerCase().includes(query) ||
      content.creatorName.toLowerCase().includes(query)
    );
  };

  const handleApproveContent = async (content: ContentItem) => {
    Alert.alert(
      'Setujui Konten',
      `Apakah Anda yakin ingin menyetujui konten "${content.title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Setujui',
          onPress: async () => {
            try {
              const result = await AdminDatabase.approveContent(content.id, 'admin1');
              if (result.success) {
                Alert.alert('Sukses', 'Konten berhasil disetujui');
                loadPendingContent(); // Refresh list
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Gagal menyetujui konten');
            }
          },
        },
      ]
    );
  };

  const handleRejectContent = async () => {
    if (!selectedContent) return;
    
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Alasan penolakan harus diisi');
      return;
    }

    try {
      const result = await AdminDatabase.rejectContent(selectedContent.id, 'admin1', rejectionReason);
      if (result.success) {
        Alert.alert('Sukses', 'Konten berhasil ditolak');
        setShowRejectionModal(false);
        setRejectionReason('');
        setSelectedContent(null);
        loadPendingContent(); // Refresh list
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal menolak konten');
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

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 24) return `${hours} jam yang lalu`;
    return `${days} hari yang lalu`;
  };

  const renderPendingCard = ({ item: content }: { item: ContentItem }) => (
    <View style={[styles.pendingCard, { backgroundColor: theme.card }]}>
      <View style={styles.pendingCardHeader}>
        <View style={styles.pendingInfo}>
          <View style={[styles.pendingTypeIcon, { backgroundColor: getTypeColor(content.type) + '20' }]}>
            <Ionicons name={getTypeIcon(content.type)} size={24} color={getTypeColor(content.type)} />
          </View>
          <View style={styles.pendingDetails}>
            <Text style={[styles.pendingTitle, { color: theme.text }]} numberOfLines={2}>
              {content.title}
            </Text>
            <Text style={[styles.pendingDescription, { color: theme.textMuted }]} numberOfLines={3}>
              {content.description}
            </Text>
            <View style={styles.pendingMeta}>
              <Text style={[styles.pendingMetaText, { color: theme.textMuted }]}>
                Oleh: {content.creatorName}
              </Text>
              <Text style={[styles.pendingMetaText, { color: theme.textMuted }]}>
                {content.category} • {formatTimeAgo(content.createdAt)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.pendingStatus}>
          <View style={[styles.statusBadge, { backgroundColor: Colors.amber + '20' }]}>
            <Text style={[styles.statusText, { color: Colors.amber }]}>
              PENDING
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.pendingActions}>
        <TouchableOpacity
          style={[styles.previewBtn, { backgroundColor: theme.surface }]}
          onPress={() => {
            setSelectedContent(content);
            setShowApprovalModal(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="eye-outline" size={16} color={Colors.blue} />
          <Text style={[styles.previewBtnText, { color: Colors.blue }]}>Preview</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.rejectBtn, { backgroundColor: Colors.roseLight }]}
          onPress={() => {
            setSelectedContent(content);
            setShowRejectionModal(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="close-circle" size={16} color={Colors.rose} />
          <Text style={[styles.rejectBtnText, { color: Colors.rose }]}>Tolak</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.approveBtn, { backgroundColor: Colors.greenLight }]}
          onPress={() => handleApproveContent(content)}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={16} color={Colors.green} />
          <Text style={[styles.approveBtnText, { color: Colors.green }]}>Setujui</Text>
        </TouchableOpacity>
      </View>
    </View>
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
            <Text style={styles.headerTitle}>Persetujuan Konten</Text>
            <Text style={styles.headerSubtitle}>
              Review dan setujui konten dari dosen
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
            <View style={styles.pendingBadgeWrapper}>
              <Ionicons name="time" size={20} color={Colors.white} />
              {pendingContents.length > 0 && (
                <View style={styles.pendingCountBadge}>
                  <Text style={styles.pendingCountText}>
                    {pendingContents.length > 9 ? '9+' : pendingContents.length}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color="rgba(255,255,255,0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari konten pending..."
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

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{pendingContents.length}</Text>
            <Text style={styles.statLabel}>Menunggu Review</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {pendingContents.filter(c => c.type === 'material').length}
            </Text>
            <Text style={styles.statLabel}>Materi</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {pendingContents.filter(c => c.type === 'video').length}
            </Text>
            <Text style={styles.statLabel}>Video</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {pendingContents.filter(c => c.type === 'quiz').length}
            </Text>
            <Text style={styles.statLabel}>Quiz</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Pending Content List ── */}
      <FlatList
        data={getFilteredContents()}
        keyExtractor={(item) => item.id}
        renderItem={renderPendingCard}
        contentContainerStyle={styles.pendingList}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadPendingContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {searchQuery ? 'Tidak ada hasil' : 'Tidak ada konten pending'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              {searchQuery ? 'Coba kata kunci lain' : 'Semua konten sudah disetujui'}
            </Text>
          </View>
        }
      />
      {/* Content Preview Modal */}
      <Modal
        visible={showApprovalModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowApprovalModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Preview Konten
            </Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowApprovalModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          
          {selectedContent && (
            <ScrollView style={styles.modalContent}>
              <View style={[styles.previewCard, { backgroundColor: theme.surface }]}>
                <View style={styles.previewHeader}>
                  <View style={[styles.previewTypeIcon, { backgroundColor: getTypeColor(selectedContent.type) + '20' }]}>
                    <Ionicons 
                      name={getTypeIcon(selectedContent.type)} 
                      size={32} 
                      color={getTypeColor(selectedContent.type)} 
                    />
                  </View>
                  <View style={styles.previewInfo}>
                    <Text style={[styles.previewTitle, { color: theme.text }]}>
                      {selectedContent.title}
                    </Text>
                    <Text style={[styles.previewCategory, { color: theme.textMuted }]}>
                      {selectedContent.category}
                    </Text>
                    <Text style={[styles.previewCreator, { color: theme.textMuted }]}>
                      Oleh: {selectedContent.creatorName}
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.previewDescription, { color: theme.text }]}>
                  {selectedContent.description}
                </Text>
                
                <View style={styles.previewMeta}>
                  <View style={styles.previewMetaItem}>
                    <Text style={[styles.previewMetaLabel, { color: theme.textMuted }]}>Dibuat</Text>
                    <Text style={[styles.previewMetaValue, { color: theme.text }]}>
                      {formatTimeAgo(selectedContent.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.previewMetaItem}>
                    <Text style={[styles.previewMetaLabel, { color: theme.textMuted }]}>Tipe</Text>
                    <Text style={[styles.previewMetaValue, { color: theme.text }]}>
                      {selectedContent.type.charAt(0).toUpperCase() + selectedContent.type.slice(1)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.previewActions}>
                  <TouchableOpacity
                    style={[styles.previewRejectBtn, { backgroundColor: Colors.roseLight }]}
                    onPress={() => {
                      setShowApprovalModal(false);
                      setTimeout(() => setShowRejectionModal(true), 300);
                    }}
                  >
                    <Ionicons name="close-circle" size={18} color={Colors.rose} />
                    <Text style={[styles.previewRejectBtnText, { color: Colors.rose }]}>Tolak</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.previewApproveBtn, { backgroundColor: Colors.greenLight }]}
                    onPress={() => {
                      setShowApprovalModal(false);
                      setTimeout(() => handleApproveContent(selectedContent), 300);
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
                    <Text style={[styles.previewApproveBtnText, { color: Colors.green }]}>Setujui</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        visible={showRejectionModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowRejectionModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Tolak Konten
            </Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => {
                setShowRejectionModal(false);
                setRejectionReason('');
              }}
            >
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={[styles.rejectionTitle, { color: theme.text }]}>
              Alasan Penolakan *
            </Text>
            <Text style={[styles.rejectionSubtitle, { color: theme.textMuted }]}>
              Berikan alasan mengapa konten ini ditolak
            </Text>
            
            <TextInput
              style={[styles.rejectionInput, { 
                backgroundColor: theme.surface, 
                color: theme.text, 
                borderColor: theme.border 
              }]}
              placeholder="Tuliskan alasan penolakan..."
              placeholderTextColor={theme.textMuted}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.rejectionActions}>
              <TouchableOpacity
                style={[styles.rejectionCancelBtn, { borderColor: theme.border }]}
                onPress={() => {
                  setShowRejectionModal(false);
                  setRejectionReason('');
                }}
              >
                <Text style={[styles.rejectionCancelBtnText, { color: theme.textMuted }]}>Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.rejectionSubmitBtn, { backgroundColor: Colors.rose }]}
                onPress={handleRejectContent}
              >
                <Text style={styles.rejectionSubmitBtnText}>Tolak Konten</Text>
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
  pendingBadgeWrapper: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingCountBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.amber,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  pendingCountText: { fontSize: 10, color: Colors.white, fontWeight: '700' },

  // Search Bar
  searchContainer: { marginTop: 8, marginBottom: 16 },
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

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800', color: Colors.white, marginBottom: 2 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  statDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Pending List
  pendingList: { padding: 20 },
  pendingCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  pendingCardHeader: { marginBottom: 16 },
  pendingInfo: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  pendingTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingDetails: { flex: 1 },
  pendingTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  pendingDescription: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  pendingMeta: { gap: 2 },
  pendingMetaText: { fontSize: 11 },
  pendingStatus: { alignItems: 'flex-end' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  // Pending Actions
  pendingActions: { flexDirection: 'row', gap: 8 },
  previewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.blue + '30',
  },
  previewBtnText: { fontSize: 12, fontWeight: '600' },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  rejectBtnText: { fontSize: 12, fontWeight: '600' },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  approveBtnText: { fontSize: 12, fontWeight: '600' },

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

  // Preview Card
  previewCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  previewHeader: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  previewTypeIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: { flex: 1 },
  previewTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  previewCategory: { fontSize: 13, marginBottom: 2 },
  previewCreator: { fontSize: 13 },
  previewDescription: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  previewMeta: { flexDirection: 'row', gap: 24, marginBottom: 20 },
  previewMetaItem: { alignItems: 'center' },
  previewMetaLabel: { fontSize: 11, marginBottom: 4 },
  previewMetaValue: { fontSize: 13, fontWeight: '600' },
  previewActions: { flexDirection: 'row', gap: 12 },
  previewRejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  previewRejectBtnText: { fontSize: 14, fontWeight: '700' },
  previewApproveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  previewApproveBtnText: { fontSize: 14, fontWeight: '700' },

  // Rejection Modal
  rejectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  rejectionSubtitle: { fontSize: 13, marginBottom: 16 },
  rejectionInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 20,
  },
  rejectionActions: { flexDirection: 'row', gap: 12 },
  rejectionCancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
  rejectionCancelBtnText: { fontSize: 14, fontWeight: '600' },
  rejectionSubmitBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  rejectionSubmitBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});