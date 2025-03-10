'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import Header from '../components/Header';
import AuthCheck from '../components/AuthCheck';

// Define the Tip type
interface Tip {
  id?: string;
  user_id?: string;
  date: string;
  amount: number;
  created_at?: string;
  updated_at?: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [tips, setTips] = useState<Tip[]>([]);
  const [tipDate, setTipDate] = useState('');
  const [tipAmount, setTipAmount] = useState('');
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [yearlyTotal, setYearlyTotal] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  // Load tips when user is authenticated
  useEffect(() => {
    if (!user) return;
    
    const loadTips = async () => {
      setIsLoading(true);
      setSyncStatus('Loading tips...');
      
      try {
        // Get the storage key for this user
        const storageKey = `tips_${user.id}`;
        
        // Load from localStorage
        const storedTips = localStorage.getItem(storageKey);
        if (storedTips) {
          const parsedTips = JSON.parse(storedTips);
          setTips(parsedTips);
          console.log('Loaded tips from localStorage:', parsedTips.length);
          setSyncStatus(`Loaded ${parsedTips.length} tips from local storage`);
        } else {
          setTips([]);
          setSyncStatus('No tips found');
        }
        
        // Calculate totals
        calculateTotals();
      } catch (error) {
        console.error('Error loading tips:', error);
        setSyncStatus('Error loading tips');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTips();
  }, [user]);

  // Calculate totals whenever tips change
  useEffect(() => {
    calculateTotals();
  }, [tips, selectedMonth, selectedYear]);

  // Calculate weekly, monthly, and yearly totals
  const calculateTotals = () => {
    if (!tips.length) {
      setWeeklyTotal(0);
      setMonthlyTotal(0);
      setYearlyTotal(0);
      return;
    }
    
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    
    // Weekly total - last 7 days
    const weeklySum = tips
      .filter(tip => {
        const tipDate = new Date(tip.date);
        return tipDate >= oneWeekAgo && tipDate <= now;
      })
      .reduce((sum, tip) => sum + Number(tip.amount), 0);
    
    // Monthly total - current selected month
    const monthlySum = tips
      .filter(tip => {
        const tipDate = new Date(tip.date);
        return tipDate.getMonth() === selectedMonth && tipDate.getFullYear() === selectedYear;
      })
      .reduce((sum, tip) => sum + Number(tip.amount), 0);
    
    // Yearly total - current selected year
    const yearlySum = tips
      .filter(tip => {
        const tipDate = new Date(tip.date);
        return tipDate.getFullYear() === selectedYear;
      })
      .reduce((sum, tip) => sum + Number(tip.amount), 0);
    
    setWeeklyTotal(weeklySum);
    setMonthlyTotal(monthlySum);
    setYearlyTotal(yearlySum);
  };

  // Add a new tip
  const addTip = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      console.error('Cannot add tip: User not authenticated');
      return;
    }
    
    if (!tipDate || !tipAmount) {
      console.error('Cannot add tip: Missing date or amount');
      return;
    }
    
    const amount = parseFloat(tipAmount);
    if (isNaN(amount)) {
      console.error('Cannot add tip: Invalid amount');
      return;
    }
    
    console.log('Adding tip:', { date: tipDate, amount });
    
    // Create new tip object
    const newTip: Tip = {
      user_id: user.id,
      date: tipDate,
      amount: amount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Update local state immediately for better UX
    const updatedTips = [newTip, ...tips];
    setTips(updatedTips);
    
    // Save to localStorage
    localStorage.setItem(`tips_${user.id}`, JSON.stringify(updatedTips));
    
    // Clear form
    setTipDate('');
    setTipAmount('');
    
    // Update status
    setSyncStatus('Tip saved successfully');
    
    // Recalculate totals
    calculateTotals();
  };

  // Delete a tip
  const deleteTip = async (tipToDelete: Tip) => {
    if (!user) return;
    
    // Update local state immediately
    const updatedTips = tips.filter(tip => 
      !(tip.date === tipToDelete.date && tip.amount === tipToDelete.amount)
    );
    setTips(updatedTips);
    
    // Save to localStorage
    localStorage.setItem(`tips_${user.id}`, JSON.stringify(updatedTips));
    
    // Update status
    setSyncStatus('Tip deleted successfully');
    
    // Recalculate totals
    calculateTotals();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render the dashboard
  return (
    <AuthCheck>
      <main className="min-h-screen bg-black text-white">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Weekly Total</h2>
              <p className="text-2xl">{formatCurrency(weeklyTotal)}</p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Monthly Total</h2>
              <p className="text-2xl">{formatCurrency(monthlyTotal)}</p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Yearly Total</h2>
              <p className="text-2xl">{formatCurrency(yearlyTotal)}</p>
            </div>
          </div>
          
          {/* Add Tip Form */}
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Add New Tip</h2>
            
            <form onSubmit={addTip} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tipDate" className="block text-sm font-medium mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    id="tipDate"
                    value={tipDate}
                    onChange={(e) => setTipDate(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="tipAmount" className="block text-sm font-medium mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    id="tipAmount"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full bg-black border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Add Tip
              </button>
            </form>
            
            {syncStatus && (
              <div className="mt-4 text-sm text-gray-400">
                Status: {syncStatus}
              </div>
            )}
          </div>
          
          {/* Recent Tips */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Recent Tips</h2>
            
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-pulse">Loading tips...</div>
              </div>
            ) : tips.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                No tips recorded yet. Add your first tip above!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                      <th className="px-4 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tips.map((tip, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="px-4 py-2">{formatDate(tip.date)}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(tip.amount)}</td>
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={() => deleteTip(tip)}
                            className="text-red-500 hover:text-red-400"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </AuthCheck>
  );
} 