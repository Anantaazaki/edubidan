import AsyncStorage from '@react-native-async-storage/async-storage';

export class AuthDebugger {
  static async checkStoredData() {
    console.log('=== AUTH DEBUG: Checking stored data ===');
    
    try {
      const keys = [
        '@edubidan_auth_token',
        '@edubidan_user_session', 
        '@edubidan_login_time',
        '@edubidan_theme',
        '@edubidan_user_data'
      ];
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        console.log(`${key}: ${value ? 'EXISTS' : 'NULL'}`);
        if (value) {
          console.log(`  Value: ${value.substring(0, 100)}...`);
        }
      }
      
      // Get all keys
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('All AsyncStorage keys:', allKeys);
      
    } catch (error) {
      console.error('Error checking stored data:', error);
    }
  }
  
  static async clearAllAuthData() {
    console.log('=== AUTH DEBUG: Clearing all auth data ===');
    
    try {
      const authKeys = [
        '@edubidan_auth_token',
        '@edubidan_user_session',
        '@edubidan_login_time'
      ];
      
      for (const key of authKeys) {
        await AsyncStorage.removeItem(key);
        console.log(`Removed: ${key}`);
      }
      
      // Verify removal
      await this.checkStoredData();
      
      return true;
    } catch (error) {
      console.error('Error clearing auth data:', error);
      return false;
    }
  }
  
  static logNavigationState(routeName: string) {
    console.log(`=== NAVIGATION DEBUG: Current route: ${routeName} ===`);
  }
}