import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/app/lib/supabase';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10', // Use the latest API version
});

// This is a placeholder for the actual Stripe integration
// You'll need to install the Stripe package: npm install stripe
// And add your Stripe secret key to .env.local: STRIPE_SECRET_KEY=your_key

export async function POST(request: Request) {
  try {
    const { plan, userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Get the price ID based on the selected plan
    const priceId = plan === 'monthly' 
      ? process.env.STRIPE_MONTHLY_PRICE_ID 
      : process.env.STRIPE_ANNUAL_PRICE_ID;
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured' },
        { status: 500 }
      );
    }
    
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/upgrade?canceled=true`,
      client_reference_id: userId, // Store the user ID for the webhook
      metadata: {
        userId: userId,
      },
    });
    
    return NextResponse.json({ sessionId: session.id, url: session.url });
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
} 