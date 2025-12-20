import { testSupabaseConnection } from '../config/supabase';

/**
 * Standalone utility to test Supabase connection
 * Can be run independently or called from server startup
 */
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

// Allow running this file directly: ts-node src/utils/test-supabase.ts
if (require.main === module) {
  runSupabaseTest();
}


