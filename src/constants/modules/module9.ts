import { Module } from '../../types';

export const MODULE_9: Module = {
  id: '9',
  title: 'Kesehatan Reproduksi Remaja',
  category: 'Reproduksi',
  color: '#F687B3',
  progress: 0,
  videos: 8,
  duration: '2 jam',
  difficulty: 'beginner',
  introVideoId: 'kespro_intro',
  description: 'Modul ini membahas kesehatan reproduksi remaja, pencegahan kehamilan tidak diinginkan, dan edukasi seksual.',
  objectives: ['Memahami anatomi reproduksi remaja', 'Mampu memberikan konseling kespro', 'Mengenali masalah kespro remaja', 'Edukasi pencegahan IMS'],
  learningOutcomes: ['Mahasiswa mampu memberikan konseling kespro remaja', 'Mahasiswa dapat melakukan edukasi kesehatan reproduksi'],
  chapters: [
    {
      id: 'ch9-1', title: 'Anatomi dan Fisiologi Reproduksi', description: 'Dasar anatomi reproduksi', order: 1,
      lessons: [
        { id: '9-1', title: 'Anatomi Organ Reproduksi Wanita', duration: '12:30', videoId: 'M7lc1UVf-VE', description: 'Struktur organ reproduksi wanita', order: 1, isCompleted: false },
        { id: '9-2', title: 'Siklus Menstruasi', duration: '10:45', videoId: 'D3qVhy3LvdY', description: 'Fase dan hormon siklus haid', order: 2, isCompleted: false },
        { id: '9-3', title: 'Pubertas dan Perkembangan', duration: '9:20', videoId: 'oDtprarpHwg', description: 'Perubahan fisik dan psikologis', order: 3, isCompleted: false },
      ],
    },
    {
      id: 'ch9-2', title: 'Masalah Kespro Remaja', description: 'Isu kesehatan reproduksi remaja', order: 2,
      lessons: [
        { id: '9-4', title: 'Kehamilan Tidak Diinginkan', duration: '11:15', videoId: 'M7lc1UVf-VE', description: 'Pencegahan dan penanganan', order: 4, isCompleted: false },
        { id: '9-5', title: 'Infeksi Menular Seksual', duration: '13:40', videoId: 'D3qVhy3LvdY', description: 'Jenis IMS dan pencegahan', order: 5, isCompleted: false },
        { id: '9-6', title: 'HIV/AIDS pada Remaja', duration: '12:25', videoId: 'oDtprarpHwg', description: 'Edukasi HIV/AIDS', order: 6, isCompleted: false },
        { id: '9-7', title: 'Gangguan Menstruasi', duration: '10:50', videoId: 'M7lc1UVf-VE', description: 'Dismenore, amenore, dll', order: 7, isCompleted: false },
        { id: '9-8', title: 'Konseling Kespro Remaja', duration: '14:10', videoId: 'D3qVhy3LvdY', description: 'Teknik konseling remaja', order: 8, isCompleted: false },
      ],
    },
  ],
  steps: [
    { id: 'step9-1', title: 'Bangun Rapport', detail: 'Ciptakan suasana nyaman dan terpercaya.', order: 1, isImportant: true, tips: ['Jaga kerahasiaan informasi'] },
    { id: 'step9-2', title: 'Anamnesis Kespro', detail: 'Kaji riwayat menstruasi dan aktivitas seksual.', order: 2, isImportant: true, tips: ['Gunakan bahasa yang tidak menghakimi'] },
    { id: 'step9-3', title: 'Edukasi dan Konseling', detail: 'Berikan informasi sesuai kebutuhan.', order: 3, isImportant: false, tips: ['Libatkan remaja dalam pengambilan keputusan'] },
  ],
  tools: [
    { id: 'tool9-1', name: 'Model Anatomi', description: 'Untuk edukasi anatomi reproduksi', category: 'primary' },
    { id: 'tool9-2', name: 'Media KIE', description: 'Leaflet dan poster edukasi', category: 'secondary' },
  ],
};