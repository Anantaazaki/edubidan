import { Module } from '../../types';

export const MODULE_4: Module = {
  id: '4',
  title: 'Asuhan Neonatus',
  category: 'Neonatus',
  color: '#68D391',
  progress: 0,
  videos: 14,
  duration: '3 jam 30 menit',
  difficulty: 'intermediate',
  introVideoId: 'neonatus_intro',
  description: 'Modul ini membahas asuhan kebidanan pada bayi baru lahir (neonatus) dari 0-28 hari kehidupan.',
  objectives: [
    'Memahami adaptasi fisiologis bayi baru lahir',
    'Menguasai teknik penilaian dan asuhan neonatus',
    'Mampu melakukan pemeriksaan fisik bayi baru lahir',
    'Mengenali tanda bahaya pada neonatus',
  ],
  learningOutcomes: [
    'Mahasiswa mampu melakukan asuhan neonatus normal',
    'Mahasiswa dapat mendeteksi kelainan pada bayi baru lahir',
    'Mahasiswa mampu memberikan edukasi perawatan bayi',
  ],
  chapters: [
    {
      id: 'ch4-1', title: 'Penilaian Bayi Baru Lahir', description: 'Penilaian kondisi awal neonatus', order: 1,
      lessons: [
        { id: '4-1', title: 'Penilaian APGAR Score', duration: '11:20', videoId: 'oDtprarpHwg', description: 'Cara menilai APGAR score', order: 1, isCompleted: false },
        { id: '4-2', title: 'Pemeriksaan Fisik Neonatus', duration: '13:45', videoId: 'D3qVhy3LvdY', description: 'Pemeriksaan head to toe bayi', order: 2, isCompleted: false },
        { id: '4-3', title: 'Antropometri Neonatus', duration: '9:30', videoId: 'M7lc1UVf-VE', description: 'Pengukuran BB, PB, LK, LD', order: 3, isCompleted: false },
        { id: '4-4', title: 'Penilaian Usia Gestasi', duration: '10:15', videoId: 'oDtprarpHwg', description: 'Metode Ballard dan Dubowitz', order: 4, isCompleted: false },
      ],
    },
    {
      id: 'ch4-2', title: 'Asuhan Awal Neonatus', description: 'Penanganan segera bayi baru lahir', order: 2,
      lessons: [
        { id: '4-5', title: 'Menjaga Kehangatan Bayi', duration: '8:40', videoId: 'D3qVhy3LvdY', description: 'Pencegahan hipotermia neonatus', order: 5, isCompleted: false },
        { id: '4-6', title: 'Perawatan Tali Pusat', duration: '9:25', videoId: 'M7lc1UVf-VE', description: 'Perawatan tali pusat bayi', order: 6, isCompleted: false },
        { id: '4-7', title: 'Pemberian Vitamin K1', duration: '7:50', videoId: 'oDtprarpHwg', description: 'Injeksi vitamin K1 profilaksis', order: 7, isCompleted: false },
        { id: '4-8', title: 'Imunisasi HB0', duration: '8:15', videoId: 'D3qVhy3LvdY', description: 'Vaksin hepatitis B pertama', order: 8, isCompleted: false },
      ],
    },
    {
      id: 'ch4-3', title: 'Perawatan dan Komplikasi', description: 'Perawatan lanjutan dan deteksi masalah', order: 3,
      lessons: [
        { id: '4-9', title: 'Ikterus Neonatorum', duration: '12:30', videoId: 'M7lc1UVf-VE', description: 'Penanganan bayi kuning', order: 9, isCompleted: false },
        { id: '4-10', title: 'Hipoglikemia Neonatus', duration: '10:45', videoId: 'oDtprarpHwg', description: 'Deteksi dan penanganan hipoglikemia', order: 10, isCompleted: false },
        { id: '4-11', title: 'Infeksi Neonatus', duration: '11:20', videoId: 'D3qVhy3LvdY', description: 'Tanda infeksi pada bayi baru lahir', order: 11, isCompleted: false },
        { id: '4-12', title: 'Tanda Bahaya Neonatus', duration: '9:35', videoId: 'M7lc1UVf-VE', description: 'Deteksi dini tanda bahaya', order: 12, isCompleted: false },
        { id: '4-13', title: 'Edukasi Perawatan Bayi', duration: '10:10', videoId: 'oDtprarpHwg', description: 'Panduan perawatan bayi di rumah', order: 13, isCompleted: false },
        { id: '4-14', title: 'Dokumentasi Neonatus', duration: '6:40', videoId: 'D3qVhy3LvdY', description: 'Pencatatan asuhan neonatus', order: 14, isCompleted: false },
      ],
    },
  ],
  steps: [
    { id: 'step4-1', title: 'Penilaian Awal Bayi', detail: 'Nilai APGAR, tangisan, dan warna kulit.', order: 1, isImportant: true, tips: ['Nilai pada menit 1 dan 5'] },
    { id: 'step4-2', title: 'Jaga Kehangatan', detail: 'Keringkan dan bungkus bayi segera.', order: 2, isImportant: true, tips: ['Suhu ruang 25-28°C'] },
    { id: 'step4-3', title: 'Pemeriksaan Fisik Lengkap', detail: 'Lakukan pemeriksaan head to toe.', order: 3, isImportant: true, tips: ['Periksa dalam 1 jam pertama'] },
    { id: 'step4-4', title: 'Pemberian Profilaksis', detail: 'Berikan vitamin K1 dan salep mata.', order: 4, isImportant: true, tips: ['Vitamin K1 IM 0.5 mg'] },
    { id: 'step4-5', title: 'Imunisasi dan Dokumentasi', detail: 'Berikan HB0 dan catat semua data.', order: 5, isImportant: false, tips: ['HB0 dalam 12 jam pertama'] },
  ],
  tools: [
    { id: 'tool4-1', name: 'Timbangan Bayi', description: 'Untuk mengukur berat badan', category: 'primary' },
    { id: 'tool4-2', name: 'Pita Ukur', description: 'Untuk lingkar kepala dan dada', category: 'primary' },
    { id: 'tool4-3', name: 'Termometer', description: 'Untuk suhu aksila bayi', category: 'primary' },
    { id: 'tool4-4', name: 'Stetoskop Neonatus', description: 'Untuk auskultasi bayi', category: 'primary' },
    { id: 'tool4-5', name: 'Vitamin K1', description: 'Profilaksis perdarahan', category: 'primary' },
    { id: 'tool4-6', name: 'Salep Mata', description: 'Profilaksis konjungtivitis', category: 'secondary' },
  ],
};