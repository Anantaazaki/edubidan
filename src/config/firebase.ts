import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBm-mHPsP2S4OIN9X_i2yj4ljeEmgVshpc",
  authDomain: "edubidan-3ab02.firebaseapp.com",
  projectId: "edubidan-3ab02",
  storageBucket: "edubidan-3ab02.firebasestorage.app",
  messagingSenderId: "1000731281502",
  appId: "1:1000731281502:web:90c229e278ac252ca80ccf",
  measurementId: "G-3YLNP2C4TC"
};

// Initialize Firebase (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Auth dengan AsyncStorage persistence
let auth: any;
try {
  const { getReactNativePersistence } = require('firebase/auth');
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Already initialized
  auth = getAuth(app);
}

export { auth };

// Firestore database
export const db = getFirestore(app);

// Storage
export const storage = getStorage(app);

export default app;