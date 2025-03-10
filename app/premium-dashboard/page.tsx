'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import Header from '../components/Header';
import Link from 'next/link';
import AIChatAssistant from '../components/analytics/AIChatAssistant';
import MonthlyChart from '../components/analytics/MonthlyChart';
import DailyAveragesChart from '../components/analytics/DailyAveragesChart';
import BestWorstDays from '../components/analytics/BestWorstDays';
import Projections from '../components/analytics/Projections';
import { format } from 'date-fns';
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
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Define the Tip type
interface Tip {
  id?: string;
  user_id?: string;
  date: string;
  amount: number;
  created_at?: string;
  updated_at?: string;
}

export default function PremiumDashboard() {
  const { user, isPaid, loading } = useAuth();
  const router = useRouter();
  const [tips, setTips] = useState<Tip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalTips: 0,
    averageTip: 0,
    bestDay: { day: '', amount: 0 },
    worstDay: { day: '', amount: 0 },
    monthlyAverage: 0,
    yearlyProjection: 0,
  });

  // Redirect if not authenticated or not premium
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    } else if (!loading && user && !isPaid) {
      router.push('/upgrade');
    }
  }, [user, isPaid, loading, router]);

  // Load tips from localStorage
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
          const parsedTips = JSON.parse(storedTips);
          setTips(parsedTips);
          calculateStats(parsedTips);
        } else {
          setTips([]);
          setError('No tips found. Add some tips to see your analytics.');
        }
      } catch (err) {
        console.error('Error loading tips:', err);
        setError('Failed to load tips. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTips();
  }, [user]);

  // Calculate statistics from tips
  const calculateStats = (tipsData: Tip[]) => {
    if (!tipsData.length) return;

    // Total tips
    const totalAmount = tipsData.reduce((sum, tip) => sum + Number(tip.amount), 0);
    
    // Average tip
    const averageTip = totalAmount / tipsData.length;
    
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
    
    tipsData.forEach(tip => {
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
    
    // Find best and worst days
    const bestDay = dayAverages.reduce((best, current) => 
      current.average > best.average ? current : best, 
      { day: '', average: 0 }
    );
    
    const worstDay = dayAverages.reduce((worst, current) => 
      (current.average < worst.average && current.average > 0) || worst.average === 0 
        ? current 
        : worst, 
      { day: '', average: 0 }
    );
    
    // Calculate monthly average
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    
    const recentTips = tipsData.filter(tip => {
      const tipDate = new Date(tip.date);
      return tipDate >= oneMonthAgo && tipDate <= now;
    });
    
    const recentTotal = recentTips.reduce((sum, tip) => sum + Number(tip.amount), 0);
    const daysInPeriod = Math.max(1, Math.round((now.getTime() - oneMonthAgo.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyAverage = recentTotal / daysInPeriod;
    const monthlyAverage = dailyAverage * 30;
    
    // Calculate yearly projection
    const yearlyProjection = dailyAverage * 365;
    
    setStats({
      totalTips: totalAmount,
      averageTip,
      bestDay: { day: bestDay.day, amount: bestDay.average },
      worstDay: { day: worstDay.day, amount: worstDay.average },
      monthlyAverage,
      yearlyProjection,
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading || (!user && !error)) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-xl">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isPaid) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Premium Dashboard</h1>
          <Link 
            href="/dashboard" 
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
        
        {error ? (
          <div className="bg-red-900/50 border-l-4 border-red-500 p-4 mb-8">
            <p className="text-red-200">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800 p-6 rounded-lg h-32"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-gray-300 text-sm font-medium mb-1">Total Tips</h3>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalTips)}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-gray-300 text-sm font-medium mb-1">Average Tip</h3>
                <p className="text-2xl font-bold">{formatCurrency(stats.averageTip)}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-900 to-green-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-gray-300 text-sm font-medium mb-1">Monthly Average</h3>
                <p className="text-2xl font-bold">{formatCurrency(stats.monthlyAverage)}</p>
              </div>
              
              <div className="bg-gradient-to-br from-amber-900 to-amber-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-gray-300 text-sm font-medium mb-1">Yearly Projection</h3>
                <p className="text-2xl font-bold">{formatCurrency(stats.yearlyProjection)}</p>
              </div>
            </div>
            
            {/* Best/Worst Days */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-2">Best Day</h3>
                <div className="flex items-end">
                  <p className="text-3xl font-bold text-green-400">{stats.bestDay.day}</p>
                  <p className="ml-2 text-gray-400">{formatCurrency(stats.bestDay.amount)}</p>
                </div>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-2">Worst Day</h3>
                <div className="flex items-end">
                  <p className="text-3xl font-bold text-red-400">{stats.worstDay.day}</p>
                  <p className="ml-2 text-gray-400">{formatCurrency(stats.worstDay.amount)}</p>
                </div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <MonthlyChart />
              <DailyAveragesChart />
            </div>
            
            <Projections />
            
            <BestWorstDays />
            
            {/* AI Assistant */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
              <h2 className="text-xl font-semibold mb-4">AI Tip Assistant</h2>
              <AIChatAssistant tips={tips} />
            </div>
          </>
        )}
      </div>
    </div>
  );
} 