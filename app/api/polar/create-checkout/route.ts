import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// This is the Polar.sh checkout integration
// You'll need to add your Polar.sh organization identifier and access token to .env.local

export async function POST(request: Request) {
  try {
    const { plan, userId } = await request.json();
    
    console.log('Polar checkout request received:', { plan, userId });
    
    if (!userId) {
      console.error('User ID is required but was not provided');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Check if Polar.sh configuration is available
    const polarOrgIdentifier = process.env.POLAR_ORG_IDENTIFIER;
    const polarAccessToken = process.env.POLAR_ACCESS_TOKEN;
    
    if (!polarOrgIdentifier || !polarAccessToken) {
      console.error('Polar.sh configuration is missing');
      
      // For development, enable premium without payment
      if (process.env.NODE_ENV === 'development') {
        console.log('Using development mode: Enabling premium without payment');
        
        // Update the user's is_paid status in the database
        const { error } = await supabase
          .from('users')
          .update({ 
            is_paid: true,
            subscription_type: plan 
          })
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
      
      return NextResponse.json(
        { error: 'Polar.sh configuration is missing' },
        { status: 500 }
      );
    }
    
    // For production with Polar.sh configured
    console.log('Creating Polar.sh checkout session for plan:', plan);
    
    // Get the product ID based on the selected plan
    let productId;
    
    if (plan === 'monthly') {
      productId = process.env.POLAR_MONTHLY_PRODUCT_ID;
    } else if (plan === 'annual') {
      productId = process.env.POLAR_ANNUAL_PRODUCT_ID;
    } else if (plan === 'lifetime') {
      productId = process.env.POLAR_LIFETIME_PRODUCT_ID;
    }
    
    if (!productId) {
      console.error(`Product ID not configured for plan: ${plan}`);
      return NextResponse.json(
        { error: `Polar.sh product ID not configured for ${plan} plan` },
        { status: 500 }
      );
    }
    
    console.log('Using product ID:', productId);
    
    try {
      // Create a checkout session with Polar.sh API
      const response = await fetch(`https://api.polar.sh/api/v1/checkouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${polarAccessToken}`
        },
        body: JSON.stringify({
          organization_slug: polarOrgIdentifier,
          product_id: productId,
          success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard?success=true&plan=${plan}`,
          cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/upgrade?canceled=true`,
          metadata: {
            userId: userId,
            plan: plan
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Polar.sh error creating checkout session:', errorData);
        return NextResponse.json(
          { error: 'Error creating checkout session', details: errorData },
          { status: 500 }
        );
      }
      
      const session = await response.json();
      console.log('Polar.sh checkout session created:', session.id);
      
      return NextResponse.json({ 
        sessionId: session.id, 
        url: session.url || `https://polar.sh/checkout/${session.id}`
      });
    } catch (polarError: any) {
      console.error('Polar.sh error creating checkout session:', polarError);
      
      return NextResponse.json(
        { error: 'Error creating checkout session. Please try again.', details: polarError.message },
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