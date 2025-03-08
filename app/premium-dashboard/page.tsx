'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import Header from '../components/Header';
import Link from 'next/link';
import { getTips } from '../lib/supabase';
import AIChatAssistant from '../components/analytics/AIChatAssistant';
import MonthlyChart from '../components/analytics/MonthlyChart';
import DailyAveragesChart from '../components/analytics/DailyAveragesChart';
import BestWorstDays from '../components/analytics/BestWorstDays';
import Projections from '../components/analytics/Projections';

export default function PremiumDashboard() {
  const { user, isPaid, loading } = useAuth();
  const router = useRouter();
  const [tips, setTips] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not authenticated or not paid
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isPaid) {
        router.push('/upgrade');
      }
    }
  }, [user, isPaid, loading, router]);

  // Fetch user's tips
  useEffect(() => {
    const fetchTips = async () => {
      if (user) {
        const userTips = await getTips(user.id);
        setTips(userTips);
      }
    };

    fetchTips();
  }, [user]);

  if (loading || !user || !isPaid) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
            Premium Dashboard
          </h1>
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-sm px-3 py-1 rounded-full font-bold">
            PREMIUM MEMBER
          </div>
        </div>

        {/* Premium Navigation Tabs */}
        <div className="flex overflow-x-auto mb-8 pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('ai-assistant')}
            className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
              activeTab === 'ai-assistant'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            AI Assistant
          </button>
          <button
            onClick={() => setActiveTab('tip-history')}
            className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
              activeTab === 'tip-history'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Tip History
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Advanced Analytics
          </button>
          <button
            onClick={() => setActiveTab('projections')}
            className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
              activeTab === 'projections'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Future Projections
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-yellow-500 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-2">Total Tips</h3>
                <p className="text-3xl font-bold text-yellow-400">
                  ${(tips.reduce((sum, tip) => sum + tip.amount, 0) / 100).toFixed(2)}
                </p>
                <p className="text-sm text-gray-400 mt-1">Lifetime earnings</p>
              </div>
              
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-yellow-500 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-2">Average Tips</h3>
                <p className="text-3xl font-bold text-yellow-400">
                  ${tips.length > 0 ? ((tips.reduce((sum, tip) => sum + tip.amount, 0) / tips.length) / 100).toFixed(2) : '0.00'}
                </p>
                <p className="text-sm text-gray-400 mt-1">Per day worked</p>
              </div>
              
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-yellow-500 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-2">Days Tracked</h3>
                <p className="text-3xl font-bold text-yellow-400">{tips.length}</p>
                <p className="text-sm text-gray-400 mt-1">Total days with tips</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-yellow-500 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
                <MonthlyChart />
              </div>
              
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-yellow-500 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4">Daily Averages</h3>
                <DailyAveragesChart />
              </div>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-yellow-500 transition-all duration-300">
              <h3 className="text-lg font-semibold mb-4">AI Chat Assistant</h3>
              <AIChatAssistant />
            </div>
          </div>
        )}

        {/* AI Assistant Tab */}
        {activeTab === 'ai-assistant' && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold">AI Chat Assistant</h2>
              <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs rounded-full font-bold">PREMIUM</span>
            </div>
            <p className="text-gray-400 mb-6">
              Ask me anything about your tips and earnings! I can analyze your data and provide personalized insights.
            </p>
            <div className="h-[500px]">
              <AIChatAssistant />
            </div>
          </div>
        )}

        {/* Tip History Tab */}
        {activeTab === 'tip-history' && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Tip History</h2>
              <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs rounded-full font-bold">PREMIUM</span>
            </div>
            
            {tips.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-3 px-4 text-left">Day</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tips.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tip) => {
                      const date = new Date(tip.date);
                      const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
                      
                      return (
                        <tr key={tip.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="py-3 px-4">{formattedDate}</td>
                          <td className="py-3 px-4">{dayOfWeek}</td>
                          <td className="py-3 px-4 text-right font-medium text-yellow-400">
                            ${(tip.amount / 100).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>No tip history found. Start adding tips to see your history.</p>
                <Link href="/dashboard" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors">
                  Add Tips
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-6">
                <h2 className="text-xl font-semibold">Advanced Analytics</h2>
                <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs rounded-full font-bold">PREMIUM</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Daily Averages</h3>
                  <DailyAveragesChart />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Best & Worst Days</h3>
                  <BestWorstDays />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
              <MonthlyChart />
            </div>
          </div>
        )}

        {/* Projections Tab */}
        {activeTab === 'projections' && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center mb-6">
              <h2 className="text-xl font-semibold">Future Projections</h2>
              <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs rounded-full font-bold">PREMIUM</span>
            </div>
            
            <p className="text-gray-400 mb-6">
              Based on your historical data, here are AI-powered projections of your future earnings.
            </p>
            
            <Projections />
          </div>
        )}
      </main>
    </div>
  );
} 