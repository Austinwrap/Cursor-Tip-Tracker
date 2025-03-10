'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Tip {
  date: string;
  amount: number;
}

export default function DailyAveragesChart() {
  const { user } = useAuth();
  const [tips, setTips] = useState<Tip[]>([]);
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Load tips from localStorage
    const loadTips = () => {
      setIsLoading(true);
      try {
        const storageKey = `tips_${user.id}`;
        const storedTips = localStorage.getItem(storageKey);
        
        if (storedTips) {
          const parsedTips = JSON.parse(storedTips);
          setTips(parsedTips);
          processChartData(parsedTips);
        } else {
          setTips([]);
          setChartData({
            labels: [],
            datasets: [],
          });
        }
      } catch (error) {
        console.error('Error loading tips:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTips();
  }, [user]);

  const processChartData = (tipsData: Tip[]) => {
    if (!tipsData.length) return;

    // Group tips by day of week
    const dayAverages = {
      Sunday: { total: 0, count: 0 },
      Monday: { total: 0, count: 0 },
      Tuesday: { total: 0, count: 0 },
      Wednesday: { total: 0, count: 0 },
      Thursday: { total: 0, count: 0 },
      Friday: { total: 0, count: 0 },
      Saturday: { total: 0, count: 0 },
    };

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Calculate totals and counts for each day
    tipsData.forEach((tip) => {
      const date = new Date(tip.date);
      const dayOfWeek = dayNames[date.getDay()];
      
      dayAverages[dayOfWeek].total += Number(tip.amount);
      dayAverages[dayOfWeek].count += 1;
    });

    // Calculate averages
    const labels = dayNames;
    const averages = dayNames.map((day) => 
      dayAverages[day].count > 0 
        ? dayAverages[day].total / dayAverages[day].count 
        : 0
    );

    setChartData({
      labels,
      datasets: [
        {
          label: 'Average Tips by Day of Week',
          data: averages,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
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
        text: 'Average Tips by Day of Week',
        color: 'white',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `$${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value;
          },
          color: 'rgba(255, 255, 255, 0.7)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        }
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        }
      }
    },
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 animate-pulse">
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (!tips.length) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400">Not enough data to display daily averages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-xl font-semibold mb-4">Daily Averages</h2>
      <div className="h-64">
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
} 