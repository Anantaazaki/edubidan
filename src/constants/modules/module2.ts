import { Module } from '../../types';

export const MODULE_2: Module = {
  id: '2',
  title: 'Asuhan Persalinan Normal',
  category: 'Persalinan',
  color: '#4ECDC4',
  progress: 0.3,
  videos: 18,
  duration: '4 jam 30 menit',
  difficulty: 'intermediate',
  introVideoId: '8xz1Jbs972U',
  description: 'Modul ini menjelaskan penanganan persalinan normal dari kala I hingga kala IV secara komprehensif sesuai standar APN.',
  objectives: [
    'Memahami tahapan persalinan normal dan fisiologinya',
    'Menguasai teknik pertolongan persalinan sesuai standar APN',
    'Mampu memantau kemajuan persalinan dengan partograf',
    'Mengenali komplikasi persalinan dan penanganan awal',
  ],
  learningOutcomes: [
    'Mahasiswa mampu membantu persalinan normal dengan aman',
    'Mahasiswa dapat memantau kemajuan persalinan menggunakan partograf',
    'Mahasiswa mampu menangani komplikasi dasar persalinan',
  ],
  chapters: [
    {
      id: 'ch2-1', title: 'Tanda dan Persiapan Persalinan', description: 'Mengenali tanda-tanda persalinan', order: 1,
      lessons: [
        { id: '2-1', title: 'Tanda-tanda Persalinan', duration: '9:18', videoId: 'zpn46-MZXaU', description: 'Mengenali tanda awal persalinan', order: 1, isCompleted: false },
        { id: '2-2', title: 'Persiapan Persalinan', duration: '11:05', videoId: 'HsxGf5Wy0rQ', description: 'Persiapan alat dan ruangan', order: 2, isCompleted: false },
        { id: '2-3', title: 'Penilaian Awal Persalinan', duration: '10:30', videoId: 'zpn46-MZXaU', description: 'Pemeriksaan awal kondisi ibu', order: 3, isCompleted: false },
        { id: '2-4', title: 'Penggunaan Partograf', duration: '13:45', videoId: 'HsxGf5Wy0rQ', description: 'Cara mengisi partograf', order: 4, isCompleted: false },
      ],
    },
    {
      id: 'ch2-2', title: 'Kala I dan II Persalinan', description: 'Penanganan kala pembukaan dan pengeluaran janin', order: 2,
      lessons: [
        { id: '2-5', title: 'Kala I Fase Laten', duration: '12:20', videoId: 'zpn46-MZXaU', description: 'Penanganan fase laten', order: 5, isCompleted: false },
        { id: '2-6', title: 'Kala I Fase Aktif', duration: '14:15', videoId: 'HsxGf5Wy0rQ', description: 'Penanganan fase aktif', order: 6, isCompleted: false },
        { id: '2-7', title: 'Pemantauan Kemajuan', duration: '11:40', videoId: 'zpn46-MZXaU', description: 'Memantau pembukaan serviks', order: 7, isCompleted: false },
        { id: '2-8', title: 'Kala II Persalinan', duration: '15:30', videoId: 'HsxGf5Wy0rQ', description: 'Teknik pertolongan kelahiran', order: 8, isCompleted: false },
        { id: '2-9', title: 'Episiotomi dan Penjahitan', duration: '13:25', videoId: 'zpn46-MZXaU', description: 'Teknik episiotomi', order: 9, isCompleted: false },
      ],
    },
    {
      id: 'ch2-3', title: 'Kala III dan IV Persalinan', description: 'Manajemen plasenta dan post partum', order: 3,
      lessons: [
        { id: '2-10', title: 'Manajemen Aktif Kala III', duration: '16:20', videoId: 'HsxGf5Wy0rQ', description: 'Teknik manajemen aktif kala III', order: 10, isCompleted: false },
        { id: '2-11', title: 'Pemotongan Tali Pusat', duration: '8:45', videoId: 'zpn46-MZXaU', description: 'Teknik pemotongan tali pusat', order: 11, isCompleted: false },
        { id: '2-12', title: 'Pemeriksaan Plasenta', duration: '10:15', videoId: 'HsxGf5Wy0rQ', description: 'Memeriksa kelengkapan plasenta', order: 12, isCompleted: false },
        { id: '2-13', title: 'Kala IV - Pengawasan 2 Jam', duration: '12:50', videoId: 'zpn46-MZXaU', description: 'Pengawasan intensif post partum', order: 13, isCompleted: false },
        { id: '2-14', title: 'Inisiasi Menyusu Dini (IMD)', duration: '11:30', videoId: 'HsxGf5Wy0rQ', description: 'Pelaksanaan IMD', order: 14, isCompleted: false },
      ],
    },
    {
      id: 'ch2-4', title: 'Komplikasi dan Penanganan Darurat', description: 'Mengenali dan menangani komplikasi', order: 4,
      lessons: [
        { id: '2-15', title: 'Distosia Bahu', duration: '14:40', videoId: 'zpn46-MZXaU', description: 'Penanganan distosia bahu', order: 15, isCompleted: false },
        { id: '2-16', title: 'Perdarahan Post Partum', duration: '13:20', videoId: 'HsxGf5Wy0rQ', description: 'Penanganan perdarahan post partum', order: 16, isCompleted: false },
        { id: '2-17', title: 'Retensio Plasenta', duration: '12:15', videoId: 'zpn46-MZXaU', description: 'Penanganan retensio plasenta', order: 17, isCompleted: false },
        { id: '2-18', title: 'Resusitasi Bayi Baru Lahir', duration: '15:45', videoId: 'HsxGf5Wy0rQ', description: 'Teknik resusitasi neonatus', order: 18, isCompleted: false },
      ],
    },
  ],
  steps: [
    { id: 'step2-1', title: 'Persiapan Alat dan Ruang', detail: 'Siapkan seluruh alat persalinan steril.', order: 1, isImportant: true, tips: ['Gunakan prinsip sterilitas', 'Siapkan alat resusitasi'] },
    { id: 'step2-2', title: 'Penilaian Awal', detail: 'Periksa kondisi ibu dan janin.', order: 2, isImportant: true, tips: ['Periksa tanda vital', 'Nilai kontraksi uterus'] },
    { id: 'step2-3', title: 'Pantau dengan Partograf', detail: 'Isi partograf secara berkala.', order: 3, isImportant: true, tips: ['Isi setiap 30 menit'] },
    { id: 'step2-4', title: 'Pertolongan Persalinan', detail: 'Lakukan 60 langkah APN.', order: 4, isImportant: true, tips: ['Lindungi perineum', 'Jaga kehangatan bayi'] },
    { id: 'step2-5', title: 'Manajemen Aktif Kala III', detail: 'Berikan oksitosin dan PTT.', order: 5, isImportant: true, tips: ['Oksitosin dalam 1 menit'] },
    { id: 'step2-6', title: 'Pengawasan Kala IV', detail: 'Awasi 2 jam pertama post partum.', order: 6, isImportant: true, tips: ['Periksa setiap 15 menit'] },
  ],
  tools: [
    { id: 'tool2-1', name: 'Partograf', description: 'Untuk memantau kemajuan persalinan', category: 'primary' },
    { id: 'tool2-2', name: 'Stetoskop', description: 'Untuk mendengar DJJ', category: 'primary' },
    { id: 'tool2-3', name: 'Tensimeter', description: 'Untuk memantau tekanan darah', category: 'primary' },
    { id: 'tool2-4', name: 'Sarung Tangan Steril', description: 'Untuk sterilitas', category: 'primary' },
    { id: 'tool2-5', name: 'Klem Tali Pusat', description: 'Untuk mengklem tali pusat', category: 'primary' },
    { id: 'tool2-6', name: 'Oksitosin', description: 'Untuk manajemen aktif kala III', category: 'primary' },
    { id: 'tool2-7', name: 'Alat Resusitasi Bayi', description: 'Untuk resusitasi jika diperlukan', category: 'secondary' },
  ],
};