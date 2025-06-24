import { BiometricAuth } from 'capacitor-biometric-auth';
import { Capacitor } from '@capacitor/core';

export interface BiometricResult {
  success: boolean;
  error?: string;
}

export class BiometricService {
  /**
   * Check if biometric authentication is available
   */
  static async isAvailable(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      const result = await BiometricAuth.isAvailable();
      return result.isAvailable;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error checking biometric availability:', error);
      }
      return false;
    }
  }

  /**
   * Verify user with biometric authentication
   */
  static async verify(reason?: string): Promise<BiometricResult> {
    if (!Capacitor.isNativePlatform()) {
      return { success: false, error: 'Not available on web' };
    }

    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return { success: false, error: 'Biometric authentication not available' };
      }

      await BiometricAuth.verify({
        reason: reason || 'Authenticate to access DietWise',
        title: 'DietWise Authentication',
        subTitle: 'Use your biometric credentials',
        description: 'Place your finger on the sensor or look at the camera',
        fallbackButtonTitle: 'Use Password',
        cancelButtonTitle: 'Cancel'
      });

      return { success: true };
    } catch (error) {
      const errorMessage = (error as any).message || 'Authentication failed';
      
      if (process.env.NODE_ENV !== 'production') {
        console.error('Biometric authentication error:', error);
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

  /**
   * Enable biometric authentication for the app
   */
  static async enableBiometric(): Promise<BiometricResult> {
    const result = await this.verify('Enable biometric authentication for DietWise');
    
    if (result.success) {
      // Store biometric preference
      localStorage.setItem('biometricEnabled', 'true');
      localStorage.setItem('biometricEnabledAt', new Date().toISOString());
    }
    
    return result;
  }

  /**
   * Disable biometric authentication
   */
  static async disableBiometric(): Promise<void> {
    localStorage.removeItem('biometricEnabled');
    localStorage.removeItem('biometricEnabledAt');
    localStorage.removeItem('lastBiometricAuth');
  }

  /**
   * Check if biometric is enabled
   */
  static isBiometricEnabled(): boolean {
    return localStorage.getItem('biometricEnabled') === 'true';
  }

  /**
   * Authenticate for app access
   */
  static async authenticateApp(): Promise<BiometricResult> {
    if (!this.isBiometricEnabled()) {
      return { success: true }; // Skip if not enabled
    }

    const result = await this.verify('Unlock DietWise');
    
    if (result.success) {
      localStorage.setItem('lastBiometricAuth', new Date().toISOString());
    }
    
    return result;
  }

  /**
   * Authenticate for sensitive operations
   */
  static async authenticateForSensitiveOperation(operation: string): Promise<BiometricResult> {
    return await this.verify(`Authenticate to ${operation}`);
  }

  /**
   * Check if recent authentication is still valid (5 minutes)
   */
  static isRecentlyAuthenticated(): boolean {
    const lastAuth = localStorage.getItem('lastBiometricAuth');
    if (!lastAuth) return false;

    const lastAuthTime = new Date(lastAuth).getTime();
    const now = new Date().getTime();
    const fiveMinutes = 5 * 60 * 1000;

    return (now - lastAuthTime) < fiveMinutes;
  }
}