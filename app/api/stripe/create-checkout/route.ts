import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/app/lib/supabase';

// Initialize Stripe with the secret key if available
let stripe: Stripe | null = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    // Initialize without specifying API version to use the default
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  } else {
    console.warn('Stripe secret key not found. Using development mode.');
  }
} catch (error) {
  console.warn('Failed to initialize Stripe:', error);
}

// Dummy price IDs for development
const DUMMY_MONTHLY_PRICE_ID = 'price_1234567890';
const DUMMY_ANNUAL_PRICE_ID = 'price_0987654321';

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
    
    // In development mode, directly update the user's subscription status
    if (!stripe || process.env.NODE_ENV === 'development') {
      console.log('Development mode: Enabling premium without Stripe payment');
      
      // Update the user's is_paid status in the database
      const { error } = await supabase
        .from('users')
        .update({ is_paid: true })
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating user subscription status:', error);
        return NextResponse.json(
          { error: 'Failed to update subscription status' },
          { status: 500 }
        );
      }
      
      // Redirect to dashboard with success message
      return NextResponse.json({ 
        success: true,
        url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard?success=true&dev=true`
      });
    }
    
    // For production with Stripe configured
    // Get the price ID based on the selected plan
    let priceId = plan === 'monthly' 
      ? process.env.STRIPE_MONTHLY_PRICE_ID 
      : process.env.STRIPE_ANNUAL_PRICE_ID;
    
    // Use dummy price IDs if real ones aren't available
    if (!priceId) {
      console.warn('Price ID not configured, using dummy price ID');
      priceId = plan === 'monthly' ? DUMMY_MONTHLY_PRICE_ID : DUMMY_ANNUAL_PRICE_ID;
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
      { error: 'Error creating checkout session. Please try again.' },
      { status: 500 }
    );
  }
} 