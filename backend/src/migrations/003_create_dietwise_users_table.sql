-- Create dietwise_users table (matching Supabase Auth structure)
CREATE TABLE IF NOT EXISTS dietwise_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'en-US',
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_dietwise_users_email ON dietwise_users(email);

-- Create update trigger for updated_at
CREATE TRIGGER update_dietwise_users_updated_at BEFORE UPDATE ON dietwise_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create health_profiles table for storing encrypted health data
CREATE TABLE IF NOT EXISTS health_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES dietwise_users(id) ON DELETE CASCADE,
    encrypted_data TEXT NOT NULL,
    data_key TEXT NOT NULL,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX idx_health_profiles_user_id ON health_profiles(user_id);