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
        <h1 className="text-4xl font-bold mb-2 text-center">Upgrade to Premium</h1>
        <p className="text-xl text-center text-gray-400 mb-12">Unlock powerful features to maximize your earnings</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg overflow-hidden transition-all hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20">
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
                  <span>AI-powered earnings forecasts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Cancel anytime</span>
                </li>
              </ul>
              
              <button 
                onClick={() => handleUpgradeClick('monthly')}
                className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Choose Monthly
              </button>
            </div>
          </div>
          
          {/* Annual Plan */}
          <div className="bg-gray-900 border-2 border-yellow-500 rounded-lg overflow-hidden transition-all hover:shadow-lg hover:shadow-yellow-500/20 relative">
            <div className="absolute top-0 right-0 bg-yellow-500 text-black font-bold px-4 py-1 rounded-bl-lg">
              BEST VALUE
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
                  <span>AI-powered earnings forecasts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Priority support</strong></span>
                </li>
              </ul>
              
              <button 
                onClick={() => handleUpgradeClick('annual')}
                className="w-full mt-8 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold py-3 px-4 rounded-lg hover:from-yellow-700 hover:to-yellow-600 transition-all"
              >
                Choose Annual
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Premium Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <div className="text-blue-400 text-3xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Advanced Analytics</h3>
              <p className="text-gray-400">Visualize your earnings with beautiful charts and graphs. Track trends over time and identify patterns.</p>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <div className="text-blue-400 text-3xl mb-4">🔮</div>
              <h3 className="text-xl font-bold mb-2">AI Forecasting</h3>
              <p className="text-gray-400">Get AI-powered predictions about your future earnings based on your historical data.</p>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <div className="text-blue-400 text-3xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">AI Assistant</h3>
              <p className="text-gray-400">Chat with our AI assistant about your finances, get personalized advice, and more.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-400">
            Questions? Contact us at <a href="mailto:support@cursortiptracker.com" className="text-blue-400 hover:underline">support@cursortiptracker.com</a>
          </p>
        </div>
      </div>
    </main>
  );
} 