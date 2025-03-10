'use client';

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { useAuth } from '@/app/lib/AuthContext';

interface Tip {
  id?: string;
  user_id?: string;
  date: string;
  amount: number;
  created_at?: string;
  updated_at?: string;
}

export default function MonthlyChart() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadTips = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get tips from localStorage
        const storageKey = `tips_${user.id}`;
        const storedTips = localStorage.getItem(storageKey);
        
        if (storedTips) {
          const tips: Tip[] = JSON.parse(storedTips);
          prepareChartData(tips);
        } else {
          setError('No tips found');
        }
      } catch (err) {
        console.error('Error loading tips:', err);
        setError('Failed to load tips data');
      } finally {
        setIsLoading(false);
      }
    };

    loadTips();
  }, [user]);

  const prepareChartData = (tips: Tip[]) => {
    // Get current month's start and end
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    // Get all days in the month
    const daysInMonth = eachDayOfInterval({
      start: monthStart,
      end: monthEnd
    });
    
    // Initialize data for each day
    const dailyTotals = daysInMonth.reduce((acc, day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      acc[dateStr] = 0;
      return acc;
    }, {} as Record<string, number>);
    
    // Sum tips for each day
    tips.forEach(tip => {
      const tipDate = format(parseISO(tip.date), 'yyyy-MM-dd');
      if (dailyTotals[tipDate] !== undefined) {
        dailyTotals[tipDate] += Number(tip.amount);
      }
    });
    
    // Prepare chart data
    const labels = Object.keys(dailyTotals).map(date => format(parseISO(date), 'MMM d'));
    const data = Object.values(dailyTotals);
    
    setChartData({
      labels,
      datasets: [
        {
          label: 'Daily Tips',
          data,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
          fill: true,
        },
      ],
    });
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Tips for ${format(new Date(), 'MMMM yyyy')}`,
        color: 'white',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          callback: (value: number) => {
            return `$${value}`;
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg animate-pulse h-80">
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-400">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-80">
        <div className="h-full flex items-center justify-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-white">Monthly Tips</h3>
      {chartData && <Line data={chartData} options={options} />}
    </div>
  );
} 