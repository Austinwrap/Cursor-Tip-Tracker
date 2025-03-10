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

export default function MonthlyChart() {
  const { user } = useAuth();
  const [tips, setTips] = useState<Tip[]>([]);
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

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
  }, [user, year]);

  const processChartData = (tipsData: Tip[]) => {
    if (!tipsData.length) return;

    // Filter tips for the selected year
    const yearTips = tipsData.filter(tip => {
      const tipDate = new Date(tip.date);
      return tipDate.getFullYear() === year;
    });

    // Group tips by month
    const monthlyTotals = Array(12).fill(0);

    yearTips.forEach(tip => {
      const date = new Date(tip.date);
      const month = date.getMonth();
      monthlyTotals[month] += Number(tip.amount);
    });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    setChartData({
      labels: monthNames,
      datasets: [
        {
          label: `Monthly Tips for ${year}`,
          data: monthlyTotals,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

  const changeYear = (increment: number) => {
    setYear(prevYear => prevYear + increment);
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Monthly Tips for ${year}`,
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
          <p className="text-gray-400">No tip data available for charts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Monthly Overview</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => changeYear(-1)} 
            className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
          >
            &larr;
          </button>
          <span>{year}</span>
          <button 
            onClick={() => changeYear(1)} 
            className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
          >
            &rarr;
          </button>
        </div>
      </div>
      <div className="h-64">
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
} 