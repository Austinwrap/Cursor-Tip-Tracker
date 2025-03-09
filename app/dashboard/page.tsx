'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { useAuth } from '../lib/AuthContext';
import { supabase, addTip as saveTipToSupabase, getTips as getSupabaseTips, deleteTip as deleteSupabaseTip } from '../lib/supabase';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tips, setTips] = useState<Array<{date: string, amount: number}>>([]);
  const [weeklyTotal, setWeeklyTotal] = useState('0.00');
  const [monthlyTotal, setMonthlyTotal] = useState('0.00');
  const [yearlyTotal, setYearlyTotal] = useState('0.00');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [tipDate, setTipDate] = useState<string>('');
  const [tipAmount, setTipAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  // Load tips from Supabase when user is authenticated
  useEffect(() => {
    if (!user) return;
    
    const loadTips = async () => {
      setIsLoading(true);
      setSyncStatus('Loading tips...');
      
      try {
        // Always try to load from Supabase first
        const supabaseTips = await getSupabaseTips(user.id);
        
        if (supabaseTips && supabaseTips.length > 0) {
          // Convert Supabase tips to the format used in the dashboard
          const formattedTips = supabaseTips.map(tip => ({
            date: tip.date,
            amount: tip.amount
          }));
          
          setTips(formattedTips);
          
          // Also update localStorage as a backup
          const storageKey = `tips_${user.id}`;
          localStorage.setItem(storageKey, JSON.stringify(formattedTips));
          setSyncStatus('Tips loaded from database');
        } else {
          // If no tips in Supabase, check localStorage as a fallback
          const storageKey = `tips_${user.id}`;
          const storedTips = localStorage.getItem(storageKey);
          
          if (storedTips) {
            const parsedTips = JSON.parse(storedTips);
            setTips(parsedTips);
            
            // Sync localStorage tips to Supabase
            setIsSyncing(true);
            setSyncStatus('Syncing tips to database...');
            
            let syncCount = 0;
            for (const tip of parsedTips) {
              const success = await saveTipToSupabase(user.id, tip.date, tip.amount);
              if (success) syncCount++;
            }
            
            setSyncStatus(`Synced ${syncCount} of ${parsedTips.length} tips to database`);
            setIsSyncing(false);
            
            // Reload from Supabase to ensure consistency
            const refreshedTips = await getSupabaseTips(user.id);
            if (refreshedTips && refreshedTips.length > 0) {
              const refreshedFormattedTips = refreshedTips.map(tip => ({
                date: tip.date,
                amount: tip.amount
              }));
              setTips(refreshedFormattedTips);
            }
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
          setTips(JSON.parse(storedTips));
          setSyncStatus('Using locally stored tips (offline mode)');
        }
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
      // Always save to Supabase first
      const success = await saveTipToSupabase(user.id, date, amount);
      
      if (success) {
        // If successful, update local state
        const newTips = [...tips, { date, amount }];
        setTips(newTips);
        
        // Also update localStorage as a backup
        const storageKey = `tips_${user.id}`;
        localStorage.setItem(storageKey, JSON.stringify(newTips));
        
        setSyncStatus('Tip saved successfully');
        
        // Reload from Supabase to ensure consistency
        const refreshedTips = await getSupabaseTips(user.id);
        if (refreshedTips && refreshedTips.length > 0) {
          const refreshedFormattedTips = refreshedTips.map(tip => ({
            date: tip.date,
            amount: tip.amount
          }));
          setTips(refreshedFormattedTips);
        }
      } else {
        setSyncStatus('Error saving tip to database');
      }
    } catch (error) {
      console.error('Error saving tip:', error);
      setSyncStatus('Error saving tip');
      
      // Fall back to local storage only if Supabase fails
      const newTips = [...tips, { date, amount }];
      setTips(newTips);
      
      const storageKey = `tips_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(newTips));
      
      setSyncStatus('Tip saved locally only (offline mode)');
    } finally {
      setIsLoading(false);
    }
    
    // Clear input
    setTipAmount('');
  };

  // Edit tip function
  const editTip = async (index: number) => {
    if (!user) {
      router.push('/signin');
      return;
    }

    const newAmount = prompt('Enter new tip amount:', tips[index].amount.toString());
    if (newAmount && !isNaN(parseFloat(newAmount))) {
      setIsLoading(true);
      setSyncStatus('Updating tip...');
      
      try {
        const date = tips[index].date;
        const amount = parseFloat(newAmount);
        
        // Update in Supabase first
        const success = await saveTipToSupabase(user.id, date, amount);
        
        if (success) {
          // If successful, update local state
          const newTips = [...tips];
          newTips[index].amount = amount;
          setTips(newTips);
          
          // Also update localStorage as a backup
          const storageKey = `tips_${user.id}`;
          localStorage.setItem(storageKey, JSON.stringify(newTips));
          
          setSyncStatus('Tip updated successfully');
          
          // Reload from Supabase to ensure consistency
          const refreshedTips = await getSupabaseTips(user.id);
          if (refreshedTips && refreshedTips.length > 0) {
            const refreshedFormattedTips = refreshedTips.map(tip => ({
              date: tip.date,
              amount: tip.amount
            }));
            setTips(refreshedFormattedTips);
          }
        } else {
          setSyncStatus('Error updating tip in database');
        }
      } catch (error) {
        console.error('Error updating tip:', error);
        setSyncStatus('Error updating tip');
        
        // Fall back to local update if Supabase fails
        const newTips = [...tips];
        newTips[index].amount = parseFloat(newAmount);
        setTips(newTips);
        
        const storageKey = `tips_${user.id}`;
        localStorage.setItem(storageKey, JSON.stringify(newTips));
        
        setSyncStatus('Tip updated locally only (offline mode)');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Delete tip function
  const deleteTip = async (index: number) => {
    if (!user) {
      router.push('/signin');
      return;
    }

    if (confirm('Are you sure you want to delete this tip?')) {
      setIsLoading(true);
      setSyncStatus('Deleting tip...');
      
      try {
        // Find the tip in Supabase to get its ID
        const date = tips[index].date;
        const supabaseTips = await getSupabaseTips(user.id);
        const tipToDelete = supabaseTips.find(tip => tip.date === date);
        
        let success = false;
        
        if (tipToDelete) {
          // Delete from Supabase
          success = await deleteSupabaseTip(tipToDelete.id, user.id);
        }
        
        // Update local state regardless of Supabase result
        const newTips = [...tips];
        newTips.splice(index, 1);
        setTips(newTips);
        
        // Also update localStorage
        const storageKey = `tips_${user.id}`;
        localStorage.setItem(storageKey, JSON.stringify(newTips));
        
        if (success) {
          setSyncStatus('Tip deleted successfully');
        } else if (tipToDelete) {
          setSyncStatus('Error deleting tip from database, but removed locally');
        } else {
          setSyncStatus('Tip deleted locally only');
        }
        
        // Reload from Supabase to ensure consistency
        const refreshedTips = await getSupabaseTips(user.id);
        if (refreshedTips) {
          const refreshedFormattedTips = refreshedTips.map(tip => ({
            date: tip.date,
            amount: tip.amount
          }));
          setTips(refreshedFormattedTips);
        }
      } catch (error) {
        console.error('Error deleting tip:', error);
        setSyncStatus('Error with database, tip deleted locally only');
        
        // Fall back to just updating local state
        const newTips = [...tips];
        newTips.splice(index, 1);
        setTips(newTips);
        
        // Also update localStorage
        const storageKey = `tips_${user.id}`;
        localStorage.setItem(storageKey, JSON.stringify(newTips));
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Change month
  const changeMonth = (increment: number) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setSelectedMonth(newMonth);
  };

  // Render calendar
  const renderCalendar = () => {
    if (!user) return;
    
    const calendarView = document.getElementById('calendarView');
    if (!calendarView) return;
    
    calendarView.innerHTML = '';

    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
      const dayLabel = document.createElement('div');
      dayLabel.textContent = day;
      dayLabel.style.fontWeight = '600';
      dayLabel.style.color = '#00a3af';
      dayLabel.style.fontSize = '12px';
      calendarView.appendChild(dayLabel);
    });

    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day empty';
      calendarView.appendChild(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayDiv = document.createElement('div');
      dayDiv.className = 'calendar-day';
      dayDiv.dataset.date = dateStr;
      dayDiv.onclick = () => {
        setTipDate(dateStr);
        const amountInput = document.getElementById('tipAmount') as HTMLInputElement;
        if (amountInput) {
          amountInput.focus();
        }
      };
      
      const dayNum = document.createElement('span');
      dayNum.textContent = day.toString();
      dayDiv.appendChild(dayNum);

      const dayTips = tips.filter(tip => tip.date === dateStr);
      if (dayTips.length > 0) {
        dayDiv.classList.add('has-tip');
        const total = dayTips.reduce((sum, tip) => sum + tip.amount, 0);
        const tipText = document.createElement('span');
        tipText.className = 'tip-text';
        tipText.textContent = `$${total.toFixed(2)}`;
        dayDiv.appendChild(tipText);
      }

      // Check if this is today's date
      const today = new Date();
      if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        dayDiv.classList.add('today');
      }

      calendarView.appendChild(dayDiv);
    }
  };

  // Update totals
  const updateTotals = () => {
    if (!user) return;
    
    const today = new Date();
    
    // Calculate week start (Sunday)
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    // Calculate month start (1st day of current month)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);
    
    // Calculate year start (January 1st of current year)
    const yearStart = new Date(today.getFullYear(), 0, 1);
    yearStart.setHours(0, 0, 0, 0);

    // Calculate weekly total - tips from this week
    const weeklyTotalValue = tips
      .filter(tip => {
        const tipDate = new Date(tip.date);
        tipDate.setHours(0, 0, 0, 0);
        return tipDate >= weekStart;
      })
      .reduce((sum, tip) => sum + tip.amount, 0);
    
    // Calculate monthly total - tips from this month
    const monthlyTotalValue = tips
      .filter(tip => {
        const tipDate = new Date(tip.date);
        tipDate.setHours(0, 0, 0, 0);
        return tipDate >= monthStart;
      })
      .reduce((sum, tip) => sum + tip.amount, 0);
      
    // Calculate yearly total - tips from this year
    const yearlyTotalValue = tips
      .filter(tip => {
        const tipDate = new Date(tip.date);
        tipDate.setHours(0, 0, 0, 0);
        return tipDate >= yearStart;
      })
      .reduce((sum, tip) => sum + tip.amount, 0);

    setWeeklyTotal(weeklyTotalValue.toFixed(2));
    setMonthlyTotal(monthlyTotalValue.toFixed(2));
    setYearlyTotal(yearlyTotalValue.toFixed(2));
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-pulse text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render the dashboard (will redirect to signin)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-400">Tip Tracker Dashboard</h1>
        
        {/* Status message */}
        {syncStatus && (
          <div className={`text-center mb-4 text-sm ${syncStatus.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {syncStatus}
            {isSyncing && (
              <span className="inline-block ml-2 w-4 h-4 border-t-2 border-green-400 rounded-full animate-spin"></span>
            )}
          </div>
        )}
        
        {/* Sync button */}
        <div className="text-center mb-6">
          <button 
            onClick={async () => {
              if (!user) return;
              
              setIsSyncing(true);
              setSyncStatus('Syncing with database...');
              
              try {
                // Get latest from Supabase
                const supabaseTips = await getSupabaseTips(user.id);
                
                if (supabaseTips && supabaseTips.length > 0) {
                  const formattedTips = supabaseTips.map(tip => ({
                    date: tip.date,
                    amount: tip.amount
                  }));
                  
                  setTips(formattedTips);
                  
                  // Update localStorage
                  const storageKey = `tips_${user.id}`;
                  localStorage.setItem(storageKey, JSON.stringify(formattedTips));
                  
                  setSyncStatus('Synced successfully with database');
                } else {
                  // If no tips in Supabase, sync from localStorage
                  const storageKey = `tips_${user.id}`;
                  const storedTips = localStorage.getItem(storageKey);
                  
                  if (storedTips) {
                    const parsedTips = JSON.parse(storedTips);
                    
                    let syncCount = 0;
                    for (const tip of parsedTips) {
                      const success = await saveTipToSupabase(user.id, tip.date, tip.amount);
                      if (success) syncCount++;
                    }
                    
                    setSyncStatus(`Synced ${syncCount} of ${parsedTips.length} tips to database`);
                  } else {
                    setSyncStatus('No tips to sync');
                  }
                }
              } catch (error) {
                console.error('Error syncing tips:', error);
                setSyncStatus('Error syncing with database');
              } finally {
                setIsSyncing(false);
              }
            }}
            disabled={isSyncing}
            className="bg-gray-800 hover:bg-gray-700 text-white text-sm py-1 px-4 rounded-full transition-colors disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : 'Sync Tips'}
          </button>
        </div>
        
        <div className="dashboard-container">
          {/* Totals Section */}
          <div className="totals-section">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-400 mb-2">This Week</h3>
                <p className="text-3xl font-bold text-white">${weeklyTotal}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-400 mb-2">This Month</h3>
                <p className="text-3xl font-bold text-white">${monthlyTotal}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-400 mb-2">This Year</h3>
                <p className="text-3xl font-bold text-white">${yearlyTotal}</p>
              </div>
            </div>
          </div>
          
          {/* Calendar Section */}
          <div className="calendar-section mb-8">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={() => changeMonth(-1)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-xl font-bold">
                  {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button 
                  onClick={() => changeMonth(1)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div id="calendarView" className="grid grid-cols-7 gap-2 text-center">
                {/* Calendar will be rendered here by renderCalendar() */}
              </div>
            </div>
          </div>
          
          {/* Add Tip Section */}
          <div className="add-tip-section mb-8">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Add New Tip</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-gray-400 mb-2">Date</label>
                  <input 
                    type="date" 
                    value={tipDate}
                    onChange={(e) => setTipDate(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-400 mb-2">Amount ($)</label>
                  <input 
                    type="number" 
                    id="tipAmount"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={addTip}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:from-cyan-600 hover:to-teal-600 transition-all shadow-lg disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Add Tip'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Tips Section */}
          <div className="recent-tips-section">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Recent Tips</h3>
              {tips.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-2 px-4 text-gray-400">Date</th>
                        <th className="text-right py-2 px-4 text-gray-400">Amount</th>
                        <th className="text-right py-2 px-4 text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...tips]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5)
                        .map((tip, index) => (
                          <tr key={`${tip.date}-${index}`} className="border-b border-gray-800">
                            <td className="py-2 px-4">{new Date(tip.date).toLocaleDateString()}</td>
                            <td className="py-2 px-4 text-right">${tip.amount.toFixed(2)}</td>
                            <td className="py-2 px-4 text-right">
                              <button 
                                onClick={() => editTip(tips.findIndex(t => t.date === tip.date))}
                                className="text-cyan-500 hover:text-cyan-400 mr-2"
                                disabled={isLoading}
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => deleteTip(tips.findIndex(t => t.date === tip.date))}
                                className="text-red-500 hover:text-red-400"
                                disabled={isLoading}
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
                <p className="text-gray-400 text-center py-4">No tips recorded yet. Add your first tip above!</p>
              )}
              {tips.length > 5 && (
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => router.push('/history')}
                    className="text-cyan-500 hover:text-cyan-400"
                  >
                    View All Tips
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border-radius: 0.5rem;
          background-color: rgba(31, 41, 55, 0.5);
          position: relative;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .calendar-day:hover {
          background-color: rgba(31, 41, 55, 0.8);
        }
        
        .calendar-day.empty {
          background-color: transparent;
          cursor: default;
        }
        
        .calendar-day.today {
          border: 2px solid #06b6d4;
        }
        
        .calendar-day.has-tip {
          background-color: rgba(6, 182, 212, 0.2);
        }
        
        .tip-text {
          font-size: 0.75rem;
          color: #06b6d4;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
} 