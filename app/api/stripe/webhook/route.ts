import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/app/lib/supabase';

// Initialize Stripe only if the secret key is available
let stripe: Stripe | null = null;

// Only initialize Stripe if we're in a runtime environment (not during build)
if (typeof process !== 'undefined' && process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    });
    console.log('Stripe initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
  }
} else {
  console.warn('Stripe secret key not found. Using development mode.');
}

// Webhook secret for verifying events
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    // Check if Stripe is initialized
    if (!stripe) {
      console.log('Stripe not initialized, running in development mode');
      return NextResponse.json({ 
        error: 'Stripe is not configured', 
        dev: true 
      }, { status: 200 });
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    let event;

    // Verify webhook signature
    try {
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
      } else {
        // For development without webhook secret
        event = JSON.parse(body);
        console.warn('⚠️ Webhook signature verification bypassed');
      }
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    console.log(`Event received: ${event.type}`);

    // Handle specific events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get customer ID and user ID from session
        const customerId = session.customer as string;
        const userId = session.client_reference_id;
        
        if (!userId) {
          console.error('No user ID found in session');
          return NextResponse.json({ error: 'No user ID found' }, { status: 400 });
        }
        
        console.log(`Processing completed checkout for user: ${userId}`);
        
        // Update user's subscription status in database
        const { error } = await supabase
          .from('users')
          .update({ 
            is_paid: true,
            stripe_customer_id: customerId,
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (error) {
          console.error('Error updating user subscription status:', error);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
        
        console.log(`User ${userId} subscription activated successfully`);
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find user with this customer ID
        const { data: users, error: findError } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId);
        
        if (findError || !users || users.length === 0) {
          console.error('Error finding user with customer ID:', customerId);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        const userId = users[0].id;
        const status = subscription.status;
        
        // Update subscription status
        const { error } = await supabase
          .from('users')
          .update({ 
            subscription_status: status,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (error) {
          console.error('Error updating subscription status:', error);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
        
        console.log(`User ${userId} subscription updated to ${status}`);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find user with this customer ID
        const { data: users, error: findError } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId);
        
        if (findError || !users || users.length === 0) {
          console.error('Error finding user with customer ID:', customerId);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        const userId = users[0].id;
        
        // Update user's subscription status
        const { error } = await supabase
          .from('users')
          .update({ 
            is_paid: false,
            subscription_status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (error) {
          console.error('Error updating user subscription status:', error);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
        
        console.log(`User ${userId} subscription canceled`);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
} 