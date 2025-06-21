// Test fresh signup to see if we get a session
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ozuuombybpfluztjvzdc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96dXVvbWJ5YnBmbHV6dGp2emRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNzIsImV4cCI6MjA2NTkzMDE3Mn0.nItFFmyF4PbgKQ_K8Gi-nztQPrU14iVxsne9B9xnqKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFreshSignup() {
  console.log('Testing fresh signup with email confirmation disabled...');
  
  const email = `test${Date.now()}@dietwise.com`;
  const password = 'securepassword123';
  
  // Test signup
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: { name: 'Fresh User' }
    }
  });
  
  console.log('SignUp Result:', { 
    user: signUpData.user?.id,
    session: signUpData.session?.access_token ? 'Present' : 'Null',
    userConfirmed: signUpData.user?.email_confirmed_at ? 'Yes' : 'No',
    error: signUpError?.message 
  });
  
  if (signUpData.session) {
    console.log('🎉 SUCCESS: Session returned on signup! Email confirmation is disabled.');
    
    // Test immediate login
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    console.log('Immediate Login Result:', { 
      user: signInData.user?.id,
      session: signInData.session?.access_token ? 'Present' : 'Null',
      error: signInError?.message 
    });
  } else {
    console.log('❌ No session returned - email confirmation still required');
  }
}

testFreshSignup().catch(console.error);