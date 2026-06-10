import { Module } from '../../types';

export const MODULE_5: Module = {
  id: '5',
  title: 'Asuhan Kebidanan Laktasi',
  category: 'Laktasi',
  color: '#9F7AEA',
  progress: 0,
  videos: 10,
  duration: '2 jam 30 menit',
  difficulty: 'beginner',
  introVideoId: 'laktasi_intro',
  description: 'Modul ini membahas asuhan laktasi dan pemberian ASI eksklusif untuk mendukung tumbuh kembang optimal bayi.',
  objectives: ['Memahami fisiologi laktasi', 'Menguasai teknik menyusui yang benar', 'Mampu memberikan konseling ASI', 'Mengatasi masalah menyusui'],
  learningOutcomes: ['Mahasiswa mampu memberikan konseling laktasi', 'Mahasiswa dapat membantu ibu mengatasi masalah menyusui'],
  chapters: [
    {
      id: 'ch5-1', title: 'Fisiologi dan Manfaat ASI', description: 'Dasar-dasar laktasi', order: 1,
      lessons: [
        { id: '5-1', title: 'Fisiologi Laktasi', duration: '10:30', videoId: 'M7lc1UVf-VE', description: 'Proses produksi ASI', order: 1, isCompleted: false },
        { id: '5-2', title: 'Komposisi dan Manfaat ASI', duration: '9:45', videoId: 'D3qVhy3LvdY', description: 'Kandungan nutrisi ASI', order: 2, isCompleted: false },
        { id: '5-3', title: 'ASI Eksklusif 6 Bulan', duration: '8:20', videoId: 'oDtprarpHwg', description: 'Pentingnya ASI eksklusif', order: 3, isCompleted: false },
      ],
    },
    {
      id: 'ch5-2', title: 'Teknik Menyusui', description: 'Cara menyusui yang benar', order: 2,
      lessons: [
        { id: '5-4', title: 'Posisi Menyusui yang Benar', duration: '11:15', videoId: 'M7lc1UVf-VE', description: 'Berbagai posisi menyusui', order: 4, isCompleted: false },
        { id: '5-5', title: 'Perlekatan yang Baik', duration: '10:40', videoId: 'D3qVhy3LvdY', description: 'Teknik attachment yang benar', order: 5, isCompleted: false },
        { id: '5-6', title: 'Frekuensi dan Durasi Menyusui', duration: '8:55', videoId: 'oDtprarpHwg', description: 'Jadwal dan durasi optimal', order: 6, isCompleted: false },
      ],
    },
    {
      id: 'ch5-3', title: 'Masalah dan Konseling', description: 'Mengatasi masalah laktasi', order: 3,
      lessons: [
        { id: '5-7', title: 'Mastitis dan Abses Payudara', duration: '12:20', videoId: 'M7lc1UVf-VE', description: 'Penanganan infeksi payudara', order: 7, isCompleted: false },
        { id: '5-8', title: 'ASI Kurang dan Cara Mengatasi', duration: '11:35', videoId: 'D3qVhy3LvdY', description: 'Meningkatkan produksi ASI', order: 8, isCompleted: false },
        { id: '5-9', title: 'Memerah dan Menyimpan ASI', duration: '9:50', videoId: 'oDtprarpHwg', description: 'Teknik memompa dan penyimpanan', order: 9, isCompleted: false },
        { id: '5-10', title: 'Konseling Laktasi', duration: '13:10', videoId: 'M7lc1UVf-VE', description: 'Teknik konseling ASI', order: 10, isCompleted: false },
      ],
    },
  ],
  steps: [
    { id: 'step5-1', title: 'Persiapan Konseling', detail: 'Siapkan lingkungan yang nyaman.', order: 1, isImportant: false, tips: ['Jaga privasi ibu'] },
    { id: 'step5-2', title: 'Penilaian Laktasi', detail: 'Nilai kondisi payudara dan perlekatan.', order: 2, isImportant: true, tips: ['Perhatikan tanda perlekatan baik'] },
    { id: 'step5-3', title: 'Edukasi dan Demonstrasi', detail: 'Demonstrasikan posisi dan perlekatan.', order: 3, isImportant: true, tips: ['Praktik langsung lebih efektif'] },
  ],
  tools: [
    { id: 'tool5-1', name: 'Boneka Demonstrasi', description: 'Untuk demonstrasi menyusui', category: 'primary' },
    { id: 'tool5-2', name: 'Model Payudara', description: 'Untuk edukasi laktasi', category: 'primary' },
    { id: 'tool5-3', name: 'Breast Pump', description: 'Untuk demonstrasi memompa ASI', category: 'secondary' },
  ],
};