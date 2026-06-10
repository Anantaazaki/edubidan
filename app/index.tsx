import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { UserDatabase } from '../src/utils/userDatabase';

export default function Index() {
  useEffect(() => {
    // Initialize default users when app starts
    UserDatabase.initializeDefaultUser();
  }, []);

  return <Redirect href="/(auth)/landing" />;
}
