import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// Webhook secret for verifying events
const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    // Get the raw request body
    const body = await request.text();
    const signature = request.headers.get('polar-signature') || '';
    
    // Verify webhook signature if secret is available
    if (webhookSecret) {
      // In a production environment, you should verify the signature
      // This is a simplified example - in production, implement proper HMAC verification
      if (!signature) {
        console.error('Webhook signature missing');
        return NextResponse.json({ error: 'Webhook signature missing' }, { status: 400 });
      }
      
      // Note: Implement proper signature verification based on Polar.sh documentation
    } else {
      console.warn('⚠️ Webhook signature verification bypassed - webhook secret not configured');
    }
    
    // Parse the webhook payload
    const event = JSON.parse(body);
    console.log(`Polar.sh event received: ${event.type}`);
    
    // Handle specific events
    switch (event.type) {
      case 'checkout.session.completed': {
        // Extract relevant data from the event
        const session = event.data;
        const metadata = session.metadata || {};
        const userId = metadata.userId;
        const plan = metadata.plan || 'monthly';
        const planType = metadata.plan_type || (plan === 'monthly' ? 'starter' : plan === 'annual' ? 'pro' : 'ultimate');
        
        if (!userId) {
          console.error('No user ID found in session metadata');
          return NextResponse.json({ error: 'No user ID found' }, { status: 400 });
        }
        
        console.log(`Processing completed checkout for user: ${userId}, plan: ${plan}, plan type: ${planType}`);
        
        // Update user's subscription status in database
        const updateData: any = { 
          is_paid: true,
          subscription_type: plan,
          plan_type: planType,
          premium_features_enabled: true,
          updated_at: new Date().toISOString()
        };
        
        // Set subscription status based on plan type
        if (plan === 'monthly' || plan === 'annual') {
          updateData.subscription_status = 'active';
        } else if (plan === 'lifetime') {
          updateData.subscription_status = 'lifetime';
        }
        
        // Store additional customer information if available
        if (session.customer) {
          updateData.customer_name = session.customer.name || '';
          updateData.customer_email = session.customer.email || '';
          updateData.customer_id = session.customer.id || '';
        }
        
        // Update the user record in Supabase
        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', userId);
        
        if (error) {
          console.error('Error updating user subscription status:', error);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
        
        // Also store the purchase in a separate table for record-keeping
        const { error: purchaseError } = await supabase
          .from('purchases')
          .insert({
            user_id: userId,
            plan_type: planType,
            subscription_type: plan,
            amount: session.amount_total || 0,
            currency: session.currency || 'USD',
            payment_processor: 'polar',
            payment_id: session.id || '',
            purchase_date: new Date().toISOString(),
            metadata: metadata
          });
        
        if (purchaseError) {
          console.error('Error recording purchase:', purchaseError);
          // Continue anyway, as the user's status has been updated
        }
        
        console.log(`User ${userId} subscription activated successfully with plan: ${plan}`);
        break;
      }
      
      case 'subscription.created':
      case 'subscription.updated': {
        const subscription = event.data;
        const metadata = subscription.metadata || {};
        const userId = metadata.userId;
        
        if (!userId) {
          console.error('No user ID found in subscription metadata');
          return NextResponse.json({ error: 'No user ID found' }, { status: 400 });
        }
        
        const status = subscription.status;
        const planType = metadata.plan_type || 'starter';
        
        // Update subscription status
        const { error } = await supabase
          .from('users')
          .update({ 
            subscription_status: status,
            premium_features_enabled: status === 'active',
            plan_type: planType,
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
      
      case 'subscription.deleted':
      case 'subscription.canceled': {
        const subscription = event.data;
        const metadata = subscription.metadata || {};
        const userId = metadata.userId;
        
        if (!userId) {
          console.error('No user ID found in subscription metadata');
          return NextResponse.json({ error: 'No user ID found' }, { status: 400 });
        }
        
        const subscriptionType = metadata.subscription_type || metadata.plan || 'monthly';
        
        // Don't change status for lifetime subscriptions
        if (subscriptionType === 'lifetime') {
          console.log(`User ${userId} has a lifetime subscription, not changing status`);
          return NextResponse.json({ received: true });
        }
        
        // Update user's subscription status
        const { error } = await supabase
          .from('users')
          .update({ 
            is_paid: false,
            subscription_status: 'canceled',
            premium_features_enabled: false,
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
      
      case 'payment.succeeded': {
        // This event is triggered for one-time payments (like lifetime plan)
        const payment = event.data;
        const metadata = payment.metadata || {};
        const userId = metadata.userId;
        const plan = metadata.plan || metadata.subscription_type;
        const planType = metadata.plan_type || 'ultimate';
        
        if (!userId) {
          console.log('Payment without user ID, ignoring');
          return NextResponse.json({ received: true });
        }
        
        // Only process if this is a lifetime plan
        if (plan === 'lifetime') {
          console.log(`Processing lifetime payment for user: ${userId}`);
          
          const { error } = await supabase
            .from('users')
            .update({ 
              is_paid: true,
              subscription_status: 'lifetime',
              subscription_type: 'lifetime',
              plan_type: planType,
              premium_features_enabled: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
          
          if (error) {
            console.error('Error updating user lifetime status:', error);
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
          }
          
          console.log(`User ${userId} lifetime access activated`);
        }
        
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