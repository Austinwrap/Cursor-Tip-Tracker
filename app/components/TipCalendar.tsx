'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getTips, Tip } from '../lib/supabase';
import { formatDate, formatCurrency } from '../lib/dateUtils';
import PastTipForm from './PastTipForm';

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
  const { user } = useAuth();

  // If external date control is provided, use it
  useEffect(() => {
    if (externalSelectedDate && onDateSelect) {
      // Update the current month to match the external selected date
      setCurrentMonth(new Date(externalSelectedDate));
    }
  }, [externalSelectedDate, onDateSelect]);

  useEffect(() => {
    const fetchTips = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const tipsData = await getTips(user.id);
        setTips(tipsData);
      } catch (err) {
        console.error('Error fetching tips:', err);
        setError('Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, [user, refreshTrigger]); // Add refreshTrigger to dependencies

  const handleTipAdded = async () => {
    // Refresh tips after a new one is added
    if (!user) return;
    
    try {
      // Increment refresh trigger to force a refresh
      setRefreshTrigger(prev => prev + 1);
      
      // Close the form after successful addition
      setSelectedDate(null);
    } catch (err) {
      console.error('Error refreshing tips:', err);
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
    
    // Otherwise use internal state
    if (selectedDate === dateString) {
      setSelectedDate(null);
    } else {
      setSelectedDate(dateString);
    }
  };

  // Calculate total tips for the current month
  const calculateMonthlyTotal = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const monthStart = new Date(year, month, 1).toISOString().split('T')[0];
    const monthEnd = new Date(year, month + 1, 0).toISOString().split('T')[0];
    
    let total = 0;
    tips.forEach(tip => {
      if (tip.date >= monthStart && tip.date <= monthEnd) {
        total += tip.amount;
      }
    });
    
    return total;
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
      const isToday = new Date().toISOString().split('T')[0] === dateString;
      const isSelected = selectedDate === dateString;
      const isPastOrToday = date <= new Date();
      
      calendarDays.push(
        <div 
          key={dateString} 
          className={`h-24 border border-gray-800 p-2 transition-all ${
            isToday ? 'bg-gray-900' : 'bg-black/20'
          } ${isSelected ? 'ring-2 ring-white' : ''} ${
            isPastOrToday ? 'cursor-pointer hover:bg-gray-800' : ''
          } ${hasTip ? 'border-green-500 border-2' : ''}`}
          onClick={() => isPastOrToday && handleDateClick(dateString)}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start">
              <span className={`text-sm ${isToday ? 'font-bold text-white' : 'text-gray-500'}`}>
                {day}
              </span>
            </div>
            
            {hasTip && (
              <div className="flex-grow flex items-center justify-center">
                <span className="text-xl font-bold text-green-400 animate-pulse">
                  {formatCurrency(tipMap[dateString])}
                </span>
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