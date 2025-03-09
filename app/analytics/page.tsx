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
        <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-400">Analytics Dashboard</h1>
        
        {!isPaid && (
          <div className="bg-gradient-to-r from-cyan-900/80 to-teal-900/80 backdrop-blur-sm border border-cyan-500/50 rounded-lg p-6 shadow-xl mb-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
            
            <h2 className="text-xl font-bold mb-2 text-center">Premium Features</h2>
            <p className="text-center mb-4">
              Upgrade to access these powerful analytics tools and maximize your earnings!
            </p>
            <div className="text-center">
              <a 
                href="/upgrade" 
                className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold py-2 px-6 rounded-full hover:from-cyan-500 hover:to-teal-500 transition-all shadow-lg transform hover:scale-105 hover:shadow-cyan-500/50"
              >
                Upgrade Now
              </a>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Monthly Chart */}
          <div className="bg-gray-900 border border-gray-700 hover:border-cyan-500 rounded-lg p-6 shadow-lg transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4">Monthly Earnings</h2>
            
            {isPaid ? (
              <MonthlyChart />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg border border-gray-800 group hover:border-cyan-500/50 transition-all duration-300">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🔒</div>
                <div className="text-xl font-semibold text-gray-400">Premium Feature</div>
                <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
                  Visualize your monthly earnings with beautiful charts
                </p>
                <a 
                  href="/upgrade" 
                  className="mt-4 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Unlock Now →
                </a>
              </div>
            )}
          </div>
          
          {/* Daily Averages */}
          <div className="bg-gray-900 border border-gray-700 hover:border-cyan-500 rounded-lg p-6 shadow-lg transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4">Daily Averages</h2>
            
            {isPaid ? (
              <DailyAveragesChart />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg border border-gray-800 group hover:border-cyan-500/50 transition-all duration-300">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🔒</div>
                <div className="text-xl font-semibold text-gray-400">Premium Feature</div>
                <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
                  See which days of the week are most profitable for you
                </p>
                <a 
                  href="/upgrade" 
                  className="mt-4 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Unlock Now →
                </a>
              </div>
            )}
          </div>
          
          {/* Best/Worst Days */}
          <div className="bg-gray-900 border border-gray-700 hover:border-cyan-500 rounded-lg p-6 shadow-lg transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4">Best & Worst Days</h2>
            
            {isPaid ? (
              <BestWorstDays />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg border border-gray-800 group hover:border-cyan-500/50 transition-all duration-300">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🔒</div>
                <div className="text-xl font-semibold text-gray-400">Premium Feature</div>
                <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
                  Identify your most and least profitable days
                </p>
                <a 
                  href="/upgrade" 
                  className="mt-4 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Unlock Now →
                </a>
              </div>
            )}
          </div>
          
          {/* Projections */}
          <div className="bg-gray-900 border border-gray-700 hover:border-cyan-500 rounded-lg p-6 shadow-lg transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4">Future Projections</h2>
            
            {isPaid ? (
              <Projections />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg border border-gray-800 group hover:border-cyan-500/50 transition-all duration-300">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🔒</div>
                <div className="text-xl font-semibold text-gray-400">Premium Feature</div>
                <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
                  Get data-driven predictions about your future earnings
                </p>
                <a 
                  href="/upgrade" 
                  className="mt-4 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Unlock Now →
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Data Export Feature */}
        <div className="mt-8 bg-gray-900 border border-gray-700 hover:border-cyan-500 rounded-lg p-6 shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Export Your Data</h2>
            <span className="px-2 py-0.5 bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-xs rounded-full">PREMIUM</span>
          </div>
          
          {isPaid ? (
            <div className="bg-black/30 rounded-lg p-6 border border-gray-800">
              <p className="text-gray-300 mb-4">Download your tip data in various formats for your records or further analysis.</p>
              <div className="flex flex-wrap gap-3">
                <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  CSV
                </button>
                <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Excel
                </button>
                <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg border border-gray-800 group hover:border-cyan-500/50 transition-all duration-300">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📊</div>
              <p className="text-sm text-gray-500 text-center max-w-xs mb-3">
                Export your tip data in multiple formats for accounting or tax purposes
              </p>
              <a 
                href="/upgrade" 
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Upgrade to Export →
              </a>
            </div>
          )}
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