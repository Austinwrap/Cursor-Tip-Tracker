'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import TipCalendar from '../components/TipCalendar';
import { useAuth } from '../lib/AuthContext';

export default function History() {
  const { user, loading } = useAuth();
  const router = useRouter();

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

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <TipCalendar />
        </div>
      </div>
    </main>
  );
} 