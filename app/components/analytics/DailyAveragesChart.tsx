import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useAuth } from '../../lib/AuthContext';
import { getDailyAverages } from '../../lib/supabase';
import { formatCurrency } from '../../lib/dateUtils';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const DailyAveragesChart: React.FC = () => {
  const [dailyData, setDailyData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDailyData = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getDailyAverages(user.id);
        setDailyData(data);
      } catch (err) {
        console.error('Error fetching daily averages:', err);
        setError('Failed to load daily averages');
      } finally {
        setLoading(false);
      }
    };

    fetchDailyData();
  }, [user]);

  if (loading) {
    return <div className="text-center py-4">Loading daily averages chart...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-500 text-white p-3 rounded">
        {error}
      </div>
    );
  }

  // Prepare data for chart
  const dayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
    'Thursday', 'Friday', 'Saturday'
  ];
  
  const chartData = {
    labels: dayNames,
    datasets: [
      {
        label: 'Average Tips by Day',
        data: dayNames.map((_, index) => {
          return dailyData[index.toString()] ? dailyData[index.toString()] / 100 : 0; // Convert cents to dollars
        }),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(199, 199, 199, 0.7)',
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
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'rgba(211, 211, 211, 0.8)',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Average: ${formatCurrency(context.raw * 100)}`,
        },
      },
    },
  };

  // Find best and worst days
  let bestDay = { day: '', amount: 0 };
  let worstDay = { day: '', amount: Number.MAX_SAFE_INTEGER };

  Object.entries(dailyData).forEach(([dayIndex, amount]) => {
    if (amount > bestDay.amount) {
      bestDay = { day: dayNames[parseInt(dayIndex)], amount };
    }
    if (amount < worstDay.amount && amount > 0) {
      worstDay = { day: dayNames[parseInt(dayIndex)], amount };
    }
  });

  // If no data was found for worst day, reset it
  if (worstDay.amount === Number.MAX_SAFE_INTEGER) {
    worstDay = { day: 'N/A', amount: 0 };
  }

  return (
    <div className="card">
      <h2 className="section-title">Average Tips by Day of Week</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="card bg-hover">
          <h3 className="font-bold mb-2">Best Day</h3>
          <p>{bestDay.day}: {formatCurrency(bestDay.amount)}</p>
        </div>
        <div className="card bg-hover">
          <h3 className="font-bold mb-2">Slowest Day</h3>
          <p>{worstDay.day}: {formatCurrency(worstDay.amount)}</p>
        </div>
      </div>
      
      <div className="h-80">
        <Pie data={chartData} options={chartOptions as any} />
      </div>
    </div>
  );
};

export default DailyAveragesChart; 