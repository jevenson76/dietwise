// Test direct Supabase login
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ozuuombybpfluztjvzdc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96dXVvbWJ5YnBmbHV6dGp2emRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNzIsImV4cCI6MjA2NTkzMDE3Mn0.nItFFmyF4PbgKQ_K8Gi-nztQPrU14iVxsne9B9xnqKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectLogin() {
  console.log('Testing direct Supabase login...');
  
  // Test login with newtest@dietwise.com
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'newtest@dietwise.com',
    password: 'securepassword123'
  });
  
  console.log('Login Result:', { 
    user: signInData.user?.id,
    session: signInData.session?.access_token ? 'Present' : 'Null',
    error: signInError?.message 
  });
  
  if (signInError) {
    console.log('Full error:', signInError);
  }
}

testDirectLogin().catch(console.error);