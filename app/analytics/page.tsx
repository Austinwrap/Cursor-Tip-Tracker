'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import MonthlyChart from '../components/analytics/MonthlyChart';
import DailyAveragesChart from '../components/analytics/DailyAveragesChart';
import BestWorstDays from '../components/analytics/BestWorstDays';
import Projections from '../components/analytics/Projections';
import { useAuth } from '../lib/AuthContext';

export default function Analytics() {
  const { user, isPaid, loading } = useAuth();
  const router = useRouter();

  // Redirect to sign in if not authenticated or to upgrade if not paid
  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/signin');
      } else if (!isPaid) {
        router.push('/upgrade');
      }
    }
  }, [user, isPaid, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          Loading...
        </div>
      </main>
    );
  }

  if (!user || !isPaid) {
    return null; // Will redirect
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Analytics Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <BestWorstDays />
          <Projections />
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          <MonthlyChart />
          <DailyAveragesChart />
        </div>
      </div>
    </main>
  );
} 