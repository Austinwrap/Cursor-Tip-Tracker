'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getTips, Tip } from '../lib/supabase';
import { formatDate, formatCurrency } from '../lib/dateUtils';

const TipCalendar: React.FC = () => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { user } = useAuth();

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
  }, [user]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
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
      calendarDays.push(<div key={`empty-${i}`} className="h-20 border border-gray-800 bg-black/20"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const hasTip = dateString in tipMap;
      const isToday = new Date().toISOString().split('T')[0] === dateString;
      
      calendarDays.push(
        <div 
          key={dateString} 
          className={`h-20 border border-gray-800 p-2 transition-colors ${
            isToday ? 'bg-gray-900' : 'bg-black/20'
          } ${hasTip ? 'hover:bg-gray-800' : ''}`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-xs ${isToday ? 'font-bold text-white' : 'text-gray-500'}`}>
              {day}
            </span>
            {hasTip && (
              <span className="text-lg font-bold text-white">
                {formatCurrency(tipMap[dateString])}
              </span>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-black border border-gray-800 rounded-sm p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => setCurrentMonth(new Date(year, month - 1))}
            className="text-gray-500 hover:text-white transition-colors"
          >
            ←
          </button>
          <h2 className="text-xl font-bold text-white uppercase tracking-wide">
            {monthNames[month].substring(0, 3)} {year}
          </h2>
          <button 
            onClick={() => setCurrentMonth(new Date(year, month + 1))}
            className="text-gray-500 hover:text-white transition-colors"
          >
            →
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map(day => (
            <div key={day} className="text-center text-gray-500 font-medium py-2 text-xs">
              {day}
            </div>
          ))}
          {calendarDays}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border-l-4 border-red-500 text-white p-3 rounded-sm">
        {error}
      </div>
    );
  }

  return renderCalendar();
};

export default TipCalendar; 