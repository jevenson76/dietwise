import { z } from 'zod';

// User validation schemas
export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12).max(100),
  name: z.string().min(1).max(100),
  timezone: z.string().default('UTC'),
  locale: z.string().default('en-US'),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  preferences: z.object({
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    darkMode: z.boolean().optional(),
  }).optional(),
});

// TypeScript types
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  email_verified: boolean;
  timezone: string;
  locale: string;
  avatar_url?: string;
  auth_provider: 'email' | 'google' | 'apple' | 'facebook';
  auth_provider_id?: string;
  mfa_enabled: boolean;
  mfa_secret?: string;
  status: 'active' | 'suspended' | 'deleted';
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
  email_verification_token?: string;
  email_verification_expires?: Date;
  password_reset_token?: string;
  password_reset_expires?: Date;
}

export interface UserSession {
  id: string;
  user_id: string;
  refresh_token: string;
  device_info?: string;
  ip_address?: string;
  expires_at: Date;
  created_at: Date;
}