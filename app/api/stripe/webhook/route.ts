import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Mock webhook handler
    console.log('Received mock Stripe webhook');
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 