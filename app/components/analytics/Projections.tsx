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
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Tip {
  date: string;
  amount: number;
}

export default function Projections() {
  const { user } = useAuth();
  const [tips, setTips] = useState<Tip[]>([]);
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [projectionPeriod, setProjectionPeriod] = useState<'month' | 'year'>('month');

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
  }, [user, projectionPeriod]);

  const processChartData = (tipsData: Tip[]) => {
    if (!tipsData.length) return;

    // Sort tips by date
    const sortedTips = [...tipsData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Get the date range
    const startDate = new Date(sortedTips[0].date);
    const endDate = new Date(sortedTips[sortedTips.length - 1].date);
    
    // Calculate average daily tip
    const totalDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const totalAmount = sortedTips.reduce((sum, tip) => sum + Number(tip.amount), 0);
    const averageDailyTip = totalAmount / totalDays;

    // Generate projection data
    const today = new Date();
    const labels = [];
    const actualData = [];
    const projectionData = [];
    
    // Determine projection end date
    let projectionEndDate = new Date(today);
    if (projectionPeriod === 'month') {
      projectionEndDate.setMonth(today.getMonth() + 1);
    } else {
      projectionEndDate.setFullYear(today.getFullYear() + 1);
    }
    
    // Create data points for each day
    let currentDate = new Date(startDate);
    while (currentDate <= projectionEndDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      labels.push(dateString);
      
      // Find actual tip for this date if it exists
      const tipForDate = sortedTips.find(tip => tip.date === dateString);
      
      if (currentDate <= today) {
        // Actual data
        actualData.push(tipForDate ? Number(tipForDate.amount) : 0);
        projectionData.push(null);
      } else {
        // Projection data
        actualData.push(null);
        projectionData.push(averageDailyTip);
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Calculate cumulative sums
    let cumulativeActual = 0;
    const cumulativeActualData = actualData.map(amount => 
      amount !== null ? (cumulativeActual += amount) : null
    );
    
    // Start projection from the last actual value
    let lastActualValue = cumulativeActual;
    const cumulativeProjectionData = projectionData.map(amount => {
      if (amount !== null) {
        lastActualValue += amount;
        return lastActualValue;
      }
      return null;
    });
    
    setChartData({
      labels,
      datasets: [
        {
          label: 'Actual Tips',
          data: cumulativeActualData,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          pointRadius: 0,
          borderWidth: 2,
          fill: true,
        },
        {
          label: 'Projected Tips',
          data: cumulativeProjectionData,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          pointRadius: 0,
          borderWidth: 2,
          borderDash: [5, 5],
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
        text: `Tip Projections (${projectionPeriod === 'month' ? 'Next Month' : 'Next Year'})`,
        color: 'white',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `$${context.raw ? context.raw.toFixed(2) : 0}`;
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
        type: 'time',
        time: {
          unit: projectionPeriod === 'month' ? 'day' : 'month',
          tooltipFormat: 'MMM d, yyyy',
          displayFormats: {
            day: 'MMM d',
            month: 'MMM yyyy'
          }
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          maxRotation: 45,
          minRotation: 45,
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
          <p className="text-gray-400">Loading projections...</p>
        </div>
      </div>
    );
  }

  if (!tips.length) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400">Not enough data for projections.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Projections</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setProjectionPeriod('month')}
            className={`px-3 py-1 rounded ${
              projectionPeriod === 'month' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setProjectionPeriod('year')}
            className={`px-3 py-1 rounded ${
              projectionPeriod === 'year' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Year
          </button>
        </div>
      </div>
      <div className="h-64">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
} 