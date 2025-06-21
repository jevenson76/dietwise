import { supabase, supabaseAdmin } from '../config/supabase';
import { CreateUserDto, LoginDto } from '../models/user.model';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

export class SupabaseAuthService {
  // Register new user
  static async register(data: CreateUserDto): Promise<{ user: any; session: any }> {
    try {
      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            timezone: data.timezone || 'UTC',
            locale: data.locale || 'en-US',
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new AppError('Email already registered', 409);
        }
        throw new AppError(authError.message, 400);
      }

      if (!authData.user) {
        throw new AppError('User creation failed', 500);
      }

      // User profile creation is handled by database trigger
      logger.info('User profile creation handled by trigger');

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: data.name,
          emailVerified: authData.user.email_confirmed_at != null,
          createdAt: authData.user.created_at,
        },
        session: authData.session
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  static async login(data: LoginDto): Promise<{ user: any; session: any }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        throw new AppError('Invalid credentials', 401);
      }

      if (!authData.user || !authData.session) {
        throw new AppError('Login failed', 401);
      }

      // Get additional user data from our users table
      const { data: userData } = await supabaseAdmin
        .from('dietwise_users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: userData?.name || 'User',
          emailVerified: authData.user.email_confirmed_at != null,
          createdAt: authData.user.created_at,
          timezone: userData?.timezone || 'UTC',
          locale: userData?.locale || 'en-US',
        },
        session: authData.session
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  // Refresh session
  static async refreshSession(refreshToken: string): Promise<{ session: any }> {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error) {
        throw new AppError('Invalid refresh token', 401);
      }

      return { session: data.session };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      logger.error('Logout error:', error);
      // Don't throw error for logout failures
    }
  }

  // Verify JWT token
  static async verifyToken(token: string): Promise<any> {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error || !data.user) {
        throw new AppError('Invalid token', 401);
      }

      return data.user;
    } catch (error) {
      logger.error('Token verification error:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<any> {
    try {
      const { data, error } = await supabaseAdmin
        .from('dietwise_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw new AppError('User not found', 404);
      }

      return data;
    } catch (error) {
      logger.error('Get user error:', error);
      throw error;
    }
  }

  // Verify email
  static async verifyEmail(token: string): Promise<void> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });

      if (error) {
        throw new AppError('Invalid or expired verification token', 400);
      }
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        throw new AppError('Password reset failed', 400);
      }
    } catch (error) {
      logger.error('Password reset error:', error);
      throw error;
    }
  }
}