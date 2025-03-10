'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/AuthContext';

interface Tip {
  id?: string;
  user_id?: string;
  date: string;
  amount: number;
  created_at?: string;
  updated_at?: string;
}

export default function Projections() {
  const { user } = useAuth();
  const [projections, setProjections] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
  });
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
          calculateProjections(tips);
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

  const calculateProjections = (tips: Tip[]) => {
    if (!tips.length) {
      setError('Not enough data to calculate projections');
      return;
    }

    // Sort tips by date
    const sortedTips = [...tips].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Get date range
    const firstDate = new Date(sortedTips[0].date);
    const lastDate = new Date(sortedTips[sortedTips.length - 1].date);
    
    // Calculate total days in the dataset
    const daysDiff = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate total amount
    const totalAmount = sortedTips.reduce((sum, tip) => sum + Number(tip.amount), 0);
    
    // Calculate daily average
    const dailyAverage = totalAmount / daysDiff;
    
    // Calculate projections
    setProjections({
      daily: dailyAverage,
      weekly: dailyAverage * 7,
      monthly: dailyAverage * 30,
      yearly: dailyAverage * 365,
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

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg animate-pulse">
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-400">Calculating projections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="h-full flex items-center justify-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-white">Income Projections</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="text-gray-300 text-sm font-medium mb-1">Daily</h4>
          <p className="text-xl font-bold text-white">{formatCurrency(projections.daily)}</p>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="text-gray-300 text-sm font-medium mb-1">Weekly</h4>
          <p className="text-xl font-bold text-white">{formatCurrency(projections.weekly)}</p>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="text-gray-300 text-sm font-medium mb-1">Monthly</h4>
          <p className="text-xl font-bold text-white">{formatCurrency(projections.monthly)}</p>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="text-gray-300 text-sm font-medium mb-1">Yearly</h4>
          <p className="text-xl font-bold text-white">{formatCurrency(projections.yearly)}</p>
        </div>
      </div>
      
      <p className="text-gray-400 text-xs mt-4">
        *Projections are based on your historical tip data and may not reflect future earnings.
      </p>
    </div>
  );
} 