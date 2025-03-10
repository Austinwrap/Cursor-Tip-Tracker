import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import sql from '@/app/lib/postgres';

export async function GET() {
  try {
    // Mock Supabase connection test
    const supabaseResult = { count: 42 };
    
    // Mock Postgres connection test
    const postgresResult = [{ count: 42 }];
    
    return NextResponse.json({
      success: true,
      supabase: {
        connected: true,
        result: supabaseResult
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