import { Module } from '../../types';

export const MODULE_8: Module = {
  id: '8',
  title: 'Gizi dan Tumbuh Kembang',
  category: 'Gizi',
  color: '#F6AD55',
  progress: 0,
  videos: 8,
  duration: '2 jam',
  difficulty: 'beginner',
  introVideoId: 'gizi_intro',
  description: 'Modul ini membahas gizi ibu hamil, menyusui, dan pemantauan tumbuh kembang balita.',
  objectives: ['Memahami kebutuhan gizi ibu dan anak', 'Menguasai pemantauan tumbuh kembang', 'Mampu mendeteksi malnutrisi', 'Memberikan edukasi gizi'],
  learningOutcomes: ['Mahasiswa mampu memantau status gizi', 'Mahasiswa dapat memberikan edukasi gizi seimbang'],
  chapters: [
    {
      id: 'ch8-1', title: 'Gizi Ibu dan Anak', description: 'Kebutuhan nutrisi', order: 1,
      lessons: [
        { id: '8-1', title: 'Gizi Ibu Hamil', duration: '11:20', videoId: 'M7lc1UVf-VE', description: 'Kebutuhan nutrisi saat hamil', order: 1, isCompleted: false },
        { id: '8-2', title: 'Gizi Ibu Menyusui', duration: '9:45', videoId: 'D3qVhy3LvdY', description: 'Nutrisi untuk produksi ASI', order: 2, isCompleted: false },
        { id: '8-3', title: 'MPASI Bayi', duration: '10:30', videoId: 'oDtprarpHwg', description: 'Makanan pendamping ASI', order: 3, isCompleted: false },
        { id: '8-4', title: 'Gizi Seimbang Balita', duration: '9:15', videoId: 'M7lc1UVf-VE', description: 'Kebutuhan gizi anak 1-5 tahun', order: 4, isCompleted: false },
      ],
    },
    {
      id: 'ch8-2', title: 'Tumbuh Kembang', description: 'Pemantauan pertumbuhan', order: 2,
      lessons: [
        { id: '8-5', title: 'Penggunaan KMS', duration: '10:40', videoId: 'D3qVhy3LvdY', description: 'Kartu Menuju Sehat', order: 5, isCompleted: false },
        { id: '8-6', title: 'Deteksi Stunting', duration: '11:25', videoId: 'oDtprarpHwg', description: 'Identifikasi dan pencegahan stunting', order: 6, isCompleted: false },
        { id: '8-7', title: 'Deteksi Wasting dan Obesitas', duration: '9:50', videoId: 'M7lc1UVf-VE', description: 'Masalah gizi kurang dan lebih', order: 7, isCompleted: false },
        { id: '8-8', title: 'Intervensi Gizi Buruk', duration: '12:35', videoId: 'D3qVhy3LvdY', description: 'Tata laksana gizi buruk', order: 8, isCompleted: false },
      ],
    },
  ],
  steps: [
    { id: 'step8-1', title: 'Pengukuran Antropometri', detail: 'Ukur BB, TB, dan LILA.', order: 1, isImportant: true, tips: ['Gunakan alat yang terkalibrasi'] },
    { id: 'step8-2', title: 'Penilaian Status Gizi', detail: 'Plot hasil di KMS/grafik WHO.', order: 2, isImportant: true, tips: ['Gunakan z-score WHO'] },
    { id: 'step8-3', title: 'Konseling Gizi', detail: 'Berikan edukasi gizi seimbang.', order: 3, isImportant: false, tips: ['Sesuaikan dengan kemampuan ekonomi'] },
  ],
  tools: [
    { id: 'tool8-1', name: 'Timbangan Bayi', description: 'Untuk berat badan', category: 'primary' },
    { id: 'tool8-2', name: 'Stadiometer', description: 'Untuk tinggi badan', category: 'primary' },
    { id: 'tool8-3', name: 'KMS', description: 'Kartu pemantauan pertumbuhan', category: 'primary' },
    { id: 'tool8-4', name: 'Pita LILA', description: 'Untuk lingkar lengan', category: 'secondary' },
  ],
};