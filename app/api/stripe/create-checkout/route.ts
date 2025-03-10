import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function POST(request: Request) {
  try {
    const { plan } = await request.json();
    
    // Mock response for development
    return NextResponse.json({
      success: true,
      url: `https://example.com/checkout?plan=${plan}`,
      message: 'This is a mock checkout URL for development purposes.'
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 