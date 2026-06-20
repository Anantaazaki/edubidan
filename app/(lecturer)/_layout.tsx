import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { useTheme } from '../../src/contexts/ThemeContext';
import { UserDatabase } from '../../src/utils/userDatabase';

export default function LecturerTabsLayout() {
  const { isDark, theme } = useTheme();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const currentUser = await UserDatabase.getCurrentUser();
      if (currentUser && currentUser.role === 'lecturer') {
        setIsAuthenticated(true);
        setUserRole(currentUser.role);
      } else {
        setIsAuthenticated(false);
        // Redirect to login if not authenticated or not lecturer
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      router.replace('/(auth)/login');
    }
  };

  // Don't render tabs if not authenticated or not lecturer
  if (isAuthenticated !== true || userRole !== 'lecturer') {
    return null;
  }

  return (
    <Tabs
      screenOptions={() => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: isDark ? 'transparent' : theme.tabBarBorder,
          borderTopWidth: isDark ? 0 : 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          elevation: isDark ? 0 : 12,
          shadowColor: isDark ? 'transparent' : 'rgba(0,0,0,0.1)',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0 : 1,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="kelola-pembelajaran"
        options={{
          title: 'Pembelajaran',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'library' : 'library-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mahasiswa"
        options={{
          title: 'Mahasiswa',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="penilaian"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      
      {/* Hidden pages */}
      <Tabs.Screen name="materi-saya" options={{ href: null }} />
      <Tabs.Screen name="video-pembelajaran" options={{ href: null }} />
      <Tabs.Screen name="quiz" options={{ href: null }} />
      <Tabs.Screen name="quiz-edit" options={{ href: null }} />
      <Tabs.Screen name="quiz-results" options={{ href: null }} />
      <Tabs.Screen name="student-detail" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}