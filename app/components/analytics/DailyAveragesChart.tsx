'use client';

import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { useAuth } from '@/app/lib/AuthContext';

interface Tip {
  id?: string;
  user_id?: string;
  date: string;
  amount: number;
  created_at?: string;
  updated_at?: string;
}

export default function DailyAveragesChart() {
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
    // Group tips by day of week
    const dayTotals: { [key: string]: { total: number; count: number } } = {
      'Sunday': { total: 0, count: 0 },
      'Monday': { total: 0, count: 0 },
      'Tuesday': { total: 0, count: 0 },
      'Wednesday': { total: 0, count: 0 },
      'Thursday': { total: 0, count: 0 },
      'Friday': { total: 0, count: 0 },
      'Saturday': { total: 0, count: 0 },
    };
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    tips.forEach(tip => {
      const date = new Date(tip.date);
      const dayOfWeek = dayNames[date.getDay()];
      
      dayTotals[dayOfWeek].total += Number(tip.amount);
      dayTotals[dayOfWeek].count += 1;
    });
    
    // Calculate average for each day
    const dayAverages = Object.entries(dayTotals).map(([day, data]) => ({
      day,
      average: data.count > 0 ? data.total / data.count : 0,
    }));
    
    // Sort by day of week
    dayAverages.sort((a, b) => {
      return dayNames.indexOf(a.day) - dayNames.indexOf(b.day);
    });
    
    setChartData({
      labels: dayAverages.map(d => d.day),
      datasets: [
        {
          label: 'Average Tips by Day of Week',
          data: dayAverages.map(d => d.average),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(199, 199, 199, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
          ],
          borderWidth: 1,
        },
      ],
    });
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Average Tips by Day of Week',
        color: 'white',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          callback: (value: number) => {
            return `$${value.toFixed(2)}`;
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
      <h3 className="text-xl font-semibold mb-4 text-white">Daily Averages</h3>
      {chartData && <Bar data={chartData} options={options} />}
    </div>
  );
} 