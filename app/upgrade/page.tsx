'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import Header from '../components/Header';
import AuthCheck from '../components/AuthCheck';

export default function Upgrade() {
  const { user, isPaid } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'polar'>('stripe');

  const handleUpgradeClick = async (plan: 'monthly' | 'annual' | 'lifetime') => {
    if (!user) {
      router.push('/signin');
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      console.log(`Starting upgrade process for plan: ${plan} using ${paymentMethod}`);
      
      // Create checkout session based on selected payment method
      const endpoint = paymentMethod === 'stripe' 
        ? '/api/stripe/create-checkout' 
        : '/api/polar/create-checkout';
      
      console.log('Sending request to endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          plan,
        }),
      });
      
      console.log('Checkout response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Checkout error:', errorData);
        
        // Handle specific error cases
        if (errorData.details && errorData.details.includes('The string did not match the expected pattern')) {
          throw new Error('Payment configuration error: The API keys are not properly set up. Please contact support.');
        } else if (errorData.error && errorData.error.includes('Invalid API Key')) {
          throw new Error('API key is invalid. Please contact support.');
        } else if (errorData.error && errorData.error.includes('price_id') || errorData.error.includes('product_id')) {
          throw new Error('Price/product configuration is missing. Please contact support.');
        } else {
          throw new Error(errorData.error || 'Failed to create checkout session');
        }
      }
      
      const data = await response.json();
      console.log('Checkout response data:', data);
      
      // Handle development mode
      if (data.dev) {
        setMessage('Development mode: Upgrade successful! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
        return;
      }
      
      // Redirect to checkout
      if (data.url) {
        console.log(`Redirecting to ${paymentMethod} checkout:`, data.url);
        
        // Use window.location.href for a full page redirect
        window.location.href = data.url;
      } else {
        // Fallback for development mode or if no URL is provided
        console.log('No checkout URL returned, using development mode');
        setMessage('Development mode active. Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard?success=true&dev=true');
        }, 1500);
      }
    } catch (err) {
      console.error('Error during upgrade:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during the upgrade process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If user is already paid, redirect to dashboard
  if (isPaid) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-6">You're already a Premium member!</h1>
          <p className="text-xl text-gray-400 mb-8">You already have access to all premium features.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold py-3 px-8 rounded-lg hover:from-cyan-600 hover:to-teal-600 transition-all shadow-lg transform hover:scale-105"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-black text-white">
        <Header />
        
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-400">Upgrade to Premium</h1>
          <p className="text-xl text-gray-400 text-center mb-8">Unlock powerful features to maximize your earnings</p>
          
          {/* Payment Method Selector */}
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-gray-900 rounded-lg p-4 flex justify-center space-x-4">
              <button
                onClick={() => setPaymentMethod('stripe')}
                className={`px-4 py-2 rounded-md transition-all ${
                  paymentMethod === 'stripe' 
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Pay with Stripe
              </button>
              <button
                onClick={() => setPaymentMethod('polar')}
                className={`px-4 py-2 rounded-md transition-all ${
                  paymentMethod === 'polar' 
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Pay with Polar
              </button>
            </div>
            <p className="text-center text-gray-500 text-sm mt-2">
              {paymentMethod === 'stripe' 
                ? 'Stripe: Credit/debit cards accepted worldwide' 
                : 'Polar: Modern payment platform with enhanced features'}
            </p>
          </div>
          
          {error && (
            <div className="max-w-md mx-auto mb-8 bg-red-900/50 border-l-4 border-red-500 text-white p-4 rounded-md">
              <p className="font-bold">Error</p>
              <p>{error}</p>
              {error.includes('configuration') && (
                <p className="mt-2 text-sm">The administrator has been notified. Please try again later.</p>
              )}
            </div>
          )}
          
          {message && (
            <div className="max-w-md mx-auto mb-8 bg-green-900/50 border-l-4 border-green-500 text-white p-4 rounded-md">
              <p className="font-bold">Success</p>
              <p>{message}</p>
            </div>
          )}
          
          {loading ? (
            <div className="max-w-md mx-auto p-8 bg-gray-900 rounded-lg border border-gray-800 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500 mb-4"></div>
              <p className="text-xl">Processing your upgrade...</p>
              <p className="text-gray-400 mt-2">Please wait, you'll be redirected to complete your payment.</p>
              <button
                onClick={() => setLoading(false)}
                className="mt-6 bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Monthly Plan */}
              <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-xl overflow-hidden shadow-xl transform transition-all hover:scale-105 hover:shadow-cyan-500/10">
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">Monthly</h3>
                  <div className="text-4xl font-bold mb-4">$6<span className="text-xl text-gray-400">/month</span></div>
                  <p className="text-gray-400 mb-6">Perfect for short-term tracking</p>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Advanced Analytics
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Earnings Projections
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Data Export
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Cancel Anytime
                    </li>
                  </ul>
                  
                  <button
                    onClick={() => handleUpgradeClick('monthly')}
                    className={`w-full font-bold py-3 px-4 rounded-lg transition-all shadow-lg ${
                      paymentMethod === 'stripe'
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white'
                        : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white'
                    }`}
                  >
                    Choose Monthly
                  </button>
                </div>
              </div>
              
              {/* Annual Plan */}
              <div className="bg-gradient-to-br from-cyan-900/40 to-black border border-cyan-500/30 rounded-xl overflow-hidden shadow-xl transform transition-all hover:scale-105 hover:shadow-cyan-500/20">
                <div className="absolute top-0 right-0 bg-cyan-600 text-white px-4 py-1 rounded-bl-lg font-medium text-sm">
                  BEST VALUE
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">Annual</h3>
                  <div className="text-4xl font-bold mb-4">$30<span className="text-xl text-gray-400">/year</span></div>
                  <p className="text-gray-400 mb-6">Save 58% compared to monthly</p>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Advanced Analytics
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Earnings Projections
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Data Export
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Priority Support
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-cyan-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      58% Savings
                    </li>
                  </ul>
                  
                  <button
                    onClick={() => handleUpgradeClick('annual')}
                    className={`w-full font-bold py-3 px-4 rounded-lg transition-all shadow-lg ${
                      paymentMethod === 'stripe'
                        ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                    }`}
                  >
                    Choose Annual
                  </button>
                </div>
              </div>
              
              {/* Lifetime Plan */}
              <div className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 rounded-xl overflow-hidden shadow-xl transform transition-all hover:scale-105 hover:shadow-purple-500/20">
                <div className="absolute top-0 right-0 bg-purple-600 text-white px-4 py-1 rounded-bl-lg font-medium text-sm">
                  LIFETIME ACCESS
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">Lifetime</h3>
                  <div className="text-4xl font-bold mb-4">$99<span className="text-xl text-gray-400">/once</span></div>
                  <p className="text-gray-400 mb-6">Pay once, use forever</p>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      All Premium Features
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      No Recurring Payments
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Lifetime Updates
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Priority Support
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Best Long-term Value
                    </li>
                  </ul>
                  
                  <button
                    onClick={() => handleUpgradeClick('lifetime')}
                    className={`w-full font-bold py-3 px-4 rounded-lg transition-all shadow-lg ${
                      paymentMethod === 'stripe'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                    }`}
                  >
                    Choose Lifetime
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Payment Method Information */}
          <div className="mt-12 max-w-3xl mx-auto text-center">
            <h3 className="text-xl font-semibold mb-4">About {paymentMethod === 'stripe' ? 'Stripe' : 'Polar'} Payments</h3>
            <p className="text-gray-400 mb-4">
              {paymentMethod === 'stripe' 
                ? 'Stripe is a secure payment processor trusted by millions of businesses worldwide. Your payment information is encrypted and never stored on our servers.'
                : 'Polar is a modern payment platform designed specifically for digital products. It offers enhanced features and a seamless checkout experience.'}
            </p>
            <div className="flex justify-center space-x-4 mt-4">
              {paymentMethod === 'stripe' ? (
                <img src="/stripe-logo.png" alt="Stripe" className="h-8" />
              ) : (
                <div className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                  Powered by Polar.sh
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
} 