import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Create Supabase client for client-side operations
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Create Supabase admin client for server-side operations
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl, 
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Test connection
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('dietwise_users').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist (expected initially)
      logger.error('Supabase connection error:', error);
      return false;
    }
    logger.info('✅ Supabase connected successfully');
    return true;
  } catch (error) {
    logger.error('Supabase connection failed:', error);
    return false;
  }
}

// Database types (generated from Supabase)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
          updated_at: string;
          email_verified: boolean;
          avatar_url?: string;
          timezone: string;
          locale: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          created_at?: string;
          updated_at?: string;
          email_verified?: boolean;
          avatar_url?: string;
          timezone?: string;
          locale?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
          email_verified?: boolean;
          avatar_url?: string;
          timezone?: string;
          locale?: string;
        };
      };
      health_profiles: {
        Row: {
          id: string;
          user_id: string;
          encrypted_data: string;
          data_key: string;
          last_modified: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          encrypted_data: string;
          data_key: string;
          last_modified?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          encrypted_data?: string;
          data_key?: string;
          last_modified?: string;
        };
      };
    };
  };
}