// Simple test to check Supabase auth directly
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jabsotyzukoaqynmwscv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphYnNvdHl6dWtvYXF5bm13c2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5ODYzOTYsImV4cCI6MjA2MzU2MjM5Nn0.FZcrFbQTxZ7zlEVa-0euQCvpaQb5bHdcu1hPERz4rIM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('Testing Supabase auth directly...');
  
  // Test registration
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: 'directtest@dietwise.com',
    password: 'securepassword123',
    options: {
      data: { name: 'Direct Test' }
    }
  });
  
  console.log('SignUp Result:', { 
    user: signUpData.user?.id,
    session: signUpData.session?.access_token ? 'Present' : 'Null',
    error: signUpError?.message 
  });
  
  // Test login
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'directtest@dietwise.com',
    password: 'securepassword123'
  });
  
  console.log('SignIn Result:', { 
    user: signInData.user?.id,
    session: signInData.session?.access_token ? 'Present' : 'Null',
    error: signInError?.message 
  });
}

testAuth().catch(console.error);