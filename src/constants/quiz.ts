import { QuizData } from '../types';

export const QUIZ_DATA: QuizData[] = [
  // ─── Module 1: Kehamilan ────────────────────────────────────────────────────
  {
    moduleId: '1',
    questions: [
      {
        question: 'Kapan pemeriksaan ANC pertama kali sebaiknya dilakukan?',
        answers: ['Segera setelah telat haid', 'Bulan ke-5 kehamilan', 'Bulan ke-9 kehamilan', 'Setelah merasakan gerakan janin'],
        correct: 0,
      },
      {
        question: 'Apa singkatan dari ANC?',
        answers: ['Antenatal Care', 'Ante Natal Check', 'Annual Natal Care', 'Antenatal Control'],
        correct: 0,
      },
      {
        question: 'Berapa kali minimal pemeriksaan ANC selama kehamilan menurut WHO?',
        answers: ['2 kali', '4 kali', '6 kali', '8 kali'],
        correct: 1,
      },
      {
        question: 'Apa yang diukur saat pemeriksaan ANC?',
        answers: ['Hanya berat badan', 'Tekanan darah, berat badan, tinggi fundus uteri', 'Hanya tekanan darah', 'Hanya tinggi badan'],
        correct: 1,
      },
      {
        question: 'Apa tanda bahaya pada kehamilan trimester ketiga?',
        answers: ['Nafsu makan meningkat', 'Pusing dan penglihatan kabur', 'Sering buang air kecil', 'Perut membesar'],
        correct: 1,
      },
      {
        question: 'Pemeriksaan Leopold dilakukan untuk mengetahui?',
        answers: ['Tekanan darah ibu', 'Posisi dan presentasi janin', 'Kadar hemoglobin', 'Berat badan ibu'],
        correct: 1,
      },
      {
        question: 'Normal DJJ (Denyut Jantung Janin) adalah?',
        answers: ['60-100 x/menit', '120-160 x/menit', '180-200 x/menit', '100-120 x/menit'],
        correct: 1,
      },
      {
        question: 'Kapan sebaiknya ibu hamil mulai mengonsumsi tablet Fe?',
        answers: ['Trimester 1', 'Trimester 2', 'Trimester 3', 'Setelah melahirkan'],
        correct: 1,
      },
      {
        question: 'Tanda-tanda persalinan palsu adalah?',
        answers: ['Kontraksi teratur dan makin kuat', 'Kontraksi tidak teratur dan hilang saat istirahat', 'Keluar lendir bercampur darah', 'Ketuban pecah'],
        correct: 1,
      },
      {
        question: 'Imunisasi yang diberikan pada ibu hamil adalah?',
        answers: ['BCG', 'Tetanus Toxoid (TT)', 'Hepatitis A', 'Influenza'],
        correct: 1,
      },
    ],
  },
  // ─── Module 2: Persalinan ───────────────────────────────────────────────────
  {
    moduleId: '2',
    questions: [
      {
        question: 'Kala I persalinan dimulai dari?',
        answers: ['Pembukaan lengkap', 'Munculnya kontraksi teratur hingga pembukaan lengkap', 'Ketuban pecah', 'Bayi lahir'],
        correct: 1,
      },
      {
        question: 'Alat apa yang digunakan untuk memantau DJJ selama persalinan?',
        answers: ['Tensimeter', 'Doppler/Fetoscope', 'Termometer', 'Stetoskop biasa'],
        correct: 1,
      },
      {
        question: 'Partograf digunakan untuk?',
        answers: ['Mencatat identitas pasien', 'Memantau kemajuan persalinan', 'Mengukur tekanan darah', 'Mencatat riwayat kehamilan'],
        correct: 1,
      },
      {
        question: 'Berapa lama fase aktif Kala I pada primigravida?',
        answers: ['1-2 jam', '6-8 jam', '12-14 jam', '20-24 jam'],
        correct: 1,
      },
      {
        question: 'Tanda bahaya pada Kala I persalinan adalah?',
        answers: ['Kontraksi teratur', 'Perdarahan aktif dari jalan lahir', 'Pembukaan serviks', 'DJJ normal'],
        correct: 1,
      },
      {
        question: 'Kala II persalinan adalah?',
        answers: ['Dari kontraksi hingga pembukaan lengkap', 'Dari pembukaan lengkap hingga bayi lahir', 'Dari bayi lahir hingga plasenta lahir', 'Dari plasenta lahir hingga 2 jam post partum'],
        correct: 1,
      },
      {
        question: 'Episiotomi dilakukan untuk?',
        answers: ['Mempercepat persalinan', 'Mencegah robekan perineum yang tidak terkontrol', 'Mengurangi nyeri', 'Mencegah infeksi'],
        correct: 1,
      },
      {
        question: 'Tanda-tanda Kala III (pelepasan plasenta) adalah?',
        answers: ['Kontraksi uterus berhenti', 'Uterus membulat, tali pusat memanjang, ada semburan darah', 'Bayi menangis', 'Ibu merasa lega'],
        correct: 1,
      },
      {
        question: 'Manajemen aktif Kala III meliputi?',
        answers: ['Hanya menunggu plasenta lahir spontan', 'Pemberian oksitosin, penegangan tali pusat terkendali, masase fundus uteri', 'Hanya masase fundus', 'Hanya pemberian oksitosin'],
        correct: 1,
      },
      {
        question: 'Kala IV persalinan berlangsung selama?',
        answers: ['30 menit', '1 jam', '2 jam', '6 jam'],
        correct: 2,
      },
    ],
  },
  // ─── Module 3: Nifas ────────────────────────────────────────────────────────
  {
    moduleId: '3',
    questions: [
      {
        question: 'Masa nifas berlangsung selama?',
        answers: ['2 minggu', '6 minggu', '8 minggu', '12 minggu'],
        correct: 1,
      },
      {
        question: 'Involusi uteri adalah?',
        answers: ['Pembesaran rahim', 'Pengembalian rahim ke ukuran semula', 'Kontraksi rahim', 'Perdarahan dari rahim'],
        correct: 1,
      },
      {
        question: 'Lochea rubra berlangsung selama?',
        answers: ['1-3 hari', '4-9 hari', '10-14 hari', '15-21 hari'],
        correct: 0,
      },
      {
        question: 'Tanda bahaya masa nifas adalah?',
        answers: ['ASI belum keluar hari pertama', 'Perdarahan hebat dan berbau busuk', 'Payudara bengkak', 'Merasa lelah'],
        correct: 1,
      },
      {
        question: 'Mobilisasi dini pada ibu nifas sebaiknya dimulai?',
        answers: ['Setelah 1 minggu', 'Setelah 3 hari', '6-12 jam post partum', 'Setelah 1 bulan'],
        correct: 2,
      },
      {
        question: 'Perawatan luka perineum yang benar adalah?',
        answers: ['Dibiarkan terbuka', 'Dibersihkan dengan air bersih dari depan ke belakang', 'Dibersihkan dengan alkohol', 'Ditutup rapat dengan kasa'],
        correct: 1,
      },
      {
        question: 'Senam nifas bermanfaat untuk?',
        answers: ['Mengurangi produksi ASI', 'Mempercepat involusi uteri dan memperkuat otot', 'Menambah berat badan', 'Mengurangi nafsu makan'],
        correct: 1,
      },
      {
        question: 'Kapan menstruasi biasanya kembali pada ibu menyusui?',
        answers: ['2 minggu post partum', '6 minggu post partum', '3-6 bulan post partum', '1 tahun post partum'],
        correct: 2,
      },
      {
        question: 'Nutrisi penting untuk ibu nifas adalah?',
        answers: ['Protein, zat besi, kalsium, vitamin', 'Hanya karbohidrat', 'Hanya lemak', 'Hanya vitamin'],
        correct: 0,
      },
      {
        question: 'KB yang dapat diberikan segera post partum adalah?',
        answers: ['Pil kombinasi', 'AKDR/IUD', 'Suntik 3 bulan', 'Implant'],
        correct: 1,
      },
    ],
  },
  // ─── Module 4: BBL ──────────────────────────────────────────────────────────
  {
    moduleId: '4',
    questions: [
      {
        question: 'IMD singkatan dari?',
        answers: ['Inisiasi Menyusu Dini', 'Imunisasi Mandiri Dasar', 'Identifikasi Medis Dasar', 'Intervensi Medis Dini'],
        correct: 0,
      },
      {
        question: 'Berat badan bayi lahir normal adalah?',
        answers: ['1.5 - 2.0 kg', '2.5 - 4.0 kg', '5.0 - 6.0 kg', '1.0 - 1.5 kg'],
        correct: 1,
      },
      {
        question: 'Mengapa bayi perlu segera dikeringkan setelah lahir?',
        answers: ['Agar terlihat bersih', 'Mencegah kehilangan panas tubuh (hipotermia)', 'Memudahkan pemeriksaan', 'Agar tidak licin'],
        correct: 1,
      },
      {
        question: 'Kapan tali pusat bayi dipotong?',
        answers: ['Segera setelah lahir', 'Setelah denyutan tali pusat berhenti', 'Setelah 1 jam', 'Setelah plasenta lahir'],
        correct: 1,
      },
      {
        question: 'Suhu normal bayi baru lahir adalah?',
        answers: ['35-36°C', '36.5-37.5°C', '38-39°C', '34-35°C'],
        correct: 1,
      },
      {
        question: 'Vitamin K diberikan pada BBL untuk mencegah?',
        answers: ['Infeksi', 'Perdarahan', 'Diare', 'Demam'],
        correct: 1,
      },
      {
        question: 'Imunisasi yang diberikan pada BBL adalah?',
        answers: ['BCG dan Polio', 'Hepatitis B', 'DPT', 'Campak'],
        correct: 1,
      },
      {
        question: 'Tanda bahaya pada BBL adalah?',
        answers: ['Tidur terus', 'Tidak mau menyusu, kejang, suhu tubuh < 36°C atau > 37.5°C', 'Menangis keras', 'BAK sering'],
        correct: 1,
      },
      {
        question: 'Perawatan tali pusat yang benar adalah?',
        answers: ['Diberi alkohol setiap hari', 'Dibiarkan kering dan bersih', 'Diberi bedak', 'Ditutup rapat'],
        correct: 1,
      },
      {
        question: 'Kapan sebaiknya IMD dilakukan?',
        answers: ['Setelah 2 jam', 'Dalam 1 jam pertama setelah lahir', 'Setelah dimandikan', 'Keesokan harinya'],
        correct: 1,
      },
    ],
  },
  // ─── Module 5: KB ───────────────────────────────────────────────────────────
  {
    moduleId: '5',
    questions: [
      {
        question: 'Metode KB yang paling efektif adalah?',
        answers: ['Kondom', 'Pil KB', 'IUD/AKDR', 'Kalender'],
        correct: 2,
      },
      {
        question: 'KB hormonal bekerja dengan cara?',
        answers: ['Menghalangi sperma', 'Menekan ovulasi', 'Membunuh sperma', 'Mengubah pH vagina'],
        correct: 1,
      },
      {
        question: 'Efek samping pil KB kombinasi adalah?',
        answers: ['Penurunan berat badan', 'Mual, pusing, perdarahan bercak', 'Peningkatan libido', 'Rambut rontok'],
        correct: 1,
      },
      {
        question: 'IUD dapat dipasang kapan?',
        answers: ['Hanya saat menstruasi', 'Kapan saja asal tidak hamil', 'Hanya setelah melahirkan', 'Hanya saat ovulasi'],
        correct: 1,
      },
      {
        question: 'Kontraindikasi pil KB kombinasi adalah?',
        answers: ['Usia muda', 'Merokok dan usia > 35 tahun', 'Belum pernah melahirkan', 'Berat badan kurang'],
        correct: 1,
      },
      {
        question: 'Suntik KB 3 bulan mengandung hormon?',
        answers: ['Estrogen saja', 'Progestin saja', 'Kombinasi estrogen-progestin', 'Tidak mengandung hormon'],
        correct: 1,
      },
      {
        question: 'Implant KB dapat bertahan selama?',
        answers: ['1 tahun', '3 tahun', '5 tahun', '10 tahun'],
        correct: 1,
      },
      {
        question: 'Metode KB alamiah adalah?',
        answers: ['Pil KB', 'Kondom', 'Kalender/pantang berkala', 'Suntik KB'],
        correct: 2,
      },
      {
        question: 'KB mantap untuk wanita adalah?',
        answers: ['Vasektomi', 'Tubektomi', 'IUD', 'Implant'],
        correct: 1,
      },
      {
        question: 'Konseling KB sebaiknya diberikan?',
        answers: ['Hanya saat ingin ber-KB', 'Sejak masa remaja', 'Hanya setelah menikah', 'Hanya setelah punya anak'],
        correct: 1,
      },
    ],
  },
  // ─── Module 6: Kesehatan Reproduksi ─────────────────────────────────────────
  {
    moduleId: '6',
    questions: [
      {
        question: 'Siklus menstruasi normal berlangsung selama?',
        answers: ['14 hari', '21-35 hari', '40 hari', '60 hari'],
        correct: 1,
      },
      {
        question: 'Ovulasi terjadi pada hari ke berapa dari siklus 28 hari?',
        answers: ['Hari ke-7', 'Hari ke-14', 'Hari ke-21', 'Hari ke-28'],
        correct: 1,
      },
      {
        question: 'Pemeriksaan IVA (Inspeksi Visual Asam Asetat) untuk deteksi?',
        answers: ['Kanker payudara', 'Kanker serviks', 'Infeksi saluran kemih', 'Gangguan menstruasi'],
        correct: 1,
      },
      {
        question: 'Pap smear sebaiknya dilakukan setiap?',
        answers: ['1 bulan', '6 bulan', '1 tahun', '3 tahun'],
        correct: 2,
      },
      {
        question: 'Tanda-tanda infeksi saluran reproduksi adalah?',
        answers: ['Menstruasi teratur', 'Keputihan berbau, gatal, nyeri', 'Nafsu makan meningkat', 'Berat badan naik'],
        correct: 1,
      },
      {
        question: 'Menopause adalah?',
        answers: ['Menstruasi pertama', 'Berhentinya menstruasi secara permanen', 'Menstruasi tidak teratur', 'Menstruasi berlebihan'],
        correct: 1,
      },
      {
        question: 'Usia rata-rata menopause adalah?',
        answers: ['35-40 tahun', '45-50 tahun', '50-55 tahun', '60-65 tahun'],
        correct: 2,
      },
      {
        question: 'SADARI (Pemeriksaan Payudara Sendiri) sebaiknya dilakukan?',
        answers: ['Setiap hari', 'Seminggu sekali', 'Sebulan sekali setelah menstruasi', 'Setahun sekali'],
        correct: 2,
      },
      {
        question: 'Faktor risiko kanker serviks adalah?',
        answers: ['Olahraga berlebihan', 'Infeksi HPV, merokok, berganti-ganti pasangan', 'Makan sayuran', 'Tidur cukup'],
        correct: 1,
      },
      {
        question: 'Edukasi kesehatan reproduksi remaja meliputi?',
        answers: ['Hanya anatomi', 'Anatomi, fisiologi, kebersihan, dan pencegahan penyakit', 'Hanya kebersihan', 'Hanya pencegahan penyakit'],
        correct: 1,
      },
    ],
  },

  // ─── Module 7: Imunisasi ────────────────────────────────────────────────────
  {
    moduleId: '7',
    questions: [
      {
        question: 'Kapan bayi mendapat imunisasi BCG pertama kali?',
        answers: ['0-2 bulan', '2-4 bulan', '4-6 bulan', '6-9 bulan'],
        correct: 0,
      },
      {
        question: 'Imunisasi DPT diberikan berapa kali pada bayi?',
        answers: ['2 kali', '3 kali', '4 kali', '5 kali'],
        correct: 1,
      },
      {
        question: 'Suhu penyimpanan vaksin yang benar adalah?',
        answers: ['0-2°C', '2-8°C', '8-15°C', '15-25°C'],
        correct: 1,
      },
      {
        question: 'Imunisasi TT untuk ibu hamil diberikan berapa kali?',
        answers: ['1 kali', '2 kali', '3 kali', '4 kali'],
        correct: 1,
      },
      {
        question: 'Lokasi penyuntikan imunisasi BCG adalah?',
        answers: ['Lengan kanan atas', 'Lengan kiri atas', 'Paha kanan', 'Paha kiri'],
        correct: 1,
      },
      {
        question: 'Efek samping normal setelah imunisasi DPT adalah?',
        answers: ['Demam tinggi >39°C', 'Demam ringan dan kemerahan', 'Muntah-muntah', 'Diare'],
        correct: 1,
      },
      {
        question: 'Imunisasi polio diberikan melalui?',
        answers: ['Suntikan saja', 'Oral saja', 'Suntikan dan oral', 'Tetes mata'],
        correct: 2,
      },
      {
        question: 'Kontraindikasi imunisasi adalah?',
        answers: ['Batuk pilek ringan', 'Demam tinggi >38°C', 'Nafsu makan kurang', 'Rewel'],
        correct: 1,
      },
    ],
  },

  // ─── Module 8: Gizi dan Tumbuh Kembang ─────────────────────────────────────
  {
    moduleId: '8',
    questions: [
      {
        question: 'ASI eksklusif diberikan sampai usia berapa?',
        answers: ['4 bulan', '6 bulan', '8 bulan', '12 bulan'],
        correct: 1,
      },
      {
        question: 'MPASI mulai diberikan pada usia?',
        answers: ['4 bulan', '6 bulan', '8 bulan', '12 bulan'],
        correct: 1,
      },
      {
        question: 'Tanda gizi kurang pada balita adalah?',
        answers: ['BB/U di bawah -2 SD', 'TB/U di atas +2 SD', 'BB/TB normal', 'Lingkar kepala besar'],
        correct: 0,
      },
      {
        question: 'Milestone perkembangan anak 12 bulan adalah?',
        answers: ['Berjalan mandiri', 'Duduk tanpa bantuan', 'Tengkurap', 'Mengoceh'],
        correct: 0,
      },
      {
        question: 'Stimulasi tumbuh kembang yang tepat untuk bayi 6 bulan?',
        answers: ['Membaca buku', 'Bermain cilukba', 'Menulis', 'Berlari'],
        correct: 1,
      },
      {
        question: 'Tanda bahaya pada tumbuh kembang anak adalah?',
        answers: ['Berat badan naik', 'Tidak bisa duduk usia 9 bulan', 'Aktif bermain', 'Nafsu makan baik'],
        correct: 1,
      },
      {
        question: 'Frekuensi penimbangan balita di posyandu adalah?',
        answers: ['Setiap minggu', 'Setiap bulan', 'Setiap 3 bulan', 'Setiap 6 bulan'],
        correct: 1,
      },
      {
        question: 'Vitamin A diberikan pada anak usia?',
        answers: ['1-6 bulan', '6-59 bulan', '5-10 tahun', '10-15 tahun'],
        correct: 1,
      },
    ],
  },

  // ─── Module 9: Kesehatan Reproduksi Remaja ─────────────────────────────────
  {
    moduleId: '9',
    questions: [
      {
        question: 'Usia pubertas pada anak perempuan umumnya dimulai pada?',
        answers: ['8-10 tahun', '10-14 tahun', '14-16 tahun', '16-18 tahun'],
        correct: 1,
      },
      {
        question: 'Tanda pubertas pertama pada anak perempuan adalah?',
        answers: ['Menstruasi', 'Pertumbuhan payudara', 'Tumbuh rambut kemaluan', 'Suara berubah'],
        correct: 1,
      },
      {
        question: 'Siklus menstruasi normal adalah?',
        answers: ['14-21 hari', '21-35 hari', '35-42 hari', '42-50 hari'],
        correct: 1,
      },
      {
        question: 'Cara menjaga kebersihan saat menstruasi yang benar?',
        answers: ['Ganti pembalut 2x sehari', 'Ganti pembalut setiap 4-6 jam', 'Ganti pembalut 1x sehari', 'Tidak perlu ganti pembalut'],
        correct: 1,
      },
      {
        question: 'Pendekatan konseling yang tepat untuk remaja adalah?',
        answers: ['Menggurui', 'Mendengarkan aktif', 'Memarahi', 'Mengancam'],
        correct: 1,
      },
      {
        question: 'Informasi yang penting diberikan pada remaja tentang seksualitas?',
        answers: ['Hanya tentang anatomi', 'Risiko dan pencegahan', 'Hanya tentang penyakit', 'Tidak perlu informasi'],
        correct: 1,
      },
      {
        question: 'Usia ideal untuk menikah menurut BKKBN adalah?',
        answers: ['16 tahun', '18 tahun', '21 tahun', '25 tahun'],
        correct: 2,
      },
      {
        question: 'Tanda bahaya pada menstruasi yang perlu dirujuk?',
        answers: ['Nyeri ringan', 'Perdarahan >7 hari', 'Siklus 28 hari', 'Volume normal'],
        correct: 1,
      },
    ],
  },

  // ─── Module 10: Deteksi Dini Kanker Reproduksi ────────────────────────────
  {
    moduleId: '10',
    questions: [
      {
        question: 'Usia target skrining kanker serviks adalah?',
        answers: ['15-25 tahun', '25-65 tahun', '30-70 tahun', '35-75 tahun'],
        correct: 1,
      },
      {
        question: 'Metode skrining kanker serviks yang sederhana adalah?',
        answers: ['Pap smear', 'IVA test', 'Kolposkopi', 'Biopsi'],
        correct: 1,
      },
      {
        question: 'Hasil IVA positif ditandai dengan?',
        answers: ['Serviks normal', 'Bercak putih tebal', 'Tidak ada perubahan', 'Serviks merah muda'],
        correct: 1,
      },
      {
        question: 'Waktu yang tepat untuk SADARI adalah?',
        answers: ['Saat menstruasi', '7-10 hari setelah menstruasi', 'Sebelum menstruasi', 'Kapan saja'],
        correct: 1,
      },
      {
        question: 'Tanda abnormal pada payudara yang perlu diwaspadai?',
        answers: ['Payudara simetris', 'Benjolan keras tidak nyeri', 'Kulit halus', 'Puting normal'],
        correct: 1,
      },
      {
        question: 'Faktor risiko utama kanker serviks adalah?',
        answers: ['Usia tua', 'Infeksi HPV', 'Obesitas', 'Merokok'],
        correct: 1,
      },
      {
        question: 'Frekuensi skrining kanker serviks yang dianjurkan?',
        answers: ['Setiap bulan', 'Setiap 6 bulan', 'Setiap tahun', 'Setiap 3 tahun'],
        correct: 2,
      },
      {
        question: 'Persiapan sebelum pemeriksaan IVA adalah?',
        answers: ['Boleh saat menstruasi', 'Tidak boleh berhubungan 24 jam sebelumnya', 'Boleh menggunakan obat vagina', 'Tidak ada persiapan khusus'],
        correct: 1,
      },
    ],
  },
];