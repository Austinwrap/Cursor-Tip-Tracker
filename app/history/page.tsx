'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { useAuth } from '../lib/AuthContext';

export default function History() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tips, setTips] = useState<Array<{date: string, amount: number}>>([]);
  const [filteredTips, setFilteredTips] = useState<Array<{date: string, amount: number}>>([]);
  const [filterType, setFilterType] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [totalAmount, setTotalAmount] = useState(0);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  // Load tips from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storedTips = localStorage.getItem('tips');
    if (storedTips) {
      const parsedTips = JSON.parse(storedTips);
      setTips(parsedTips);
      setFilteredTips(parsedTips);
      calculateTotal(parsedTips);
    }
  }, []);

  // Apply filters when filter type changes
  useEffect(() => {
    applyFilters();
  }, [filterType, tips, sortOrder]);

  // Calculate total amount
  const calculateTotal = (tipsArray: Array<{date: string, amount: number}>) => {
    const total = tipsArray.reduce((sum, tip) => sum + tip.amount, 0);
    setTotalAmount(total);
  };

  // Apply filters based on filter type
  const applyFilters = () => {
    let filtered = [...tips];
    
    // Apply date filter
    if (filterType === 'week') {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      filtered = filtered.filter(tip => new Date(tip.date) >= weekStart);
    } else if (filterType === 'month') {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      filtered = filtered.filter(tip => new Date(tip.date) >= monthStart);
    } else if (filterType === 'year') {
      const today = new Date();
      const yearStart = new Date(today.getFullYear(), 0, 1);
      filtered = filtered.filter(tip => new Date(tip.date) >= yearStart);
    }
    
    // Apply sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredTips(filtered);
    calculateTotal(filtered);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Group tips by month for the chart
  const getMonthlyData = () => {
    const monthlyData: Record<string, number> = {};
    
    filteredTips.forEach(tip => {
      const date = new Date(tip.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      
      monthlyData[monthYear] += tip.amount;
    });
    
    return monthlyData;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-pulse text-xl">Loading...</div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null; // Will redirect to sign in
  }

  const monthlyData = getMonthlyData();

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-400">
            Tip History
          </h1>
          
          {/* Filters and Stats */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex flex-wrap justify-between items-center mb-6">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-semibold text-cyan-400 mb-2">Filter Tips</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setFilterType('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterType === 'all' 
                        ? 'bg-cyan-600 text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    All Time
                  </button>
                  <button 
                    onClick={() => setFilterType('year')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterType === 'year' 
                        ? 'bg-cyan-600 text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    This Year
                  </button>
                  <button 
                    onClick={() => setFilterType('month')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterType === 'month' 
                        ? 'bg-cyan-600 text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    This Month
                  </button>
                  <button 
                    onClick={() => setFilterType('week')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterType === 'week' 
                        ? 'bg-cyan-600 text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    This Week
                  </button>
                </div>
              </div>
              
              <div>
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="flex items-center space-x-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <span>Sort</span>
                  {sortOrder === 'desc' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-cyan-500/20">
                <p className="text-gray-400 text-sm">Total Tips</p>
                <p className="text-2xl font-bold text-white">{filteredTips.length}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-cyan-500/20">
                <p className="text-gray-400 text-sm">Total Amount</p>
                <p className="text-2xl font-bold text-cyan-400">${totalAmount.toFixed(2)}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-cyan-500/20">
                <p className="text-gray-400 text-sm">Average Tip</p>
                <p className="text-2xl font-bold text-white">
                  ${filteredTips.length > 0 ? (totalAmount / filteredTips.length).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
            
            {/* Monthly Chart */}
            {Object.keys(monthlyData).length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Monthly Breakdown</h3>
                <div className="h-60 flex items-end space-x-2">
                  {Object.entries(monthlyData).map(([month, amount]) => {
                    const percentage = (amount / Math.max(...Object.values(monthlyData))) * 100;
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-gradient-to-t from-cyan-600 to-teal-400 rounded-t-md"
                          style={{ height: `${percentage}%` }}
                        ></div>
                        <div className="text-xs mt-2 text-gray-400">{month}</div>
                        <div className="text-xs font-semibold text-white">${amount.toFixed(0)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Tip List */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-xl overflow-hidden shadow-lg">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-cyan-400">Detailed History</h2>
            </div>
            
            {filteredTips.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-lg">No tips found for the selected period</p>
                <p className="mt-2 text-sm">Try changing your filter or add some tips in the dashboard</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/80 text-gray-400 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-3 text-left">Date</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredTips.map((tip, index) => (
                      <tr 
                        key={`${tip.date}-${index}`} 
                        className="bg-gray-900/30 hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{formatDate(tip.date)}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-cyan-400 font-bold">${tip.amount.toFixed(2)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 