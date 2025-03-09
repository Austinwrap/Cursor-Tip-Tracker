import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/app/lib/supabase';

// Initialize Stripe with the secret key if available
let stripe: Stripe | null = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    // Initialize Stripe with the latest API version
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia', // Updated to match the expected type
    });
    console.log('Stripe initialized successfully');
  } else {
    console.warn('Stripe secret key not found. Using development mode.');
  }
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
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
    
    console.log('Checkout request received:', { plan, userId });
    
    if (!userId) {
      console.error('User ID is required but was not provided');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // For development or if Stripe is not properly configured, use development mode
    if (!stripe || process.env.NODE_ENV === 'development') {
      console.log('Using development mode: Enabling premium without Stripe payment');
      
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
        dev: true,
        url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard?success=true&dev=true`
      });
    }
    
    // For production with Stripe configured
    console.log('Creating Stripe checkout session for plan:', plan);
    
    // Get the price ID based on the selected plan
    const priceId = plan === 'monthly' 
      ? process.env.STRIPE_MONTHLY_PRICE_ID 
      : process.env.STRIPE_ANNUAL_PRICE_ID;
    
    if (!priceId) {
      console.error('Price ID not configured');
      return NextResponse.json(
        { error: 'Stripe price ID not configured' },
        { status: 500 }
      );
    }
    
    console.log('Using price ID:', priceId);
    
    try {
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
        client_reference_id: userId,
        metadata: {
          userId: userId,
          plan: plan
        },
      });
      
      console.log('Checkout session created:', session.id);
      return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (stripeError: any) {
      console.error('Stripe error creating checkout session:', stripeError);
      
      // Provide more detailed error information
      let errorMessage = 'Error creating checkout session. Please try again.';
      
      if (stripeError.type === 'StripeInvalidRequestError') {
        if (stripeError.message.includes('No such price')) {
          errorMessage = 'Invalid price ID. Please contact support.';
        } else if (stripeError.message.includes('api_key')) {
          errorMessage = 'Stripe API key issue. Please contact support.';
        }
      }
      
      return NextResponse.json(
        { error: errorMessage, details: stripeError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session. Please try again.', details: error.message },
      { status: 500 }
    );
  }
} 