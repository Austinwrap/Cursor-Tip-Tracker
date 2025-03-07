'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import Header from '../components/Header';
import MonthlyChart from '../components/analytics/MonthlyChart';
import DailyAveragesChart from '../components/analytics/DailyAveragesChart';
import BestWorstDays from '../components/analytics/BestWorstDays';
import Projections from '../components/analytics/Projections';
import AIChatAssistant from '../components/analytics/AIChatAssistant';

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
        <h1 className="text-3xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Analytics Dashboard</h1>
        
        {!isPaid && (
          <div className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-sm border border-purple-500/50 rounded-lg p-6 shadow-xl mb-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
            
            <h2 className="text-xl font-bold mb-2 text-center">Premium Features</h2>
            <p className="text-center mb-4">
              Upgrade to access these powerful analytics tools and maximize your earnings!
            </p>
            <div className="text-center">
              <a 
                href="/upgrade" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-2 px-6 rounded-full hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg transform hover:scale-105 hover:shadow-purple-500/50"
              >
                Upgrade Now
              </a>
            </div>
          </div>
        )}
        
        {/* AI Chat Assistant - Featured prominently at the top for paid users */}
        {isPaid && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold">AI Chat Assistant</h2>
              <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded-full">PREMIUM</span>
            </div>
            <AIChatAssistant />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Monthly Chart */}
          <div className="bg-gray-900 border border-gray-700 hover:border-blue-500 rounded-lg p-6 shadow-lg transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4">Monthly Earnings</h2>
            
            {isPaid ? (
              <MonthlyChart />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg border border-gray-800 group hover:border-purple-500/50 transition-all duration-300">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🔒</div>
                <div className="text-xl font-semibold text-gray-400">Premium Feature</div>
                <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
                  Visualize your monthly earnings with beautiful charts
                </p>
                <a 
                  href="/upgrade" 
                  className="mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Unlock Now →
                </a>
              </div>
            )}
          </div>
          
          {/* Daily Averages */}
          <div className="bg-gray-900 border border-gray-700 hover:border-blue-500 rounded-lg p-6 shadow-lg transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4">Daily Averages</h2>
            
            {isPaid ? (
              <DailyAveragesChart />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg border border-gray-800 group hover:border-purple-500/50 transition-all duration-300">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🔒</div>
                <div className="text-xl font-semibold text-gray-400">Premium Feature</div>
                <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
                  See which days of the week are most profitable for you
                </p>
                <a 
                  href="/upgrade" 
                  className="mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Unlock Now →
                </a>
              </div>
            )}
          </div>
          
          {/* Best/Worst Days */}
          <div className="bg-gray-900 border border-gray-700 hover:border-blue-500 rounded-lg p-6 shadow-lg transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4">Best & Worst Days</h2>
            
            {isPaid ? (
              <BestWorstDays />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg border border-gray-800 group hover:border-purple-500/50 transition-all duration-300">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🔒</div>
                <div className="text-xl font-semibold text-gray-400">Premium Feature</div>
                <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
                  Identify your most and least profitable days
                </p>
                <a 
                  href="/upgrade" 
                  className="mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Unlock Now →
                </a>
              </div>
            )}
          </div>
          
          {/* Projections */}
          <div className="bg-gray-900 border border-gray-700 hover:border-blue-500 rounded-lg p-6 shadow-lg transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4">Future Projections</h2>
            
            {isPaid ? (
              <Projections />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg border border-gray-800 group hover:border-purple-500/50 transition-all duration-300">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🔒</div>
                <div className="text-xl font-semibold text-gray-400">Premium Feature</div>
                <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
                  Get AI-powered predictions about your future earnings
                </p>
                <a 
                  href="/upgrade" 
                  className="mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Unlock Now →
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* AI Chat Assistant - For free users, shown at the bottom */}
        {!isPaid && (
          <div className="mt-8">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold">AI Chat Assistant</h2>
              <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded-full">PREMIUM</span>
            </div>
            <AIChatAssistant />
          </div>
        )}
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