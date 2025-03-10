import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import sql from '@/app/lib/postgres';

export async function GET() {
  try {
    // Test Supabase connection
    const supabaseResult = await supabase.from('tips').select('count').single();
    
    // Test Postgres connection
    const postgresResult = await sql`SELECT COUNT(*) FROM tips`;
    
    return NextResponse.json({
      success: true,
      supabase: {
        connected: !supabaseResult.error,
        result: supabaseResult.error ? supabaseResult.error.message : supabaseResult.data
      },
      postgres: {
        connected: true,
        result: postgresResult
      }
    });
  } catch (error) {
    console.error('Connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 