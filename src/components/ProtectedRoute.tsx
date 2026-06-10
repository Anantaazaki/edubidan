import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const segments = useSegments();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status
  const checkAuth = async () => {
    try {
      console.log('=== PROTECTED ROUTE: Checking auth status ===');
      console.log('Current segments:', segments);
      
      const token = await AsyncStorage.getItem('@edubidan_auth_token');
      const userSession = await AsyncStorage.getItem('@edubidan_user_session');
      
      console.log('Token exists:', !!token);
      console.log('User session exists:', !!userSession);
      
      const authenticated = !!(token && userSession);
      setIsAuthenticated(authenticated);
      
      console.log('Authentication status:', authenticated);
      
      return authenticated;
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoading || isAuthenticated === null) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inProtectedGroup = segments[0] === '(tabs)' || segments[0] === 'module' || segments[0] === 'quiz';

    console.log('=== PROTECTED ROUTE: Navigation logic ===');
    console.log('In auth group:', inAuthGroup);
    console.log('In protected group:', inProtectedGroup);
    console.log('Is authenticated:', isAuthenticated);

    if (!isAuthenticated && inProtectedGroup) {
      console.log('🚫 BLOCKING: Not authenticated, redirecting to landing');
      router.replace('/(auth)/landing');
    } else if (isAuthenticated && inAuthGroup) {
      console.log('✅ REDIRECTING: Already authenticated, going to home');
      router.replace('/(tabs)/home');
    } else {
      console.log('✅ ALLOWING: Navigation is valid');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  // Re-check auth when segments change (for logout detection)
  useEffect(() => {
    if (!isLoading) {
      console.log('=== PROTECTED ROUTE: Segments changed, re-checking auth ===');
      checkAuth();
    }
  }, [segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.slate500,
  },
});