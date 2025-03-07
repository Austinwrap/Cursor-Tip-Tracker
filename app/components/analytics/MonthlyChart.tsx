import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useAuth } from '../../lib/AuthContext';
import { getMonthlyTotals } from '../../lib/supabase';
import { formatCurrency } from '../../lib/dateUtils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MonthlyChart: React.FC = () => {
  const [monthlyData, setMonthlyData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Get current year
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchMonthlyData = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getMonthlyTotals(user.id, currentYear);
        setMonthlyData(data);
      } catch (err) {
        console.error('Error fetching monthly data:', err);
        setError('Failed to load monthly data');
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [user, currentYear]);

  if (loading) {
    return <div className="text-center py-4">Loading monthly chart...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-500 text-white p-3 rounded">
        {error}
      </div>
    );
  }

  // Prepare data for chart
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const chartData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Monthly Tips',
        data: monthNames.map((_, index) => {
          const monthKey = (index + 1).toString().padStart(2, '0');
          return monthlyData[monthKey] ? monthlyData[monthKey] / 100 : 0; // Convert cents to dollars
        }),
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `$${value}`,
          color: 'rgba(211, 211, 211, 0.8)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: 'rgba(211, 211, 211, 0.8)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: 'rgba(211, 211, 211, 0.8)',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Total: ${formatCurrency(context.raw * 100)}`,
        },
      },
    },
  };

  // Calculate total for the year
  const yearlyTotal = Object.values(monthlyData).reduce((sum, amount) => sum + amount, 0);

  return (
    <div className="card">
      <h2 className="section-title">Monthly Tips for {currentYear}</h2>
      <p className="mb-4">Yearly Total: {formatCurrency(yearlyTotal)}</p>
      
      <div className="h-80">
        <Bar data={chartData} options={chartOptions as any} />
      </div>
    </div>
  );
};

export default MonthlyChart; 