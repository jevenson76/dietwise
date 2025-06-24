#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function applyRLSOptimization() {
  console.log('🔧 Supabase RLS Performance Optimization\n');
  console.log('This script will optimize your Row Level Security policies to improve query performance.\n');
  
  // Check for credentials
  require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Error: Supabase credentials not found in backend/.env');
    console.log('Please run "npm run enter:credentials" first.\n');
    rl.close();
    return;
  }
  
  console.log('⚠️  WARNING: This will modify your database RLS policies.');
  console.log('   It\'s recommended to backup your database first.\n');
  
  const confirm = await question('Do you want to continue? (yes/no): ');
  
  if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    console.log('\n❌ Migration cancelled.');
    rl.close();
    return;
  }
  
  // Create Supabase client with service role key
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  console.log('\n📝 Reading migration file...');
  const migrationPath = path.join(__dirname, '../supabase/migrations/20240101000000_optimize_rls_policies.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('🚀 Applying RLS optimization...\n');
  
  try {
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    }).single();
    
    if (error) {
      // If the RPC doesn't exist, try direct execution
      console.log('📌 Note: Direct SQL execution via RPC not available.');
      console.log('   Please run the migration manually in Supabase Dashboard.\n');
      console.log('   1. Go to your Supabase Dashboard');
      console.log('   2. Navigate to SQL Editor');
      console.log('   3. Copy and paste the contents of:');
      console.log(`      ${migrationPath}`);
      console.log('   4. Click "Run"\n');
      
      const openFile = await question('Would you like to open the migration file? (yes/no): ');
      if (openFile.toLowerCase() === 'yes' || openFile.toLowerCase() === 'y') {
        console.log(`\nMigration SQL saved at: ${migrationPath}`);
      }
    } else {
      console.log('✅ RLS policies optimized successfully!\n');
      console.log('🎉 Your database queries should now perform much better at scale.');
    }
  } catch (err) {
    console.error('❌ Error applying migration:', err.message);
    console.log('\n📌 Alternative: Apply the migration manually via Supabase Dashboard');
    console.log(`   Migration file: ${migrationPath}`);
  }
  
  rl.close();
}

// Alternative function to check current policies
async function checkCurrentPolicies() {
  require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Error: Supabase credentials not found');
    return;
  }
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  console.log('\n📊 Checking current RLS policies...\n');
  
  const tables = [
    'users', 'health_profiles', 'dietary_preferences', 'meal_plans',
    'food_logging', 'user_analytics', 'dietwise_users', 'dietwise_health_profiles',
    'dietwise_dietary_preferences', 'dietwise_meal_plans', 'dietwise_food_logging',
    'dietwise_user_analytics'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0);
      
      if (!error) {
        console.log(`✅ Table '${table}' is accessible`);
      } else {
        console.log(`⚠️  Table '${table}' - ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}' - Error checking`);
    }
  }
}

// Run the optimization
applyRLSOptimization().catch(console.error);