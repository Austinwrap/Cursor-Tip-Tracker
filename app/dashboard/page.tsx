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
        
        {/* Past Tips Feature Highlight */}
        <div className="mt-8 bg-gradient-to-r from-blue-900/80 to-teal-900/80 backdrop-blur-sm border border-blue-500/50 rounded-lg p-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 md:mr-6">
              <h2 className="text-2xl font-bold mb-2">New Feature: Add Past Tips</h2>
              <p className="text-gray-300 mb-4">
                Forgot to log your tips from previous days? No problem! You can now easily add or edit tips for any past date.
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1">
                <li>Add tips for any previous date</li>
                <li>Edit existing tips with a single click</li>
                <li>Available for all users - free and premium</li>
              </ul>
            </div>
            <div className="flex-shrink-0">
              <a 
                href="/past-tips" 
                className="bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold py-3 px-8 rounded-full hover:from-blue-500 hover:to-teal-500 transition-all shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 inline-block"
              >
                Try It Now
              </a>
            </div>
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
              <h3 className="text-lg font-semibold mb-2">AI Chat Assistant</h3>
              <p className="text-gray-300 text-sm">Chat with our AI to analyze your tips and get insights</p>
              <div className="mt-4 h-32 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 bg-purple-600/10 rounded-full animate-pulse"></div>
                </div>
                <div className="text-gray-500 relative z-10">🔒 Premium Feature</div>
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
          
          {/* AI Chat Preview */}
          <div className="mt-10 bg-black/30 backdrop-blur-sm p-5 rounded-lg border border-purple-400/20 max-w-2xl mx-auto">
            <div className="flex items-center mb-4">
              <div className="bg-purple-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <span className="text-white text-xs">AI</span>
              </div>
              <div className="text-lg font-semibold text-gray-300">Ask me anything about your tips!</div>
            </div>
            
            <div className="space-y-4 opacity-70">
              <div className="flex items-start">
                <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-white text-xs">You</span>
                </div>
                <div className="bg-blue-600/50 rounded-lg p-3 text-white">
                  What was my best tipping day last month?
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-purple-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-white text-xs">AI</span>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-gray-300">
                  Your best day was March 15th when you made $245.00 in tips! That's 58% higher than your daily average.
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-center">
              <a 
                href="/upgrade" 
                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                Unlock AI Chat Assistant →
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 