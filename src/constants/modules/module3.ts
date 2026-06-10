import { Module } from '../../types';

export const MODULE_3: Module = {
  id: '3',
  title: 'Asuhan Masa Nifas',
  category: 'Nifas',
  color: '#F6AD55',
  progress: 0,
  videos: 12,
  duration: '3 jam 15 menit',
  difficulty: 'intermediate',
  introVideoId: 'nifas_intro',
  description: 'Modul ini membahas asuhan kebidanan pada masa nifas (post partum) dari hari pertama hingga 6 minggu setelah persalinan.',
  objectives: [
    'Memahami perubahan fisiologis masa nifas',
    'Menguasai teknik pemeriksaan post partum',
    'Mampu memberikan edukasi perawatan nifas',
    'Mengenali komplikasi masa nifas',
  ],
  learningOutcomes: [
    'Mahasiswa mampu melakukan asuhan nifas sesuai standar',
    'Mahasiswa dapat mendeteksi komplikasi masa nifas',
    'Mahasiswa mampu memberikan edukasi laktasi',
  ],
  chapters: [
    {
      id: 'ch3-1', title: 'Fisiologi Masa Nifas', description: 'Perubahan tubuh setelah persalinan', order: 1,
      lessons: [
        { id: '3-1', title: 'Perubahan Fisiologis Nifas', duration: '10:20', videoId: 'M7lc1UVf-VE', description: 'Involusi uterus dan perubahan tubuh', order: 1, isCompleted: false },
        { id: '3-2', title: 'Lochea dan Involusi', duration: '9:15', videoId: 'D3qVhy3LvdY', description: 'Jenis dan karakteristik lochea', order: 2, isCompleted: false },
        { id: '3-3', title: 'Pemulihan Perineum', duration: '8:30', videoId: 'oDtprarpHwg', description: 'Perawatan luka perineum', order: 3, isCompleted: false },
      ],
    },
    {
      id: 'ch3-2', title: 'Pemeriksaan Nifas', description: 'Teknik pemeriksaan ibu post partum', order: 2,
      lessons: [
        { id: '3-4', title: 'Kunjungan Nifas KF1', duration: '11:40', videoId: 'M7lc1UVf-VE', description: 'Pemeriksaan 6-8 jam post partum', order: 4, isCompleted: false },
        { id: '3-5', title: 'Kunjungan Nifas KF2', duration: '10:25', videoId: 'D3qVhy3LvdY', description: 'Pemeriksaan 6 hari post partum', order: 5, isCompleted: false },
        { id: '3-6', title: 'Kunjungan Nifas KF3', duration: '9:50', videoId: 'oDtprarpHwg', description: 'Pemeriksaan 2 minggu post partum', order: 6, isCompleted: false },
        { id: '3-7', title: 'Kunjungan Nifas KF4', duration: '8:35', videoId: 'M7lc1UVf-VE', description: 'Pemeriksaan 6 minggu post partum', order: 7, isCompleted: false },
      ],
    },
    {
      id: 'ch3-3', title: 'Edukasi dan Komplikasi', description: 'Edukasi perawatan dan deteksi komplikasi', order: 3,
      lessons: [
        { id: '3-8', title: 'Edukasi Perawatan Nifas', duration: '12:10', videoId: 'D3qVhy3LvdY', description: 'Edukasi kebersihan dan nutrisi', order: 8, isCompleted: false },
        { id: '3-9', title: 'Senam Nifas', duration: '14:20', videoId: 'oDtprarpHwg', description: 'Latihan pemulihan post partum', order: 9, isCompleted: false },
        { id: '3-10', title: 'Infeksi Masa Nifas', duration: '11:30', videoId: 'M7lc1UVf-VE', description: 'Mengenali tanda infeksi nifas', order: 10, isCompleted: false },
        { id: '3-11', title: 'Baby Blues dan Depresi Post Partum', duration: '13:45', videoId: 'D3qVhy3LvdY', description: 'Gangguan psikologis post partum', order: 11, isCompleted: false },
        { id: '3-12', title: 'Dokumentasi Nifas', duration: '7:15', videoId: 'oDtprarpHwg', description: 'Pencatatan asuhan nifas', order: 12, isCompleted: false },
      ],
    },
  ],
  steps: [
    { id: 'step3-1', title: 'Pemeriksaan Awal Post Partum', detail: 'Periksa kondisi umum, tanda vital, dan perdarahan.', order: 1, isImportant: true, tips: ['Periksa dalam 1 jam pertama', 'Pantau kontraksi uterus'] },
    { id: 'step3-2', title: 'Pemeriksaan Uterus', detail: 'Nilai involusi dan konsistensi uterus.', order: 2, isImportant: true, tips: ['Fundus harus keras', 'Ukur TFU setiap hari'] },
    { id: 'step3-3', title: 'Penilaian Lochea', detail: 'Nilai warna, jumlah, dan bau lochea.', order: 3, isImportant: true, tips: ['Lochea berbau tidak normal adalah tanda infeksi'] },
    { id: 'step3-4', title: 'Perawatan Luka Perineum', detail: 'Bersihkan dan nilai kondisi jahitan perineum.', order: 4, isImportant: true, tips: ['Bersihkan dari depan ke belakang'] },
    { id: 'step3-5', title: 'Edukasi dan Dokumentasi', detail: 'Berikan edukasi ASI dan catat semua hasil.', order: 5, isImportant: false, tips: ['Dukung pemberian ASI eksklusif'] },
  ],
  tools: [
    { id: 'tool3-1', name: 'Tensimeter', description: 'Untuk memantau tekanan darah', category: 'primary' },
    { id: 'tool3-2', name: 'Thermometer', description: 'Untuk memantau suhu tubuh', category: 'primary' },
    { id: 'tool3-3', name: 'Sarung Tangan', description: 'Untuk pemeriksaan perineum', category: 'primary' },
    { id: 'tool3-4', name: 'Lampu Sorot', description: 'Untuk inspeksi perineum', category: 'secondary' },
  ],
};