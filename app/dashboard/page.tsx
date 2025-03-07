'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import TipForm from '../components/TipForm';
import TipCalendar from '../components/TipCalendar';
import { useAuth } from '../lib/AuthContext';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  // Redirect to sign in if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-pulse text-xl">Loading...</div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null; // Will redirect to sign in
  }

  const handleTipAdded = () => {
    // Refresh the tip calendar when a new tip is added
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <TipForm onTipAdded={handleTipAdded} />
          </div>
          
          <div>
            <TipCalendar key={refreshKey} />
          </div>
        </div>
      </div>
    </main>
  );
} 