'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';

export default function Upgrade() {
  const { user, isPaid, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const handleUpgradeClick = async (plan: string) => {
    try {
      // Call the Stripe checkout API
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          userId: user?.id,
        }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
        alert('There was an error creating the checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('There was an error creating the checkout session. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-10 left-20 w-40 h-40 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">Upgrade to Premium</h1>
          <p className="text-xl text-center text-gray-400 mb-12">Unlock powerful features to maximize your earnings</p>
        </div>
        
        {/* Featured AI Chat Preview */}
        <div className="mb-16 max-w-4xl mx-auto bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
              <div className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-2 py-1 rounded-full mb-2">NEW</div>
              <h2 className="text-2xl font-bold mb-4">AI Chat Assistant</h2>
              <p className="text-gray-300 mb-4">
                Our new AI Chat Assistant helps you analyze your tips and earnings with natural language. Just ask questions like:
              </p>
              <ul className="space-y-2 text-gray-300 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  "What was my best tipping day last month?"
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  "How much did I make this day last year?"
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  "What's my average tip on Fridays?"
                </li>
              </ul>
            </div>
            <div className="md:w-1/2 bg-black/40 backdrop-blur-sm rounded-lg border border-purple-400/20 p-4">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-white text-xs">You</span>
                  </div>
                  <div className="bg-blue-600/50 rounded-lg p-3 text-white">
                    What was my average tip last week?
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-white text-xs">AI</span>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 text-gray-300">
                    Last week your average tip was $178.50 per shift, which is 12% higher than your overall average!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden transition-all hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6">
              <h2 className="text-2xl font-bold text-center">Monthly Plan</h2>
              <div className="text-center mt-4">
                <span className="text-4xl font-bold">$6</span>
                <span className="text-gray-300">/month</span>
              </div>
            </div>
            
            <div className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>All free features</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Monthly and yearly earnings charts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Day of week analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Best and worst days tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>AI Chat Assistant</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Cancel anytime</span>
                </li>
              </ul>
              
              <button 
                onClick={() => handleUpgradeClick('monthly')}
                className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
              >
                Choose Monthly
              </button>
            </div>
          </div>
          
          {/* Annual Plan */}
          <div className="bg-gray-900 border border-yellow-500 rounded-lg overflow-hidden transition-all hover:shadow-lg hover:shadow-yellow-500/20 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-0 right-0 bg-yellow-500 text-black font-bold px-4 py-1 rounded-bl-lg">
              BEST VALUE
            </div>
            <div className="absolute -top-1 -right-1 w-24 h-24 overflow-hidden">
              <div className="absolute top-0 right-0 bg-yellow-500 text-black font-bold px-8 py-1 rotate-45 translate-y-3 translate-x-2 text-xs">
                SAVE 58%
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-800 to-yellow-600 p-6">
              <h2 className="text-2xl font-bold text-center">Annual Plan</h2>
              <div className="text-center mt-4">
                <span className="text-4xl font-bold">$30</span>
                <span className="text-gray-300">/year</span>
                <div className="text-sm mt-1 text-yellow-300">Save 58% vs monthly</div>
              </div>
            </div>
            
            <div className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>All free features</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Monthly and yearly earnings charts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Day of week analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Best and worst days tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>AI Chat Assistant</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Priority support</strong></span>
                </li>
              </ul>
              
              <button 
                onClick={() => handleUpgradeClick('annual')}
                className="w-full mt-8 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold py-3 px-4 rounded-lg hover:from-yellow-500 hover:to-yellow-400 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/20"
              >
                Choose Annual
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-black/30 backdrop-blur-sm border border-gray-800 rounded-lg p-5 shadow-lg">
          <h3 className="text-xl font-bold mb-6 text-center text-yellow-400">Premium Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 hover:border-yellow-500/50 transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="bg-yellow-500/20 rounded-full p-2 mr-3 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.35-.035-.691-.1-1.02A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-semibold text-white">AI Chat Assistant</h4>
              </div>
              <p className="text-gray-400 text-sm ml-10">Get personalized insights about your tips and earnings from our AI.</p>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 hover:border-yellow-500/50 transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="bg-yellow-500/20 rounded-full p-2 mr-3 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-white">Advanced Analytics</h4>
              </div>
              <p className="text-gray-400 text-sm ml-10">Discover your best days, trends, and patterns with interactive charts.</p>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 hover:border-yellow-500/50 transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="bg-yellow-500/20 rounded-full p-2 mr-3 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-semibold text-white">Future Projections</h4>
              </div>
              <p className="text-gray-400 text-sm ml-10">Get AI-powered predictions about your future earnings potential.</p>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 hover:border-yellow-500/50 transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="bg-yellow-500/20 rounded-full p-2 mr-3 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-white">Optimization Tips</h4>
              </div>
              <p className="text-gray-400 text-sm ml-10">Receive personalized recommendations to maximize your earnings.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-xl font-bold mb-4 text-center text-yellow-400">Premium Dashboard Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="bg-yellow-500 rounded-full p-2 mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-1">AI Chat Assistant</h4>
                <p className="text-gray-400 text-sm">Ask questions about your tips and get personalized insights from our AI.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-yellow-500 rounded-full p-2 mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Complete Tip History</h4>
                <p className="text-gray-400 text-sm">View and analyze your entire tip history with detailed breakdowns.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-yellow-500 rounded-full p-2 mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Advanced Analytics</h4>
                <p className="text-gray-400 text-sm">Discover your best days, trends, and patterns with interactive charts.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-yellow-500 rounded-full p-2 mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Future Projections</h4>
                <p className="text-gray-400 text-sm">Get AI-powered predictions about your future earnings potential.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <img src="/premium-dashboard-preview.png" alt="Premium Dashboard Preview" className="rounded-lg shadow-lg mx-auto max-w-full opacity-80 hover:opacity-100 transition-opacity duration-300" />
            <p className="text-sm text-gray-500 mt-2">Preview of the Premium Dashboard</p>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4">100% Satisfaction Guarantee</h3>
            <p className="text-gray-400 mb-4">
              If you're not completely satisfied with your premium subscription, we'll refund your payment within the first 14 days. No questions asked.
            </p>
            <div className="flex justify-center space-x-4 mt-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span>No contracts</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span>Secure payments</span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-400 mt-8">
            Questions? Contact us at <a href="mailto:support@cursortiptracker.com" className="text-blue-400 hover:underline">support@cursortiptracker.com</a>
          </p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
} 