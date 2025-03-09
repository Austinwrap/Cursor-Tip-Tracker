'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { useAuth } from '../lib/AuthContext';
import { getTips as getSupabaseTips } from '../lib/supabase';

export default function History() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tips, setTips] = useState<Array<{date: string, amount: number}>>([]);
  const [filteredTips, setFilteredTips] = useState<Array<{date: string, amount: number}>>([]);
  const [filterType, setFilterType] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  // Load tips from Supabase
  useEffect(() => {
    if (!user) return;
    
    const loadTips = async () => {
      setIsLoading(true);
      setSyncStatus('Loading tips...');
      
      try {
        // Try to load tips from Supabase first
        const supabaseTips = await getSupabaseTips(user.id);
        
        if (supabaseTips && supabaseTips.length > 0) {
          // Convert Supabase tips to the format used in the history page
          const formattedTips = supabaseTips.map(tip => ({
            date: tip.date,
            amount: tip.amount
          }));
          
          setTips(formattedTips);
          setFilteredTips(formattedTips);
          calculateTotal(formattedTips);
          
          // Also update localStorage with the latest data
          const storageKey = `tips_${user.id}`;
          localStorage.setItem(storageKey, JSON.stringify(formattedTips));
          setSyncStatus('Tips loaded from database');
        } else {
          // Fall back to localStorage if no tips in Supabase
          const storageKey = `tips_${user.id}`;
          const storedTips = localStorage.getItem(storageKey);
          
          if (storedTips) {
            const parsedTips = JSON.parse(storedTips);
            setTips(parsedTips);
            setFilteredTips(parsedTips);
            calculateTotal(parsedTips);
            setSyncStatus('Tips loaded from local storage');
          } else {
            setSyncStatus('No tips found');
          }
        }
      } catch (error) {
        console.error('Error loading tips:', error);
        setSyncStatus('Error loading tips from database');
        
        // Fall back to localStorage if there's an error
        const storageKey = `tips_${user.id}`;
        const storedTips = localStorage.getItem(storageKey);
        if (storedTips) {
          const parsedTips = JSON.parse(storedTips);
          setTips(parsedTips);
          setFilteredTips(parsedTips);
          calculateTotal(parsedTips);
          setSyncStatus('Using locally stored tips (offline mode)');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTips();
  }, [user]);

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
      weekStart.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(tip => {
        const tipDate = new Date(tip.date);
        tipDate.setHours(0, 0, 0, 0);
        return tipDate >= weekStart;
      });
    } else if (filterType === 'month') {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(tip => {
        const tipDate = new Date(tip.date);
        tipDate.setHours(0, 0, 0, 0);
        return tipDate >= monthStart;
      });
    } else if (filterType === 'year') {
      const today = new Date();
      const yearStart = new Date(today.getFullYear(), 0, 1);
      yearStart.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(tip => {
        const tipDate = new Date(tip.date);
        tipDate.setHours(0, 0, 0, 0);
        return tipDate >= yearStart;
      });
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

  if (loading || isLoading) {
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
          
          {/* Status message */}
          {syncStatus && (
            <div className={`text-center mb-4 text-sm ${syncStatus.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
              {syncStatus}
            </div>
          )}
          
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
                        <div className="text-xs text-gray-400 mt-2 truncate w-full text-center">{month}</div>
                        <div className="text-xs font-semibold text-cyan-400">${amount.toFixed(0)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Tip List */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-cyan-400 mb-4">Tip Details</h2>
            
            {filteredTips.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-2 px-4 text-gray-400">Date</th>
                      <th className="text-right py-2 px-4 text-gray-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTips.map((tip, index) => (
                      <tr key={`${tip.date}-${index}`} className="border-b border-gray-800">
                        <td className="py-2 px-4">{formatDate(tip.date)}</td>
                        <td className="py-2 px-4 text-right text-cyan-400">${tip.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No tips found for the selected filter.</p>
            )}
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold py-3 px-8 rounded-lg hover:from-cyan-600 hover:to-teal-600 transition-all shadow-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 