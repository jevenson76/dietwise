// Legacy auth service - replaced by SupabaseAuthService
// This file is kept for compatibility but should not be used
import { AppError } from '../utils/errors';

export class AuthService {
  // This service has been deprecated - use SupabaseAuthService instead
  static async register(): Promise<never> {
    throw new AppError('Use SupabaseAuthService instead', 500);
  }

  static async login(): Promise<never> {
    throw new AppError('Use SupabaseAuthService instead', 500);
  }

  static async refreshToken(): Promise<never> {
    throw new AppError('Use SupabaseAuthService instead', 500);
  }

  static async logout(): Promise<never> {
    throw new AppError('Use SupabaseAuthService instead', 500);
  }

  static async verifyEmail(): Promise<never> {
    throw new AppError('Use SupabaseAuthService instead', 500);
  }
}