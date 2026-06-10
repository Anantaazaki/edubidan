import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Storage keys
const AUTH_TOKEN_KEY = '@edubidan_auth_token';
const USER_SESSION_KEY = '@edubidan_user_session';
const LOGIN_TIMESTAMP_KEY = '@edubidan_login_time';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  nim: string;
  prodi: string;
  universitas: string;
  angkatan: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearSession: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

// Demo user data
const DEMO_USER: User = {
  id: '1',
  email: 'admin@edubidan.com',
  name: 'Ananta Ziaurohman Az Zaki',
  nim: '2210631170007',
  prodi: 'Mahasiswa Kebidanan',
  universitas: 'Universitas Singaperbangsa Karawang',
  angkatan: '2022',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
  });

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const [token, userSession, loginTime] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(USER_SESSION_KEY),
        AsyncStorage.getItem(LOGIN_TIMESTAMP_KEY),
      ]);

      if (token && userSession && loginTime) {
        const user = JSON.parse(userSession);
        const loginTimestamp = parseInt(loginTime);
        const now = Date.now();
        
        // Check if session is still valid (24 hours)
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
        const isSessionValid = (now - loginTimestamp) < sessionDuration;

        if (isSessionValid) {
          setAuthState({
            isAuthenticated: true,
            user,
            token,
            isLoading: false,
          });
          return;
        } else {
          // Session expired, clear it
          await clearSession();
        }
      }

      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      // Demo authentication
      if (email === 'admin@edubidan.com' && password === 'password123') {
        const token = `demo_token_${Date.now()}`;
        const loginTime = Date.now().toString();

        // Store auth data
        await Promise.all([
          AsyncStorage.setItem(AUTH_TOKEN_KEY, token),
          AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(DEMO_USER)),
          AsyncStorage.setItem(LOGIN_TIMESTAMP_KEY, loginTime),
        ]);

        setAuthState({
          isAuthenticated: true,
          user: DEMO_USER,
          token,
          isLoading: false,
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const clearSession = useCallback(async () => {
    try {
      // Clear all auth-related data
      await Promise.all([
        AsyncStorage.removeItem(AUTH_TOKEN_KEY),
        AsyncStorage.removeItem(USER_SESSION_KEY),
        AsyncStorage.removeItem(LOGIN_TIMESTAMP_KEY),
      ]);

      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Clear session data
      await clearSession();
      
      // Optional: Call logout API endpoint here
      // await api.logout();
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear local session
      await clearSession();
    }
  }, [clearSession]);

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    clearSession,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth Guard Hook
export function useAuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  
  return {
    isAuthenticated,
    isLoading,
    shouldRedirect: !isLoading && !isAuthenticated,
  };
}