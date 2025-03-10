'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import Header from '../components/Header';
import AuthCheck from '../components/AuthCheck';

// Define the Tip type
interface Tip {
  date: string;
  amount: number;
}

export default function History() {
  const { user } = useAuth();
  const router = useRouter();
  const [tips, setTips] = useState<Tip[]>([]);
  const [filteredTips, setFilteredTips] = useState<Tip[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Load tips when user is authenticated
  useEffect(() => {
    if (!user) return;
    loadTips();
  }, [user]);

  // Load tips from localStorage
  const loadTips = async () => {
    if (!user) {
      router.push('/signin');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Loading tips...');

    try {
      // Get the storage key for this user
      const storageKey = `tips_${user.id}`;
      
      // Load from localStorage
      const storedTips = localStorage.getItem(storageKey);
      if (storedTips) {
        const parsedTips = JSON.parse(storedTips);
        setTips(parsedTips);
        setFilteredTips(parsedTips);
        calculateTotal(parsedTips);
        setStatusMessage(`Loaded ${parsedTips.length} tips from local storage`);
      } else {
        setTips([]);
        setFilteredTips([]);
        setTotalAmount(0);
        setStatusMessage('No tips found');
      }
    } catch (error) {
      console.error('Error loading tips:', error);
      setStatusMessage('Error loading tips');
      setTips([]);
      setFilteredTips([]);
      setTotalAmount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total amount from tips
  const calculateTotal = (tipsArray: Tip[]) => {
    const total = tipsArray.reduce((sum, tip) => sum + tip.amount, 0);
    setTotalAmount(total);
  };

  // Apply filters based on selected filter type
  const applyFilters = () => {
    if (!tips.length) return;

    const now = new Date();
    
    // Get start of current week (Sunday)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    // Get start of current month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);
    
    // Get start of current year
    const yearStart = new Date(now.getFullYear(), 0, 1);
    yearStart.setHours(0, 0, 0, 0);
    
    let filtered: Tip[] = [];
    
    switch (filterType) {
      case 'week':
        filtered = tips.filter(tip => {
          const tipDate = new Date(tip.date);
          tipDate.setHours(0, 0, 0, 0);
          return tipDate >= weekStart;
        });
        break;
      case 'month':
        filtered = tips.filter(tip => {
          const tipDate = new Date(tip.date);
          tipDate.setHours(0, 0, 0, 0);
          return tipDate >= monthStart;
        });
        break;
      case 'year':
        filtered = tips.filter(tip => {
          const tipDate = new Date(tip.date);
          tipDate.setHours(0, 0, 0, 0);
          return tipDate >= yearStart;
        });
        break;
      default:
        filtered = [...tips];
    }
    
    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    setFilteredTips(filtered);
    calculateTotal(filtered);
  };

  // Apply filters when filter type or sort order changes
  useEffect(() => {
    applyFilters();
  }, [filterType, sortOrder, tips]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get monthly data for chart
  const getMonthlyData = () => {
    if (!tips.length) return [];
    
    const monthlyData: {[key: string]: number} = {};
    
    tips.forEach(tip => {
      const date = new Date(tip.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      
      monthlyData[monthYear] += tip.amount;
    });
    
    // Convert to array and sort by date
    return Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => {
        const [monthA, yearA] = a.month.split(' ');
        const [monthB, yearB] = b.month.split(' ');
        
        if (yearA !== yearB) {
          return parseInt(yearA) - parseInt(yearB);
        }
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(monthA) - months.indexOf(monthB);
      });
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-black text-white">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Tip History</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Back to Dashboard
            </button>
          </div>
          
          {/* Status Message */}
          {statusMessage && (
            <div className={`mb-4 p-2 rounded text-center text-sm ${
              statusMessage.includes('Error') 
                ? 'bg-red-900/50 text-red-200' 
                : statusMessage.includes('success') 
                  ? 'bg-green-900/50 text-green-200'
                  : 'bg-blue-900/50 text-blue-200'
            }`}>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-current rounded-full mr-2 border-t-transparent"></div>
                  {statusMessage}
                </div>
              ) : (
                statusMessage
              )}
            </div>
          )}
          
          {/* Filters */}
          <div className="bg-gray-900 p-4 rounded-lg shadow-lg mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div>
                <label className="block text-gray-400 mb-1">Filter</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1 rounded ${filterType === 'all' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                  >
                    All Time
                  </button>
                  <button
                    onClick={() => setFilterType('week')}
                    className={`px-3 py-1 rounded ${filterType === 'week' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => setFilterType('month')}
                    className={`px-3 py-1 rounded ${filterType === 'month' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => setFilterType('year')}
                    className={`px-3 py-1 rounded ${filterType === 'year' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                  >
                    This Year
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Sort</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSortOrder('desc')}
                    className={`px-3 py-1 rounded ${sortOrder === 'desc' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                  >
                    Newest First
                  </button>
                  <button
                    onClick={() => setSortOrder('asc')}
                    className={`px-3 py-1 rounded ${sortOrder === 'asc' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                  >
                    Oldest First
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Total */}
          <div className="bg-gray-900 p-4 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-2">Total Tips</h2>
            <p className="text-3xl font-bold">${totalAmount.toFixed(2)}</p>
            <p className="text-gray-400 text-sm mt-1">
              {filteredTips.length} tips {filterType !== 'all' ? `this ${filterType}` : 'total'}
            </p>
          </div>
          
          {/* Monthly Breakdown */}
          <div className="bg-gray-900 p-4 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Monthly Breakdown</h2>
            {getMonthlyData().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="h-60 flex items-end space-x-2">
                    {getMonthlyData().map((item, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full bg-gradient-to-t from-cyan-600 to-teal-400 rounded-t"
                          style={{ 
                            height: `${Math.max(
                              (item.amount / Math.max(...getMonthlyData().map(d => d.amount))) * 100, 
                              10
                            )}%` 
                          }}
                        ></div>
                        <div className="text-xs mt-1 text-gray-400 rotate-45 origin-left translate-y-6">
                          {item.month}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-2 px-4">Month</th>
                        <th className="text-right py-2 px-4">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getMonthlyData().map((item, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-2 px-4">{item.month}</td>
                          <td className="text-right py-2 px-4">${item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No data available</p>
            )}
          </div>
          
          {/* Tips Table */}
          <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Tip Details</h2>
            {filteredTips.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-2 px-4">Date</th>
                      <th className="text-right py-2 px-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTips.map((tip, index) => (
                      <tr key={index} className="border-b border-gray-800">
                        <td className="py-2 px-4">{formatDate(tip.date)}</td>
                        <td className="text-right py-2 px-4">${tip.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400">No tips found for the selected period</p>
            )}
          </div>
        </div>
      </div>
    </AuthCheck>
  );
} 