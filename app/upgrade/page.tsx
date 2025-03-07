'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

export default function Upgrade() {
  const { user, isPaid, loading } = useAuth();
  const router = useRouter();
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect to sign in if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

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

  if (!user) {
    return null; // Will redirect to sign in
  }

  // If already paid, show a message
  if (isPaid) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto card text-center">
            <h1 className="text-3xl font-bold mb-4">You're Already Upgraded!</h1>
            <p className="mb-6">
              You already have access to all premium features. Enjoy the analytics!
            </p>
            <button
              onClick={() => router.push('/analytics')}
              className="btn"
            >
              Go to Analytics
            </button>
          </div>
        </div>
      </main>
    );
  }

  const handleUpgrade = async () => {
    setUpgrading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // In a real app, this would integrate with a payment processor
      // For now, we'll just update the user's status in the database
      const { error } = await supabase
        .from('users')
        .update({ is_paid: true })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      setSuccess('Upgrade successful! You now have access to all premium features.');
      
      // Refresh the page after a short delay to update the UI
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Error upgrading account:', err);
      setError('Failed to upgrade your account. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h1 className="text-3xl font-bold mb-6 text-center">Upgrade to Premium</h1>
            
            {error && (
              <div className="bg-red-900 border border-red-500 text-white p-3 rounded mb-6">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-900 border border-green-500 text-white p-3 rounded mb-6">
                {success}
              </div>
            )}
            
            <div className="mb-8">
              <h2 className="text-heading font-bold mb-4">Premium Features</h2>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Monthly & yearly tip summaries</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Day of week analysis to identify your most profitable shifts</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Best & worst days tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Visual charts & graphs for easy data interpretation</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Future earnings projections based on your historical data</span>
                </li>
              </ul>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold mb-4">$4.99/month</p>
              <button
                onClick={handleUpgrade}
                className="btn w-full max-w-md"
                disabled={upgrading}
              >
                {upgrading ? 'Processing...' : 'Upgrade Now'}
              </button>
              <p className="mt-4 text-sm opacity-70">
                Note: This is a demo app. No actual payment will be processed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 