import { testSupabaseConnection } from '../config/supabase';

export async function runSupabaseTest(): Promise<void> {
  console.log('Testing Supabase connection...');
  const isConnected = await testSupabaseConnection();
  
  if (isConnected) {
    console.log('✅ Supabase connection successful');
    process.exit(0);
  } else {
    console.error('❌ Supabase connection failed');
    process.exit(1);
  }
}

if (require.main === module) {
  runSupabaseTest();
}


