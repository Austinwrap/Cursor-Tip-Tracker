'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../lib/AuthContext';
import { formatDate, formatCurrency } from '../lib/dateUtils';
import PastTipForm from './PastTipForm';

interface TipCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

interface Tip {
  date: string;
  amount: number;
}

const TipCalendar: React.FC<TipCalendarProps> = ({ selectedDate: externalSelectedDate, onDateSelect }) => {
  const [tips, setTips] = useState<Tip[]>([]);
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
      // Get tips from localStorage
      const storageKey = `tips_${user.id}`;
      const storedTips = localStorage.getItem(storageKey);
      
      if (storedTips) {
        const allTips: Tip[] = JSON.parse(storedTips);
        setTips(allTips);
        
        // Calculate monthly total
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const monthStart = new Date(year, month, 1).toISOString().split('T')[0];
        const monthEnd = new Date(year, month + 1, 0).toISOString().split('T')[0];
        
        const monthlyTips = allTips.filter(tip => 
          tip.date >= monthStart && tip.date <= monthEnd
        );
        
        const monthTotal = monthlyTips.reduce((sum, tip) => sum + tip.amount, 0);
        setMonthlyTotal(monthTotal);
        
        // Calculate weekly total (current week)
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek); // Go back to Sunday
        const weeklyStartDate = startOfWeek.toISOString().split('T')[0];
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        const weeklyEndDate = endOfWeek.toISOString().split('T')[0];
        
        const weeklyTips = allTips.filter(tip => 
          tip.date >= weeklyStartDate && tip.date <= weeklyEndDate
        );
        
        const weekTotal = weeklyTips.reduce((sum, tip) => sum + tip.amount, 0);
        setWeeklyTotal(weekTotal);
      } else {
        setTips([]);
        setMonthlyTotal(0);
        setWeeklyTotal(0);
      }
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
      
      // Save tip to localStorage
      const storageKey = `tips_${user.id}`;
      const storedTips = localStorage.getItem(storageKey);
      let tipsList: Tip[] = [];
      
      if (storedTips) {
        tipsList = JSON.parse(storedTips);
      }
      
      // Check if a tip already exists for this date
      const existingTipIndex = tipsList.findIndex(tip => tip.date === quickEditDate);
      
      if (existingTipIndex !== -1) {
        // Update existing tip
        tipsList[existingTipIndex].amount = amountInCents;
      } else {
        // Add new tip
        tipsList.push({
          date: quickEditDate,
          amount: amountInCents
        });
      }
      
      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(tipsList));
      
      // Success!
      setQuickEditSuccess(`$${quickEditAmount} saved for ${formatDate(quickEditDate)}`);
      setQuickEditAmount('');
      setQuickEditDate(null);
      
      // Refresh tips
      await loadTips();
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
                {sortedTips.map((tip, index) => {
                  const date = new Date(tip.date);
                  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
                  
                  return (
                    <tr 
                      key={index} 
                      className="bg-gray-900/30 hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => handleDateClick(tip.date)}
                    >
                      <td className="px-4 py-3">{formatDate(tip.date)}</td>
                      <td className="px-4 py-3">{dayOfWeek}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(tip.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Render the calendar view
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    // Create array of day elements
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-14 bg-gray-900/20 rounded-md"></div>
      );
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = dateString === new Date().toISOString().split('T')[0];
      const isSelected = dateString === selectedDate;
      const isQuickEdit = dateString === quickEditDate;
      
      // Find tip for this day
      const dayTip = tips.find(tip => tip.date === dateString);
      
      days.push(
        <div 
          key={dateString}
          className={`
            relative h-14 rounded-md p-1 cursor-pointer transition-all
            ${dayTip ? 'bg-green-900/20 hover:bg-green-900/30' : 'bg-gray-900/30 hover:bg-gray-800'}
            ${isToday ? 'ring-2 ring-cyan-500' : ''}
            ${isSelected ? 'ring-2 ring-white' : ''}
            ${isQuickEdit ? 'ring-2 ring-yellow-500' : ''}
          `}
          onClick={() => handleDateClick(dateString)}
        >
          <div className="text-xs font-semibold">{day}</div>
          {dayTip && (
            <div className="absolute bottom-1 right-1 text-xs font-bold text-green-400">
              ${(dayTip.amount / 100).toFixed(0)}
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="bg-black border border-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Tip Calendar</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowLedger(true)}
              className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-md text-sm transition-colors"
            >
              View List
            </button>
            <button 
              onClick={() => {
                const prevMonth = new Date(currentMonth);
                prevMonth.setMonth(prevMonth.getMonth() - 1);
                setCurrentMonth(prevMonth);
              }}
              className="text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <span className="text-white font-medium">
              {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              onClick={() => {
                const nextMonth = new Date(currentMonth);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                setCurrentMonth(nextMonth);
              }}
              className="text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
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
        
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-400">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
        
        {/* Quick edit form */}
        {quickEditDate && (
          <div className="mt-6 bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Quick Edit: {formatDate(quickEditDate)}
            </h3>
            
            {quickEditError && (
              <div className="mb-4 text-red-400 text-sm">
                {quickEditError}
              </div>
            )}
            
            {quickEditSuccess && (
              <div className="mb-4 text-green-400 text-sm">
                {quickEditSuccess}
              </div>
            )}
            
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">$</span>
                </div>
                <input
                  type="number"
                  value={quickEditAmount}
                  onChange={(e) => setQuickEditAmount(e.target.value)}
                  className="w-full bg-black border border-gray-700 focus:border-white text-white rounded-md py-2 pl-8 transition-colors"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <button
                onClick={saveQuickTip}
                disabled={savingQuickEdit}
                className={`px-4 py-2 rounded-md transition-colors ${
                  savingQuickEdit
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {savingQuickEdit ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setQuickEditDate(null)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-black border border-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-cyan-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-500 text-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Error Loading Tips</h2>
        <p>{error}</p>
        <button
          onClick={() => loadTips()}
          className="mt-4 bg-white text-red-900 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show either the ledger or calendar view
  return showLedger ? renderLedger() : renderCalendar();
};

export default TipCalendar; 