import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/app/lib/supabase';

// Initialize Stripe with the secret key if available
let stripe: Stripe | null = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }
} catch (error) {
  console.warn('Failed to initialize Stripe:', error);
}

// This is your Stripe webhook secret for testing your endpoint locally
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  // Check if Stripe is initialized
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 }
    );
  }

  const payload = await request.text();
  const sig = request.headers.get('stripe-signature') as string;

  let event;

  try {
    if (!endpointSecret) {
      throw new Error('Stripe webhook secret is not set');
    }
    
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Get the user ID from the session metadata
      const userId = session.metadata?.userId || session.client_reference_id;
      
      if (userId) {
        // Update the user's subscription status in the database
        const { error } = await supabase
          .from('users')
          .update({ is_paid: true })
          .eq('id', userId);
          
        if (error) {
          console.error('Error updating user subscription status:', error);
        }
      }
      break;
      
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      
      // Get the customer ID
      const customerId = subscription.customer as string;
      
      // Find the user with this customer ID
      const { data: users, error } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();
        
      if (error) {
        console.error('Error finding user with customer ID:', error);
      } else if (users) {
        // Update the user's subscription status
        const { error: updateError } = await supabase
          .from('users')
          .update({ is_paid: false })
          .eq('id', users.id);
          
        if (updateError) {
          console.error('Error updating user subscription status:', updateError);
        }
      }
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
} 