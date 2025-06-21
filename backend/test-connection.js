// Test Supabase connection and table existence
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ozuuombybpfluztjvzdc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96dXVvbWJ5YnBmbHV6dGp2emRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM1NDE3MiwiZXhwIjoyMDY1OTMwMTcyfQ.YNM0BoGFkAZqrvBIs4pfNrd_kCX1-2tMrbuLdecZRd0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing table existence...');
  
  // Test if dietwise_users table exists
  const { data, error } = await supabase
    .from('dietwise_users')
    .select('count')
    .limit(1);
  
  if (error) {
    console.log('❌ Table error:', error.message);
    console.log('Error code:', error.code);
  } else {
    console.log('✅ Table exists and accessible');
    console.log('Data:', data);
  }
}

testConnection().catch(console.error);