'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import Header from '../components/Header';
import TipForm from '../components/TipForm';
import TipCalendar from '../components/TipCalendar';
import Link from 'next/link';
import AuthCheck from '../components/AuthCheck';
import DebugPanel from '../components/DebugPanel';

export default function Dashboard() {
  const { user, loading, isPaid, devMode, toggleDevMode } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-black text-white">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TipCalendar />
            </div>
            
            <div>
              <TipForm onTipAdded={() => {}} />
            </div>
          </div>
        </main>
        
        {/* Debug panel - only visible in development */}
        {process.env.NODE_ENV === 'development' && <DebugPanel />}
      </div>
    </AuthCheck>
  );
} 