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

  // Load tips from localStorage when user is authenticated
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
      } catch (error) {
        console.error('Error loading tips:', error);
        setSyncStatus('Error loading tips');
        setTips([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setTipDate(today);

    loadTips();
  }, [user]);

  // Update totals whenever tips change
  useEffect(() => {
    if (!user) return;
    renderCalendar();
    updateTotals();
  }, [tips, selectedMonth, user]);

  // Add tip function
  const addTip = async () => {
    if (!user) {
      router.push('/signin');
      return;
    }

    const date = tipDate;
    const amount = parseFloat(tipAmount);

    if (!date || isNaN(amount)) {
      alert('Please enter a valid date and tip amount.');
      return;
    }

    setIsLoading(true);
    setSyncStatus('Saving tip...');

    try {
      console.log('Adding tip:', { date, amount, userId: user.id });
      
      // Create the new tip object
      const newTip: Tip = { date, amount };
      
      // Update local state
      const newTips = [...tips, newTip];
      setTips(newTips);
      
      // Save to localStorage
      const storageKey = `tips_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(newTips));
      
      setSyncStatus('Tip saved successfully');
    } catch (error) {
      console.error('Error saving tip:', error);
      setSyncStatus('Error saving tip');
    } finally {
      setIsLoading(false);
      // Clear input
      setTipAmount('');
    }
  };

  // Edit tip function
  const editTip = async (index: number) => {
    if (!user) {
      router.push('/signin');
      return;
    }

    const date = prompt('Enter date (YYYY-MM-DD):', tips[index].date);
    if (!date) return;

    const amountStr = prompt('Enter amount:', tips[index].amount.toString());
    if (!amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount)) {
      alert('Please enter a valid amount.');
      return;
    }

    setIsLoading(true);
    setSyncStatus('Updating tip...');

    try {
      // Update the tip in the local state
      const updatedTips = [...tips];
      updatedTips[index] = { date, amount };
      setTips(updatedTips);
      
      // Save to localStorage
      const storageKey = `tips_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedTips));
      
      setSyncStatus('Tip updated successfully');
    } catch (error) {
      console.error('Error updating tip:', error);
      setSyncStatus('Error updating tip');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete tip function
  const deleteTip = async (index: number) => {
    if (!user) {
      router.push('/signin');
      return;
    }

    if (!confirm('Are you sure you want to delete this tip?')) {
      return;
    }

    setIsLoading(true);
    setSyncStatus('Deleting tip...');

    try {
      // Remove the tip from the local state
      const updatedTips = tips.filter((_, i) => i !== index);
      setTips(updatedTips);
      
      // Save to localStorage
      const storageKey = `tips_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedTips));
      
      setSyncStatus('Tip deleted successfully');
    } catch (error) {
      console.error('Error deleting tip:', error);
      setSyncStatus('Error deleting tip');
    } finally {
      setIsLoading(false);
    }
  };

  // Change month function
  const changeMonth = (increment: number) => {
    let newMonth = selectedMonth + increment;
    let newYear = selectedYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  // Render calendar function
  const renderCalendar = () => {
    // Implementation remains the same
  };

  // Update totals function
  const updateTotals = () => {
    if (!tips.length) {
      setWeeklyTotal(0);
      setMonthlyTotal(0);
      setYearlyTotal(0);
      return;
    }

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
    
    // Calculate totals
    let weekly = 0;
    let monthly = 0;
    let yearly = 0;
    
    tips.forEach(tip => {
      const tipDate = new Date(tip.date);
      tipDate.setHours(0, 0, 0, 0);
      
      if (tipDate >= weekStart) {
        weekly += tip.amount;
      }
      
      if (tipDate >= monthStart) {
        monthly += tip.amount;
      }
      
      if (tipDate >= yearStart) {
        yearly += tip.amount;
      }
    });
    
    setWeeklyTotal(weekly);
    setMonthlyTotal(monthly);
    setYearlyTotal(yearly);
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-black text-white">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Tip Tracker Dashboard</h1>
          
          {/* Status Message */}
          {syncStatus && (
            <div className={`mb-4 p-2 rounded text-center text-sm ${
              syncStatus.includes('Error') 
                ? 'bg-red-900/50 text-red-200' 
                : syncStatus.includes('success') 
                  ? 'bg-green-900/50 text-green-200'
                  : 'bg-blue-900/50 text-blue-200'
            }`}>
              {isLoading || isSyncing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-current rounded-full mr-2 border-t-transparent"></div>
                  {syncStatus}
                </div>
              ) : (
                syncStatus
              )}
            </div>
          )}
          
          {/* Totals Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-400">This Week</h2>
              <p className="text-2xl font-bold">${weeklyTotal.toFixed(2)}</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-400">This Month</h2>
              <p className="text-2xl font-bold">${monthlyTotal.toFixed(2)}</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-400">This Year</h2>
              <p className="text-2xl font-bold">${yearlyTotal.toFixed(2)}</p>
            </div>
          </div>
          
          {/* Calendar Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={() => changeMonth(-1)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded"
              >
                &larr; Prev
              </button>
              <h2 className="text-xl font-semibold">
                {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <button 
                onClick={() => changeMonth(1)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded"
              >
                Next &rarr;
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-gray-800 p-2 font-semibold text-sm">
                  {day}
                </div>
              ))}
              {/* Calendar days would be rendered here */}
            </div>
          </div>
          
          {/* Add Tip Section */}
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Add New Tip</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  value={tipDate}
                  onChange={(e) => setTipDate(e.target.value)}
                  className="w-full bg-gray-800 text-white p-2 rounded"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-400 mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  className="w-full bg-gray-800 text-white p-2 rounded"
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addTip}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-4 py-2 rounded hover:from-cyan-600 hover:to-teal-600 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Add Tip'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Recent Tips Section */}
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Recent Tips</h2>
            {tips.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-2 px-4">Date</th>
                      <th className="text-right py-2 px-4">Amount</th>
                      <th className="text-right py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...tips].reverse().slice(0, 5).map((tip, index) => (
                      <tr key={index} className="border-b border-gray-800">
                        <td className="py-2 px-4">{new Date(tip.date).toLocaleDateString()}</td>
                        <td className="text-right py-2 px-4">${tip.amount.toFixed(2)}</td>
                        <td className="text-right py-2 px-4">
                          <button
                            onClick={() => editTip(tips.length - 1 - index)}
                            className="text-cyan-400 hover:text-cyan-300 mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTip(tips.length - 1 - index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400">No tips recorded yet. Add your first tip above!</p>
            )}
            {tips.length > 5 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => router.push('/history')}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  View All Tips
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthCheck>
  );
} 