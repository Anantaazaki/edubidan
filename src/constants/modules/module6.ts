import { Module } from '../../types';

export const MODULE_6: Module = {
  id: '6',
  title: 'Keluarga Berencana (KB)',
  category: 'Keluarga Berencana',
  color: '#FC8181',
  progress: 0,
  videos: 12,
  duration: '3 jam',
  difficulty: 'intermediate',
  introVideoId: 'kb_intro',
  description: 'Modul ini membahas berbagai metode kontrasepsi dan konseling KB untuk pasangan usia subur.',
  objectives: ['Memahami jenis-jenis metode kontrasepsi', 'Menguasai teknik konseling KB', 'Mampu memasang alat kontrasepsi', 'Memberikan edukasi KB yang efektif'],
  learningOutcomes: ['Mahasiswa mampu memberikan konseling KB komprehensif', 'Mahasiswa dapat membantu pemilihan metode kontrasepsi'],
  chapters: [
    {
      id: 'ch6-1', title: 'Kontrasepsi Hormonal', description: 'Pil, suntik, implan', order: 1,
      lessons: [
        { id: '6-1', title: 'Kontrasepsi Pil', duration: '10:15', videoId: 'oDtprarpHwg', description: 'Jenis dan cara penggunaan pil KB', order: 1, isCompleted: false },
        { id: '6-2', title: 'Kontrasepsi Suntik', duration: '11:30', videoId: 'D3qVhy3LvdY', description: 'Teknik pemberian suntik KB', order: 2, isCompleted: false },
        { id: '6-3', title: 'Implan (Susuk KB)', duration: '13:45', videoId: 'M7lc1UVf-VE', description: 'Pemasangan dan pencabutan implan', order: 3, isCompleted: false },
      ],
    },
    {
      id: 'ch6-2', title: 'Kontrasepsi Non-Hormonal', description: 'IUD, kondom, metode alami', order: 2,
      lessons: [
        { id: '6-4', title: 'Pemasangan IUD', duration: '15:20', videoId: 'oDtprarpHwg', description: 'Teknik pemasangan AKDR', order: 4, isCompleted: false },
        { id: '6-5', title: 'Kontrasepsi Barier', duration: '9:40', videoId: 'D3qVhy3LvdY', description: 'Kondom dan diafragma', order: 5, isCompleted: false },
        { id: '6-6', title: 'Metode Amenore Laktasi', duration: '8:25', videoId: 'M7lc1UVf-VE', description: 'MAL sebagai kontrasepsi', order: 6, isCompleted: false },
        { id: '6-7', title: 'Kontrasepsi Mantap (MOW/MOP)', duration: '12:15', videoId: 'oDtprarpHwg', description: 'Sterilisasi wanita dan pria', order: 7, isCompleted: false },
      ],
    },
    {
      id: 'ch6-3', title: 'Konseling KB', description: 'Teknik konseling dan pemilihan metode', order: 3,
      lessons: [
        { id: '6-8', title: 'Konseling KB Komprehensif', duration: '14:30', videoId: 'D3qVhy3LvdY', description: 'Teknik SATU TUJU', order: 8, isCompleted: false },
        { id: '6-9', title: 'KB Pasca Persalinan', duration: '11:50', videoId: 'M7lc1UVf-VE', description: 'Kontrasepsi untuk ibu menyusui', order: 9, isCompleted: false },
        { id: '6-10', title: 'Efek Samping KB', duration: '10:35', videoId: 'oDtprarpHwg', description: 'Menangani efek samping', order: 10, isCompleted: false },
        { id: '6-11', title: 'Kegagalan KB dan Penanganan', duration: '9:20', videoId: 'D3qVhy3LvdY', description: 'Kontrasepsi darurat', order: 11, isCompleted: false },
        { id: '6-12', title: 'Dokumentasi KB', duration: '6:45', videoId: 'M7lc1UVf-VE', description: 'Pencatatan pelayanan KB', order: 12, isCompleted: false },
      ],
    },
  ],
  steps: [
    { id: 'step6-1', title: 'Anamnesis KB', detail: 'Kaji riwayat kesehatan dan preferensi.', order: 1, isImportant: true, tips: ['Gunakan metode SATU TUJU'] },
    { id: 'step6-2', title: 'Pemeriksaan Fisik', detail: 'Periksa kontraindikasi metode KB.', order: 2, isImportant: true, tips: ['Periksa tekanan darah'] },
    { id: 'step6-3', title: 'Konseling Metode', detail: 'Jelaskan keuntungan dan kerugian.', order: 3, isImportant: true, tips: ['Hormati pilihan klien'] },
    { id: 'step6-4', title: 'Pemberian/Pemasangan', detail: 'Lakukan tindakan sesuai metode.', order: 4, isImportant: true, tips: ['Gunakan teknik aseptik'] },
  ],
  tools: [
    { id: 'tool6-1', name: 'Set IUD', description: 'Untuk pemasangan AKDR', category: 'primary' },
    { id: 'tool6-2', name: 'Set Implan', description: 'Untuk pemasangan implan', category: 'primary' },
    { id: 'tool6-3', name: 'Sarung Tangan Steril', description: 'Untuk tindakan aseptik', category: 'primary' },
    { id: 'tool6-4', name: 'Spekulum', description: 'Untuk pemasangan IUD', category: 'primary' },
  ],
};