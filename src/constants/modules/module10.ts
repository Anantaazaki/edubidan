import { Module } from '../../types';

export const MODULE_10: Module = {
  id: '10',
  title: 'Deteksi Dini Kanker Reproduksi',
  category: 'Skrining',
  color: '#FC8181',
  progress: 0,
  videos: 8,
  duration: '2 jam',
  difficulty: 'advanced',
  introVideoId: 'kanker_intro',
  description: 'Modul ini membahas deteksi dini kanker serviks dan payudara melalui pemeriksaan IVA, Pap Smear, dan SADARI.',
  objectives: ['Memahami faktor risiko kanker reproduksi', 'Menguasai teknik IVA dan Pap Smear', 'Mengajarkan SADARI kepada perempuan', 'Melakukan konseling skrining kanker'],
  learningOutcomes: ['Mahasiswa mampu melakukan pemeriksaan IVA', 'Mahasiswa dapat mengajarkan SADARI', 'Mahasiswa mampu melakukan konseling skrining'],
  chapters: [
    {
      id: 'ch10-1', title: 'Kanker Serviks', description: 'Deteksi dini kanker leher rahim', order: 1,
      lessons: [
        { id: '10-1', title: 'Faktor Risiko Kanker Serviks', duration: '10:15', videoId: 'oDtprarpHwg', description: 'Penyebab dan faktor risiko', order: 1, isCompleted: false },
        { id: '10-2', title: 'Pemeriksaan IVA', duration: '14:30', videoId: 'D3qVhy3LvdY', description: 'Teknik inspeksi visual asam asetat', order: 2, isCompleted: false },
        { id: '10-3', title: 'Pap Smear', duration: '13:45', videoId: 'M7lc1UVf-VE', description: 'Teknik pengambilan dan pembacaan', order: 3, isCompleted: false },
        { id: '10-4', title: 'Vaksin HPV', duration: '9:20', videoId: 'oDtprarpHwg', description: 'Pencegahan kanker serviks', order: 4, isCompleted: false },
      ],
    },
    {
      id: 'ch10-2', title: 'Kanker Payudara', description: 'Deteksi dini kanker payudara', order: 2,
      lessons: [
        { id: '10-5', title: 'Faktor Risiko Kanker Payudara', duration: '9:40', videoId: 'D3qVhy3LvdY', description: 'Epidemiologi dan faktor risiko', order: 5, isCompleted: false },
        { id: '10-6', title: 'Teknik SADARI', duration: '12:25', videoId: 'M7lc1UVf-VE', description: 'Pemeriksaan payudara sendiri', order: 6, isCompleted: false },
        { id: '10-7', title: 'Teknik SADANIS', duration: '11:50', videoId: 'oDtprarpHwg', description: 'Pemeriksaan payudara klinis', order: 7, isCompleted: false },
        { id: '10-8', title: 'Konseling Skrining Kanker', duration: '13:15', videoId: 'D3qVhy3LvdY', description: 'Teknik konseling deteksi dini', order: 8, isCompleted: false },
      ],
    },
  ],
  steps: [
    { id: 'step10-1', title: 'Informed Consent', detail: 'Jelaskan prosedur dan minta persetujuan.', order: 1, isImportant: true, tips: ['Jelaskan tujuan pemeriksaan'] },
    { id: 'step10-2', title: 'Persiapan Pemeriksaan', detail: 'Siapkan alat dan posisi pasien.', order: 2, isImportant: true, tips: ['Jaga privasi pasien'] },
    { id: 'step10-3', title: 'Pelaksanaan IVA/Pap Smear', detail: 'Lakukan sesuai prosedur standar.', order: 3, isImportant: true, tips: ['Gunakan asam asetat 3-5% untuk IVA'] },
    { id: 'step10-4', title: 'Komunikasi Hasil', detail: 'Sampaikan hasil dengan bijak.', order: 4, isImportant: true, tips: ['Berikan dukungan psikologis'] },
    { id: 'step10-5', title: 'Rujukan jika Diperlukan', detail: 'Rujuk ke fasilitas lebih tinggi jika ada kelainan.', order: 5, isImportant: true, tips: ['Tulis surat rujukan lengkap'] },
  ],
  tools: [
    { id: 'tool10-1', name: 'Spekulum', description: 'Untuk pemeriksaan serviks', category: 'primary' },
    { id: 'tool10-2', name: 'Asam Asetat 3-5%', description: 'Untuk pemeriksaan IVA', category: 'primary' },
    { id: 'tool10-3', name: 'Spatula Ayre', description: 'Untuk pengambilan Pap Smear', category: 'primary' },
    { id: 'tool10-4', name: 'Sarung Tangan Steril', description: 'Untuk tindakan aseptik', category: 'primary' },
    { id: 'tool10-5', name: 'Lampu Sorot', description: 'Untuk visualisasi serviks', category: 'primary' },
  ],
};