'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import Header from '../components/Header';
import TipForm from '../components/TipForm';
import TipCalendar from '../components/TipCalendar';
import Link from 'next/link';

export default function Dashboard() {
  const { user, loading, isPaid, devMode, toggleDevMode } = useAuth();
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
        <h1 className="text-3xl font-bold mb-2 text-center">Track Your Tips</h1>
        <p className="text-gray-400 text-center mb-8">Record and visualize your daily earnings</p>
        
        {/* Developer Mode Toggle */}
        <div className="mb-6 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Developer Mode</h3>
              <p className="text-gray-400 text-sm">
                Enable to access premium features without payment (local testing only)
              </p>
            </div>
            <button
              onClick={toggleDevMode}
              className={`px-4 py-2 rounded-md font-medium ${
                devMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {devMode ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          {devMode && (
            <div className="mt-2 p-2 bg-green-900/30 border border-green-500/30 rounded text-sm text-green-400">
              Premium features are now accessible. Visit the Analytics page to see all premium features.
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <div className="bg-gray-900 border border-gray-700 hover:border-blue-500 rounded-lg p-6 shadow-lg transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 text-center">Your Tip Calendar</h2>
            <TipCalendar 
              selectedDate={selectedDate} 
              onDateSelect={setSelectedDate} 
            />
          </div>
          
          {/* Tip Form Section */}
          <div className="bg-gray-900 border border-gray-700 hover:border-blue-500 rounded-lg p-6 shadow-lg transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 text-center">Enter Tips</h2>
            <TipForm 
              selectedDate={selectedDate} 
              onTipAdded={() => {
                // Refresh data if needed
                console.log('Tip added');
              }} 
            />
            
            {/* Quick Navigation */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Link 
                href="/past-tips" 
                className="bg-gray-800 hover:bg-gray-700 text-white text-center py-4 px-6 rounded-md transition-colors"
              >
                Past Tips
              </Link>
              <Link 
                href="/analytics" 
                className="bg-gray-800 hover:bg-gray-700 text-white text-center py-4 px-6 rounded-md transition-colors"
              >
                Analytics
              </Link>
            </div>
          </div>
        </div>
        
        {/* Tips & Help Section */}
        <div className="mt-12 bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Tips & Help</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black p-4 rounded-lg">
              <h3 className="font-bold text-blue-400 mb-2">Adding Tips</h3>
              <p className="text-gray-400 text-sm">
                Enter your daily tips in the form above. You can add tips for today or select a past date on the calendar.
              </p>
            </div>
            <div className="bg-black p-4 rounded-lg">
              <h3 className="font-bold text-blue-400 mb-2">Viewing History</h3>
              <p className="text-gray-400 text-sm">
                Click on any date in the calendar to view or edit tips for that day. Green highlighted dates already have tips recorded.
              </p>
            </div>
            <div className="bg-black p-4 rounded-lg">
              <h3 className="font-bold text-blue-400 mb-2">Analytics</h3>
              <p className="text-gray-400 text-sm">
                Visit the Analytics page to see trends, averages, and projections based on your tip history.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 