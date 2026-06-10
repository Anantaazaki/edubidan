import { Module } from '../../types';

export const MODULE_7: Module = {
  id: '7',
  title: 'Imunisasi Dasar',
  category: 'Imunisasi',
  color: '#63B3ED',
  progress: 0,
  videos: 8,
  duration: '2 jam',
  difficulty: 'beginner',
  introVideoId: 'imunisasi_intro',
  description: 'Modul ini membahas program imunisasi dasar lengkap pada bayi dan anak sesuai jadwal nasional.',
  objectives: ['Memahami jadwal imunisasi nasional', 'Menguasai teknik pemberian vaksin', 'Mampu menangani KIPI', 'Memberikan edukasi imunisasi'],
  learningOutcomes: ['Mahasiswa mampu memberikan imunisasi sesuai jadwal', 'Mahasiswa dapat menangani KIPI ringan'],
  chapters: [
    {
      id: 'ch7-1', title: 'Dasar Imunisasi', description: 'Konsep dasar imunisasi', order: 1,
      lessons: [
        { id: '7-1', title: 'Konsep Dasar Imunisasi', duration: '9:30', videoId: 'oDtprarpHwg', description: 'Pengertian dan manfaat imunisasi', order: 1, isCompleted: false },
        { id: '7-2', title: 'Jadwal Imunisasi Nasional', duration: '11:15', videoId: 'D3qVhy3LvdY', description: 'Program imunisasi wajib dan tambahan', order: 2, isCompleted: false },
        { id: '7-3', title: 'Cold Chain Management', duration: '10:40', videoId: 'M7lc1UVf-VE', description: 'Penyimpanan dan distribusi vaksin', order: 3, isCompleted: false },
      ],
    },
    {
      id: 'ch7-2', title: 'Teknik Pemberian Vaksin', description: 'Cara pemberian berbagai vaksin', order: 2,
      lessons: [
        { id: '7-4', title: 'Vaksin BCG', duration: '8:45', videoId: 'oDtprarpHwg', description: 'Teknik injeksi intradermal BCG', order: 4, isCompleted: false },
        { id: '7-5', title: 'Vaksin DPT-HB-Hib dan Polio', duration: '10:20', videoId: 'D3qVhy3LvdY', description: 'Vaksin kombinasi dan oral polio', order: 5, isCompleted: false },
        { id: '7-6', title: 'Vaksin MR dan Campak', duration: '9:35', videoId: 'M7lc1UVf-VE', description: 'Pemberian vaksin MR/campak', order: 6, isCompleted: false },
        { id: '7-7', title: 'KIPI dan Penanganannya', duration: '12:10', videoId: 'oDtprarpHwg', description: 'Kejadian ikutan pasca imunisasi', order: 7, isCompleted: false },
        { id: '7-8', title: 'Dokumentasi Imunisasi', duration: '7:25', videoId: 'D3qVhy3LvdY', description: 'Pencatatan dan pelaporan imunisasi', order: 8, isCompleted: false },
      ],
    },
  ],
  steps: [
    { id: 'step7-1', title: 'Persiapan Vaksin', detail: 'Cek vaksin, tanggal kadaluarsa, dan cold chain.', order: 1, isImportant: true, tips: ['Cek VVM sebelum penggunaan'] },
    { id: 'step7-2', title: 'Skrining Kontraindikasi', detail: 'Periksa kondisi anak sebelum imunisasi.', order: 2, isImportant: true, tips: ['Tunda jika demam tinggi'] },
    { id: 'step7-3', title: 'Pemberian Vaksin', detail: 'Berikan sesuai rute dan dosis yang tepat.', order: 3, isImportant: true, tips: ['Gunakan spuit baru tiap anak'] },
    { id: 'step7-4', title: 'Observasi KIPI', detail: 'Observasi 30 menit setelah pemberian.', order: 4, isImportant: true, tips: ['Siapkan epinefrin untuk anafilaksis'] },
  ],
  tools: [
    { id: 'tool7-1', name: 'Spuit 0.05 ml', description: 'Untuk vaksin BCG', category: 'primary' },
    { id: 'tool7-2', name: 'Spuit 0.5 ml', description: 'Untuk vaksin IM/SC', category: 'primary' },
    { id: 'tool7-3', name: 'Termos Vaksin', description: 'Untuk cold chain', category: 'primary' },
    { id: 'tool7-4', name: 'Safety Box', description: 'Pembuangan spuit bekas', category: 'primary' },
  ],
};