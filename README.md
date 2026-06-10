# EduBidan - Mobile App (React Native)

Aplikasi mobile pembelajaran untuk bidan menggunakan Expo (React Native) dengan Expo Router.

## 📱 Fitur Aplikasi

- ✅ **Autentikasi**: Login, Register, Forgot Password
- ✅ **Landing Page**: Halaman sambutan
- ✅ **Home**: Dashboard utama
- ✅ **Materi**: Daftar modul pembelajaran
- ✅ **Detail Modul**: Video pembelajaran, deskripsi, langkah-langkah, alat
- ✅ **Quiz**: Kuis untuk setiap modul
- ✅ **Riwayat**: History pembelajaran
- ✅ **Profil**: Profil pengguna
- ✅ **Dark Mode**: Tema gelap/terang otomatis

## 🛠️ Teknologi

- **React Native** 0.76.3
- **Expo** ~52.0.0
- **Expo Router** ~4.0.0 (File-based routing)
- **TypeScript** 5.3.3
- **React Navigation** 6.x
- **AsyncStorage** untuk local storage
- **WebView** untuk video YouTube
- **Linear Gradient** untuk UI
- **Vector Icons** (@expo/vector-icons)

## 📦 Instalasi

### Prerequisites
- Node.js (v18 atau lebih baru)
- npm atau yarn
- Expo Go app di smartphone (untuk testing)

### Langkah Instalasi

1. **Clone repository** (jika belum)
```bash
git clone <repository-url>
cd edubidan---mobile-app-(react-native)/EduBidan-RN
```

2. **Install dependencies**
```bash
npm install
```

3. **Jalankan aplikasi**
```bash
npm start
```

## 🚀 Cara Menjalankan

### Development Mode

```bash
npm start
```

Setelah itu akan muncul QR code. Scan QR code dengan:
- **Android**: Expo Go app
- **iOS**: Camera app (akan membuka Expo Go)

### Platform Specific

```bash
# Android
npm run android

# iOS (hanya di Mac)
npm run ios
```

## 📁 Struktur Folder

```
EduBidan-RN/
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/                   # Auth screens
│   │   ├── landing.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/                   # Tab navigation
│   │   ├── home.tsx
│   │   ├── materi.tsx
│   │   ├── riwayat.tsx
│   │   ├── profil.tsx
│   │   └── _layout.tsx
│   ├── module/
│   │   └── [id].tsx              # Dynamic route untuk detail modul
│   ├── quiz/
│   │   └── [moduleId].tsx        # Dynamic route untuk quiz
│   ├── index.tsx                 # Entry point
│   └── _layout.tsx               # Root layout
├── src/
│   ├── components/               # Reusable components
│   ├── constants/                # Constants (colors, modules, quiz)
│   ├── hooks/                    # Custom hooks
│   └── types/                    # TypeScript types
├── app.json                      # Expo configuration
├── package.json
└── tsconfig.json
```

## 🎨 Tema & Warna

Aplikasi mendukung **Dark Mode** otomatis berdasarkan pengaturan sistem.

**Primary Color**: `#00A78E` (Teal/Hijau Tosca)

## 📱 Screens

### Auth Flow
1. **Landing** - Halaman sambutan
2. **Login** - Login pengguna
3. **Register** - Registrasi pengguna baru
4. **Forgot Password** - Reset password

### Main App (Tabs)
1. **Home** - Dashboard dengan statistik dan modul populer
2. **Materi** - Daftar semua modul pembelajaran
3. **Riwayat** - History pembelajaran dan quiz
4. **Profil** - Profil dan pengaturan pengguna

### Detail Screens
1. **Module Detail** - Detail modul dengan video, deskripsi, langkah, alat, dan pelajaran
2. **Quiz** - Kuis interaktif untuk setiap modul

## 🔧 Build untuk Production

### Android APK

```bash
npm run build:android
```

Catatan: Memerlukan konfigurasi EAS (Expo Application Services)

## 📝 Scripts

```json
{
  "start": "expo start",           // Development server
  "android": "expo start --android", // Run on Android
  "ios": "expo start --ios",       // Run on iOS
  "build:android": "eas build --platform android" // Build APK
}
```

## 🐛 Troubleshooting

### Error: Cannot find module
```bash
# Hapus node_modules dan install ulang
rm -rf node_modules
npm install
```

### Metro bundler error
```bash
# Clear cache
npx expo start -c
```

### TypeScript errors
```bash
# Pastikan tsconfig.json sudah benar
# File sudah dikonfigurasi dengan "jsx": "react-native"
```

## 📄 License

Private - Tugas Akhir

## 👨‍💻 Developer

Dikembangkan untuk Tugas Akhir - Aplikasi Pembelajaran Bidan

---

**Status**: ✅ **SIAP DIGUNAKAN**

Semua dependencies sudah terinstall dan aplikasi siap untuk development!
