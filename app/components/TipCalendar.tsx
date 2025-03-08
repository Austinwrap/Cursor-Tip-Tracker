'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getTips, Tip } from '../lib/supabase';
import { formatDate, formatCurrency } from '../lib/dateUtils';
import PastTipForm from './PastTipForm';
import { supabase } from '../lib/supabase';

interface TipCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

const TipCalendar: React.FC<TipCalendarProps> = ({ selectedDate: externalSelectedDate, onDateSelect }) => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Used to trigger refreshes
  const [quickEditDate, setQuickEditDate] = useState<string | null>(null);
  const [quickEditAmount, setQuickEditAmount] = useState<string>('');
  const [savingQuickEdit, setSavingQuickEdit] = useState(false);
  const [quickEditSuccess, setQuickEditSuccess] = useState<string | null>(null);
  const [quickEditError, setQuickEditError] = useState<string | null>(null);
  const { user } = useAuth();

  // Memoized fetchTips function to avoid recreation on each render
  const fetchTips = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching tips for user:', user.id);
      const tipsData = await getTips(user.id);
      console.log('Tips fetched:', tipsData);
      
      // Force a re-render by creating a new array
      setTips([...tipsData]);
      
      // Debug: Log the tips that should be displayed
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const monthStart = new Date(year, month, 1).toISOString().split('T')[0];
      const monthEnd = new Date(year, month + 1, 0).toISOString().split('T')[0];
      
      console.log('Current month range:', monthStart, 'to', monthEnd);
      
      const currentMonthTips = tipsData.filter(tip => 
        tip.date >= monthStart && tip.date <= monthEnd
      );
      
      console.log('Tips for current month:', currentMonthTips);
      console.log('Monthly total:', calculateMonthlyTotal(tipsData));
    } catch (err) {
      console.error('Error fetching tips:', err);
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Helper function to calculate monthly total
  const calculateMonthlyTotal = (tipsData = tips) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const monthStart = new Date(year, month, 1).toISOString().split('T')[0];
    const monthEnd = new Date(year, month + 1, 0).toISOString().split('T')[0];
    
    let total = 0;
    tipsData.forEach(tip => {
      if (tip.date >= monthStart && tip.date <= monthEnd) {
        total += tip.amount;
      }
    });
    
    return total;
  };

  // If external date control is provided, use it
  useEffect(() => {
    if (externalSelectedDate && onDateSelect) {
      // Update the current month to match the external selected date
      setCurrentMonth(new Date(externalSelectedDate));
    }
  }, [externalSelectedDate, onDateSelect]);

  // Fetch tips when component mounts or refreshTrigger changes
  useEffect(() => {
    fetchTips();
  }, [fetchTips, refreshTrigger]);

  // Set up real-time subscription to tips table
  useEffect(() => {
    if (!user) return;

    // Subscribe to changes in the tips table for this user
    const subscription = supabase
      .channel('tips-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'tips',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          // Refresh tips when any change is detected
          fetchTips();
        }
      )
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, fetchTips]);

  // Force refresh on mount and every 5 seconds
  useEffect(() => {
    // Initial fetch
    fetchTips();
    
    // Set up interval for periodic refreshes
    const intervalId = setInterval(() => {
      console.log('Periodic refresh triggered');
      fetchTips();
    }, 5000); // Refresh every 5 seconds
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchTips]);

  const handleTipAdded = async () => {
    // Refresh tips after a new one is added
    if (!user) return;
    
    try {
      console.log('Tip added, refreshing data...');
      
      // Increment refresh trigger to force a refresh
      setRefreshTrigger(prev => prev + 1);
      
      // Explicitly fetch tips again
      await fetchTips();
      
      // Close the form after successful addition
      setSelectedDate(null);
    } catch (err) {
      console.error('Error refreshing tips:', err);
    }
  };

  // Direct tip saving function
  const saveQuickTip = async () => {
    if (!user || !quickEditDate || !quickEditAmount) return;
    
    setSavingQuickEdit(true);
    setQuickEditError(null);
    setQuickEditSuccess(null);
    
    try {
      // Convert dollars to cents
      const amountInCents = Math.round(Number(quickEditAmount) * 100);
      
      if (isNaN(amountInCents) || amountInCents <= 0) {
        setQuickEditError('Please enter a valid amount');
        setSavingQuickEdit(false);
        return;
      }
      
      // Use the robust tip saving approach
      const result = await saveTip(user.id, quickEditDate, amountInCents);
      
      if (result) {
        // Success!
        setQuickEditSuccess(`$${quickEditAmount} saved for ${formatDate(quickEditDate)}`);
        setQuickEditAmount('');
        setQuickEditDate(null);
        
        // Refresh tips
        setRefreshTrigger(prev => prev + 1);
        
        // Explicitly fetch tips again
        await fetchTips();
        
        // Force a re-render
        setTimeout(() => {
          fetchTips();
        }, 1000);
      } else {
        setQuickEditError('Failed to save tip after multiple attempts. Please try again.');
      }
    } catch (err) {
      console.error('Error in quick save tip:', err);
      setQuickEditError('An unexpected error occurred');
    } finally {
      setSavingQuickEdit(false);
    }
  };

  // Robust tip saving function with multiple fallback approaches
  const saveTip = async (userId: string, date: string, amountInCents: number) => {
    console.log('Attempting to save tip:', { userId, date, amountInCents });
    
    // First approach: Direct Supabase query
    try {
      // Check if a tip already exists for this date
      const { data: existingTip, error: fetchError } = await supabase
        .from('tips')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error checking for existing tip (approach 1):', fetchError);
        // Continue to next approach
      } else {
        let result;
        
        if (existingTip) {
          // Update existing tip
          result = await supabase
            .from('tips')
            .update({ amount: amountInCents })
            .eq('id', existingTip.id);
            
          if (!result.error) {
            console.log('Successfully updated tip (approach 1)');
            return true;
          }
          console.error('Error updating tip (approach 1):', result.error);
        } else {
          // Insert new tip
          result = await supabase
            .from('tips')
            .insert([{ 
              user_id: userId, 
              date: date, 
              amount: amountInCents 
            }]);
            
          if (!result.error) {
            console.log('Successfully inserted tip (approach 1)');
            return true;
          }
          console.error('Error inserting tip (approach 1):', result.error);
        }
      }
    } catch (err) {
      console.error('Unexpected error in saveTip approach 1:', err);
    }
    
    // Second approach: Using RPC (Remote Procedure Call)
    try {
      const { data, error } = await supabase.rpc('save_tip', {
        p_user_id: userId,
        p_date: date,
        p_amount: amountInCents
      });
      
      if (!error) {
        console.log('Successfully saved tip using RPC (approach 2)');
        return true;
      }
      
      console.error('Error saving tip using RPC (approach 2):', error);
    } catch (err) {
      console.error('Unexpected error in saveTip approach 2:', err);
    }
    
    // Third approach: Using raw SQL via Supabase
    try {
      // First check if tip exists
      const { data: existsData, error: existsError } = await supabase.rpc('tip_exists', {
        p_user_id: userId,
        p_date: date
      });
      
      if (existsError) {
        console.error('Error checking if tip exists (approach 3):', existsError);
      } else {
        const exists = existsData;
        
        if (exists) {
          // Update
          const { error: updateError } = await supabase.rpc('update_tip', {
            p_user_id: userId,
            p_date: date,
            p_amount: amountInCents
          });
          
          if (!updateError) {
            console.log('Successfully updated tip using SQL (approach 3)');
            return true;
          }
          
          console.error('Error updating tip using SQL (approach 3):', updateError);
        } else {
          // Insert
          const { error: insertError } = await supabase.rpc('insert_tip', {
            p_user_id: userId,
            p_date: date,
            p_amount: amountInCents
          });
          
          if (!insertError) {
            console.log('Successfully inserted tip using SQL (approach 3)');
            return true;
          }
          
          console.error('Error inserting tip using SQL (approach 3):', insertError);
        }
      }
    } catch (err) {
      console.error('Unexpected error in saveTip approach 3:', err);
    }
    
    // Fourth approach: Simplified direct insert/update with less error checking
    try {
      // Try update first (will do nothing if no record exists)
      const { error: updateError } = await supabase
        .from('tips')
        .update({ amount: amountInCents })
        .match({ user_id: userId, date: date });
      
      if (!updateError) {
        // Check if any rows were affected
        const { count, error: countError } = await supabase
          .from('tips')
          .select('*', { count: 'exact', head: true })
          .match({ user_id: userId, date: date });
        
        if (!countError && count && count > 0) {
          console.log('Successfully updated tip (approach 4)');
          return true;
        }
      }
      
      // If update didn't work or no rows existed, try insert
      const { error: insertError } = await supabase
        .from('tips')
        .insert([{ 
          user_id: userId, 
          date: date, 
          amount: amountInCents 
        }]);
      
      if (!insertError) {
        console.log('Successfully inserted tip (approach 4)');
        return true;
      }
      
      console.error('Error in simplified approach (approach 4):', insertError);
    } catch (err) {
      console.error('Unexpected error in saveTip approach 4:', err);
    }
    
    // If all approaches failed, return false
    return false;
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateClick = (dateString: string) => {
    // If external date control is provided, use it
    if (onDateSelect) {
      onDateSelect(new Date(dateString));
      return;
    }
    
    // For quick edit mode
    if (quickEditDate === dateString) {
      setQuickEditDate(null);
    } else {
      setQuickEditDate(dateString);
      // Pre-fill with existing tip amount if available
      const existingTip = tips.find(tip => tip.date === dateString);
      if (existingTip) {
        setQuickEditAmount((existingTip.amount / 100).toString());
      } else {
        setQuickEditAmount('');
      }
    }
    
    // For regular form mode
    if (selectedDate === dateString) {
      setSelectedDate(null);
    } else {
      setSelectedDate(dateString);
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Create a map of date strings to tip amounts for quick lookup
    const tipMap: Record<string, number> = {};
    tips.forEach(tip => {
      tipMap[tip.date] = tip.amount;
      console.log(`Tip for ${tip.date}: ${tip.amount}`);
    });
    
    // Generate calendar days
    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-24 border border-gray-800 bg-black/20"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const hasTip = dateString in tipMap;
      const tipAmount = hasTip ? tipMap[dateString] : 0;
      
      // Debug log for this specific day
      if (hasTip) {
        console.log(`Rendering tip for ${dateString}: $${tipAmount/100}`);
      }
      
      const isToday = new Date().toISOString().split('T')[0] === dateString;
      const isSelected = selectedDate === dateString;
      const isQuickEdit = quickEditDate === dateString;
      const isPastOrToday = date <= new Date();
      
      calendarDays.push(
        <div 
          key={dateString} 
          className={`h-24 border border-gray-800 p-2 transition-all ${
            isToday ? 'bg-gray-900' : 'bg-black/20'
          } ${isSelected ? 'ring-2 ring-white' : ''} ${
            isPastOrToday ? 'cursor-pointer hover:bg-gray-800' : ''
          } ${hasTip ? 'border-green-500 border-2' : ''} ${
            isQuickEdit ? 'bg-gray-800' : ''
          }`}
          onClick={() => isPastOrToday && handleDateClick(dateString)}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start">
              <span className={`text-sm ${isToday ? 'font-bold text-white' : 'text-gray-500'}`}>
                {day}
              </span>
            </div>
            
            {hasTip && !isQuickEdit && (
              <div className="flex-grow flex items-center justify-center">
                <div className="bg-green-900/30 px-3 py-2 rounded-lg text-center">
                  <span className="text-xl font-bold text-green-400">
                    {formatCurrency(tipAmount)}
                  </span>
                </div>
              </div>
            )}
            
            {isQuickEdit && (
              <div className="mt-1 flex flex-col space-y-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                    <span className="text-gray-400">$</span>
                  </div>
                  <input
                    type="number"
                    value={quickEditAmount}
                    onChange={(e) => setQuickEditAmount(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded py-1 pl-5 pr-2"
                    placeholder="0"
                    min="0"
                    step="1"
                    autoFocus
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    saveQuickTip();
                  }}
                  disabled={savingQuickEdit}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded"
                >
                  {savingQuickEdit ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // Calculate monthly total
    const monthlyTotal = calculateMonthlyTotal();
    
    return (
      <div className="space-y-6">
        <div className="bg-black border border-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => setCurrentMonth(new Date(year, month - 1))}
              className="text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
            >
              ←
            </button>
            <h2 className="text-xl font-bold text-white uppercase tracking-wide">
              {monthNames[month]} {year}
            </h2>
            <button 
              onClick={() => setCurrentMonth(new Date(year, month + 1))}
              className="text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
            >
              →
            </button>
          </div>
          
          {/* Monthly total display */}
          <div className="mb-4 p-3 bg-gray-900 rounded-lg text-center">
            <p className="text-gray-400 text-sm">Monthly Total</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(monthlyTotal)}</p>
          </div>
          
          {/* Quick edit feedback messages */}
          {quickEditSuccess && (
            <div className="mb-4 p-2 bg-green-900/30 border border-green-500/30 rounded text-sm text-green-400 text-center">
              {quickEditSuccess}
            </div>
          )}
          
          {quickEditError && (
            <div className="mb-4 p-2 bg-red-900/30 border border-red-500/30 rounded text-sm text-red-400 text-center">
              {quickEditError}
            </div>
          )}
          
          <div className="grid grid-cols-7 gap-1">
            {dayNames.map(day => (
              <div key={day} className="text-center text-gray-500 font-medium py-2 text-xs">
                {day}
              </div>
            ))}
            {calendarDays}
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">Click on a date to add or edit a tip</p>
          </div>
          
          {/* Debug info - only visible in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-2 bg-gray-900 rounded text-xs text-gray-400">
              <p>Debug Info:</p>
              <p>Tips count: {tips.length}</p>
              <p>Current month: {monthNames[month]} {year}</p>
              <p>Monthly total: {formatCurrency(monthlyTotal)}</p>
              <button 
                onClick={() => fetchTips()} 
                className="mt-1 bg-gray-800 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs"
              >
                Refresh Tips
              </button>
            </div>
          )}
        </div>
        
        {selectedDate && (
          <div className="animate-fadeIn">
            <PastTipForm onTipAdded={handleTipAdded} selectedDate={selectedDate} />
          </div>
        )}
      </div>
    );
  };

  if (loading && tips.length === 0) {
    return (
      <div className="bg-black border border-gray-800 rounded-lg p-6 shadow-lg">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
          <p className="mt-2 text-gray-400">Loading your tip history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border-l-4 border-red-500 text-white p-4 rounded-lg">
        <p className="font-bold">Error loading tips</p>
        <p>{error}</p>
        <button 
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="mt-2 bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return renderCalendar();
};

export default TipCalendar; 