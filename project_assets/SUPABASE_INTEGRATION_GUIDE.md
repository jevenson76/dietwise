# 🚀 DietWise Supabase Integration Guide

## Prerequisites
You'll need from your Supabase project:
- Project URL
- Anon Key
- Service Role Key
- Database Password

## Step 1: Configure Environment Variables

Update your backend `.env` file with:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database (use Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project-id.supabase.co:5432/postgres

# No longer needed (Supabase handles these)
# MONGODB_URI=
# REDIS_URL=
```

## Step 2: Install Supabase Client

```bash
cd backend
npm install @supabase/supabase-js
```

## Step 3: Update Database Config

I'll create a new database service that uses Supabase instead of direct PostgreSQL.

## Step 4: Migration Benefits

### Before (Current):
- Docker PostgreSQL + MongoDB + Redis
- Custom JWT authentication
- Manual session management

### After (With Supabase):
- Supabase PostgreSQL (managed)
- Built-in authentication
- Real-time subscriptions
- Row Level Security
- Edge functions

## Step 5: Schema Migration

We'll migrate your current schema to Supabase with enhanced features:
- User authentication (built-in)
- Health data with RLS
- Real-time updates
- Automatic backups

Would you like me to:
1. **Create the Supabase integration code** (you add credentials later)
2. **Wait for credentials** and do full integration
3. **Provide manual setup instructions**

Please share your Supabase credentials so I can complete the integration!