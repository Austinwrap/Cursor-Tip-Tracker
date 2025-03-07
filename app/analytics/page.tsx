'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import Header from '../components/Header';
import MonthlyChart from '../components/analytics/MonthlyChart';
import DailyAveragesChart from '../components/analytics/DailyAveragesChart';
import BestWorstDays from '../components/analytics/BestWorstDays';
import Projections from '../components/analytics/Projections';

export default function Analytics() {
  const { user, isPaid, loading } = useAuth();
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

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Analytics Dashboard</h1>
        
        {!isPaid && (
          <div className="bg-gradient-to-r from-purple-900 to-blue-900 border-2 border-purple-500 rounded-lg p-6 shadow-lg mb-8">
            <h2 className="text-xl font-bold mb-2 text-center">Premium Features</h2>
            <p className="text-center mb-4">
              Upgrade to access these powerful analytics tools and maximize your earnings!
            </p>
            <div className="text-center">
              <a 
                href="/upgrade" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-2 px-6 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
              >
                Upgrade Now
              </a>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Monthly Chart */}
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Monthly Earnings</h2>
            
            {isPaid ? (
              <MonthlyChart />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-lg border border-gray-800">
                <div className="text-5xl mb-4">🔒</div>
                <div className="text-xl font-semibold text-gray-400">Premium Feature</div>
                <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
                  Visualize your monthly earnings with beautiful charts
                </p>
              </div>
            )}
          </div>
          
          {/* Daily Averages */}
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Daily Averages</h2>
            
            {isPaid ? (
              <DailyAveragesChart />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-lg border border-gray-800">
                <div className="text-5xl mb-4">🔒</div>
                <div className="text-xl font-semibold text-gray-400">Premium Feature</div>
                <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
                  See which days of the week are most profitable for you
                </p>
              </div>
            )}
          </div>
          
          {/* Best/Worst Days */}
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Best & Worst Days</h2>
            
            {isPaid ? (
              <BestWorstDays />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-lg border border-gray-800">
                <div className="text-5xl mb-4">🔒</div>
                <div className="text-xl font-semibold text-gray-400">Premium Feature</div>
                <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
                  Identify your most and least profitable days
                </p>
              </div>
            )}
          </div>
          
          {/* Projections */}
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Future Projections</h2>
            
            {isPaid ? (
              <Projections />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-lg border border-gray-800">
                <div className="text-5xl mb-4">🔒</div>
                <div className="text-xl font-semibold text-gray-400">Premium Feature</div>
                <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
                  Get AI-powered predictions about your future earnings
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* AI Assistant - Premium Only */}
        <div className="mt-8 bg-gray-900 border-2 border-gray-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">AI Assistant</h2>
          
          {isPaid ? (
            <div>
              <p className="mb-4">Ask our AI assistant about your finances, get personalized advice, and more.</p>
              <div className="bg-black rounded-lg p-4 mb-4 h-64 overflow-y-auto border border-gray-800">
                <div className="text-gray-400 italic text-center mt-24">
                  AI chat would appear here in the full implementation
                </div>
              </div>
              <div className="flex">
                <input 
                  type="text" 
                  placeholder="Ask about your finances..." 
                  className="flex-grow bg-gray-800 border border-gray-700 rounded-l-lg px-4 py-2"
                  disabled
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-r-lg">
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-lg border border-gray-800">
              <div className="text-5xl mb-4">🔒</div>
              <div className="text-xl font-semibold text-gray-400">Premium Feature</div>
              <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
                Chat with our AI assistant about your finances and get personalized advice
              </p>
              <a 
                href="/upgrade" 
                className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-2 px-6 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
              >
                Upgrade to Access
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 