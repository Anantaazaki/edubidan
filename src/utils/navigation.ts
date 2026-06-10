import { router } from 'expo-router';

/**
 * Navigation utilities for secure routing
 */
export class NavigationUtils {
  /**
   * Reset navigation stack and navigate to auth flow
   * Prevents user from going back to protected routes
   */
  static resetToAuth() {
    try {
      // Use replace to prevent back navigation
      router.replace('/(auth)/landing');
      console.log('Navigation reset to auth successful');
    } catch (error) {
      console.error('Navigation reset failed:', error);
      // Fallback navigation
      router.push('/(auth)/landing');
    }
  }

  /**
   * Reset navigation stack and navigate to main app
   * Used after successful login
   */
  static resetToApp() {
    try {
      router.replace('/(tabs)/home');
      console.log('Navigation reset to app successful');
    } catch (error) {
      console.error('Navigation reset to app failed:', error);
      router.push('/(tabs)/home');
    }
  }

  /**
   * Safe navigation with error handling
   */
  static safePush(route: string) {
    try {
      router.push(route as any);
    } catch (error) {
      console.error('Safe push navigation failed:', error);
    }
  }

  /**
   * Safe replace navigation with error handling
   */
  static safeReplace(route: string) {
    try {
      router.replace(route as any);
    } catch (error) {
      console.error('Safe replace navigation failed:', error);
    }
  }

  /**
   * Check if current route is in auth flow
   */
  static isInAuthFlow(): boolean {
    try {
      // This would need to be implemented based on your routing structure
      // For now, return false as default
      return false;
    } catch (error) {
      console.error('Error checking auth flow:', error);
      return false;
    }
  }

  /**
   * Check if current route is in protected area
   */
  static isInProtectedArea(): boolean {
    try {
      // This would need to be implemented based on your routing structure
      // For now, return true as default for safety
      return true;
    } catch (error) {
      console.error('Error checking protected area:', error);
      return true;
    }
  }
}