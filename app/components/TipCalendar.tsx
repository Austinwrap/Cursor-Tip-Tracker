'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../lib/AuthContext';
import { formatDate, formatCurrency } from '../lib/dateUtils';
import PastTipForm from './PastTipForm';
import { supabase } from '../lib/supabase';
import * as tipService from '../lib/tipService';

interface TipCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

const TipCalendar: React.FC<TipCalendarProps> = ({ selectedDate: externalSelectedDate, onDateSelect }) => {
  const [tips, setTips] = useState<tipService.Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [quickEditDate, setQuickEditDate] = useState<string | null>(null);
  const [quickEditAmount, setQuickEditAmount] = useState<string>('');
  const [savingQuickEdit, setSavingQuickEdit] = useState(false);
  const [quickEditSuccess, setQuickEditSuccess] = useState<string | null>(null);
  const [quickEditError, setQuickEditError] = useState<string | null>(null);
  const [showLedger, setShowLedger] = useState(false);
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [weeklyTotal, setWeeklyTotal] = useState<number>(0);
  const { user } = useAuth();

  // Load tips for the current month
  const loadTips = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get all tips for the user
      const allTips = await tipService.getAllTips(user.id);
      setTips(allTips);
      
      // Calculate monthly total
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const monthTotal = await tipService.getMonthlyTotal(user.id, year, month);
      setMonthlyTotal(monthTotal);
      
      // Calculate weekly total (current week)
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - dayOfWeek); // Go back to Sunday
      const weeklyStartDate = startOfWeek.toISOString().split('T')[0];
      const weekTotal = await tipService.getWeeklyTotal(user.id, weeklyStartDate);
      setWeeklyTotal(weekTotal);
    } catch (err) {
      console.error('Error loading tips:', err);
      setError('Failed to load tips. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, currentMonth]);

  // If external date control is provided, use it
  useEffect(() => {
    if (externalSelectedDate && onDateSelect) {
      // Update the current month to match the external selected date
      setCurrentMonth(new Date(externalSelectedDate));
    }
  }, [externalSelectedDate, onDateSelect]);

  // Load tips when component mounts or month changes
  useEffect(() => {
    loadTips();
  }, [loadTips]);

  // Set up real-time subscription to tips table
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for tips table');
    
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
          loadTips();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Clean up subscription on unmount
    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(subscription);
    };
  }, [user, loadTips]);

  const handleTipAdded = async () => {
    // Refresh tips after a new one is added
    await loadTips();
    setSelectedDate(null);
  };

  // Save a quick tip directly from the calendar
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
      
      // Save the tip using our service
      const success = await tipService.saveTip(user.id, quickEditDate, amountInCents);
      
      if (success) {
        // Success!
        setQuickEditSuccess(`$${quickEditAmount} saved for ${formatDate(quickEditDate)}`);
        setQuickEditAmount('');
        setQuickEditDate(null);
        
        // Refresh tips
        await loadTips();
      } else {
        setQuickEditError('Failed to save tip. Please try again.');
      }
    } catch (err) {
      console.error('Error in quick save tip:', err);
      setQuickEditError('An unexpected error occurred');
    } finally {
      setSavingQuickEdit(false);
    }
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

  // Render the ledger view of all tips
  const renderLedger = () => {
    // Sort tips by date, most recent first
    const sortedTips = [...tips].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return (
      <div className="bg-black border border-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Tip History</h2>
          <button 
            onClick={() => setShowLedger(false)}
            className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-md text-sm transition-colors"
          >
            Back to Calendar
          </button>
        </div>
        
        {/* Summary section */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm">Monthly Total</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(monthlyTotal)}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm">Weekly Total</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(weeklyTotal)}</p>
          </div>
        </div>
        
        {sortedTips.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No tips recorded yet. Add your first tip to see it here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-900 text-gray-400 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Date</th>
                  <th className="px-4 py-3">Day</th>
                  <th className="px-4 py-3 text-right rounded-tr-lg">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {sortedTips.map((tip) => {
                  const date = new Date(tip.date);
                  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
                  
                  return (
                    <tr 
                      key={tip.id} 
                      className="bg-gray-900/30 hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => handleDateClick(tip.date)}
                    >
                      <td className="px-4 py-3 text-gray-300">{formatDate(tip.date)}</td>
                      <td className="px-4 py-3 text-gray-400">{dayOfWeek}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-400">
                        {formatCurrency(tip.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-900">
                <tr>
                  <td className="px-4 py-3 font-bold rounded-bl-lg">Total</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-right font-bold text-green-400 rounded-br-lg">
                    {formatCurrency(tips.reduce((sum, tip) => sum + tip.amount, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        
        <div className="mt-6 flex justify-center">
          <button 
            onClick={() => loadTips()} 
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            Refresh Tip History
          </button>
        </div>
      </div>
    );
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
          
          {/* Summary section */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900 rounded-lg p-3 text-center">
              <p className="text-gray-400 text-sm">Monthly Total</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(monthlyTotal)}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 text-center">
              <p className="text-gray-400 text-sm">Weekly Total</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(weeklyTotal)}</p>
            </div>
          </div>
          
          {/* View toggle button */}
          <div className="mb-4 flex justify-center">
            <button 
              onClick={() => setShowLedger(true)}
              className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-md transition-colors"
            >
              View Tip History
            </button>
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
          
          {/* Manual refresh button */}
          <div className="mt-4 flex justify-center">
            <button 
              onClick={() => loadTips()} 
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
            >
              Refresh Calendar
            </button>
          </div>
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
          onClick={() => loadTips()}
          className="mt-2 bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return showLedger ? renderLedger() : renderCalendar();
};

export default TipCalendar; 