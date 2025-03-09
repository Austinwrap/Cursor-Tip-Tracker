import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/app/lib/supabase';

// Initialize Stripe with the secret key if available
let stripe: Stripe | null = null;

// Only initialize Stripe if we're in a runtime environment (not during build)
if (typeof process !== 'undefined' && process.env.STRIPE_SECRET_KEY) {
  try {
    // Initialize Stripe with the latest API version
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia', // Updated to match the expected type
    });
    console.log('Stripe initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
  }
} else {
  console.warn('Stripe secret key not found. Using development mode.');
}

// Dummy price IDs for development
const DUMMY_MONTHLY_PRICE_ID = 'price_1234567890';
const DUMMY_ANNUAL_PRICE_ID = 'price_0987654321';
const DUMMY_LIFETIME_PRICE_ID = 'price_9876543210';

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
      
      try {
        // Update the user's is_paid status in the database
        const { error } = await supabase
          .from('users')
          .update({ 
            is_paid: true,
            subscription_type: plan,
            plan_type: plan === 'monthly' ? 'starter' : plan === 'annual' ? 'pro' : 'ultimate',
            premium_features_enabled: true,
            subscription_status: plan === 'lifetime' ? 'lifetime' : 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
          
        if (error) {
          console.error('Error updating user subscription status:', error);
          return NextResponse.json(
            { error: 'Failed to update subscription status' },
            { status: 500 }
          );
        }
        
        // Also record the purchase in the purchases table if it exists
        try {
          await supabase
            .from('purchases')
            .insert([{
              user_id: userId,
              plan_type: plan === 'monthly' ? 'starter' : plan === 'annual' ? 'pro' : 'ultimate',
              subscription_type: plan,
              amount: plan === 'monthly' ? 6 : plan === 'annual' ? 30 : 99,
              currency: 'USD',
              payment_processor: 'development',
              payment_id: `dev_${Date.now()}`,
              purchase_date: new Date().toISOString(),
              metadata: { development_mode: true }
            }]);
        } catch (purchaseError) {
          // Don't fail if purchases table doesn't exist
          console.warn('Could not record purchase in development mode:', purchaseError);
        }
        
        // Redirect to dashboard with success message
        return NextResponse.json({ 
          success: true,
          dev: true,
          url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard?success=true&dev=true&plan=${plan}`
        });
      } catch (devModeError) {
        console.error('Error in development mode:', devModeError);
        return NextResponse.json(
          { error: 'Error in development mode', details: devModeError.message },
          { status: 500 }
        );
      }
    }
    
    // For production with Stripe configured
    console.log('Creating Stripe checkout session for plan:', plan);
    
    // Get the price ID based on the selected plan
    let priceId;
    let mode: 'subscription' | 'payment' = 'subscription';
    
    if (plan === 'monthly') {
      priceId = process.env.STRIPE_MONTHLY_PRICE_ID;
    } else if (plan === 'annual') {
      priceId = process.env.STRIPE_ANNUAL_PRICE_ID;
    } else if (plan === 'lifetime') {
      priceId = process.env.STRIPE_LIFETIME_PRICE_ID;
      mode = 'payment'; // One-time payment for lifetime plan
    }
    
    if (!priceId) {
      console.error(`Price ID not configured for plan: ${plan}`);
      return NextResponse.json(
        { error: `Stripe price ID not configured for ${plan} plan` },
        { status: 500 }
      );
    }
    
    console.log('Using price ID:', priceId, 'with mode:', mode);
    
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: mode,
        success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard?success=true&plan=${plan}`,
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