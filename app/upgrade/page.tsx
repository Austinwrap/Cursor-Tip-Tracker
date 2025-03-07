'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import Header from '../components/Header';

export default function Upgrade() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </main>
    );
  }

  const handleUpgradeClick = (plan: string) => {
    // This would connect to Stripe in a real implementation
    alert(`In a real implementation, this would redirect to Stripe payment for the ${plan} plan.`);
    
    // For demo purposes, we'll just show an alert
    console.log(`User selected ${plan} plan`);
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
        
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Premium Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
              <div className="text-blue-400 text-3xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Advanced Analytics</h3>
              <p className="text-gray-400">Visualize your earnings with beautiful charts and graphs. Track trends over time and identify patterns.</p>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
              <div className="text-blue-400 text-3xl mb-4">🔮</div>
              <h3 className="text-xl font-bold mb-2">AI Forecasting</h3>
              <p className="text-gray-400">Get AI-powered predictions about your future earnings based on your historical data.</p>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
              <div className="text-blue-400 text-3xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">AI Chat Assistant</h3>
              <p className="text-gray-400">Chat with our AI assistant about your finances, get personalized advice, and more.</p>
            </div>
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