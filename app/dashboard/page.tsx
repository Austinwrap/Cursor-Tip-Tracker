'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import Header from '../components/Header';
import TipForm from '../components/TipForm';
import TipCalendar from '../components/TipCalendar';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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
        <h1 className="text-3xl font-bold mb-8 text-center">Track Your Tips</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <div className="bg-gray-900 border border-gray-700 hover:border-blue-500 rounded-lg p-6 shadow-lg transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 text-center">Select Date</h2>
            <TipCalendar 
              selectedDate={selectedDate} 
              onDateSelect={setSelectedDate} 
            />
          </div>
          
          {/* Tip Form Section */}
          <div className="bg-gray-900 border border-gray-700 hover:border-blue-500 rounded-lg p-6 shadow-lg transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 text-center">Enter Tips</h2>
            <TipForm selectedDate={selectedDate} />
          </div>
        </div>
        
        {/* Premium Features Preview */}
        <div className="mt-12 bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-sm border border-purple-500/50 rounded-lg p-6 shadow-xl">
          <div className="absolute -mt-16 -ml-6 opacity-30 text-8xl text-purple-300 select-none">✨</div>
          <h2 className="text-2xl font-bold mb-4 text-center">Premium Features</h2>
          <p className="text-center mb-6 text-gray-300">Unlock powerful analytics and insights to maximize your earnings!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/40 backdrop-blur-sm p-5 rounded-lg border border-purple-400/30 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
              <h3 className="text-lg font-semibold mb-2">Monthly Trends</h3>
              <p className="text-gray-300 text-sm">Track your earnings over time with beautiful charts</p>
              <div className="mt-4 h-32 flex items-center justify-center">
                <div className="text-gray-500">🔒 Premium Feature</div>
              </div>
            </div>
            
            <div className="bg-black/40 backdrop-blur-sm p-5 rounded-lg border border-purple-400/30 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
              <h3 className="text-lg font-semibold mb-2">Best Days Analysis</h3>
              <p className="text-gray-300 text-sm">Discover your most profitable days and shifts</p>
              <div className="mt-4 h-32 flex items-center justify-center">
                <div className="text-gray-500">🔒 Premium Feature</div>
              </div>
            </div>
            
            <div className="bg-black/40 backdrop-blur-sm p-5 rounded-lg border border-purple-400/30 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
              <h3 className="text-lg font-semibold mb-2">AI Forecasting</h3>
              <p className="text-gray-300 text-sm">Get AI-powered predictions for future earnings</p>
              <div className="mt-4 h-32 flex items-center justify-center">
                <div className="text-gray-500">🔒 Premium Feature</div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <a 
              href="/upgrade" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-8 rounded-full hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg hover:shadow-purple-500/50 transform hover:scale-105"
            >
              Upgrade Now - Just $6/month
            </a>
            <p className="mt-2 text-sm text-gray-300">Or $30/year (save 58%)</p>
          </div>
        </div>
      </div>
    </main>
  );
} 