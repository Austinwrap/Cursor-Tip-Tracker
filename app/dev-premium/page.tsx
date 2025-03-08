'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

export default function DevPremium() {
  const { user } = useAuth();
  const [message, setMessage] = useState('Preparing premium access...');
  const router = useRouter();

  useEffect(() => {
    const enablePremium = async () => {
      // Wait for user to be loaded
      if (!user) {
        setMessage('Waiting for authentication...');
        return;
      }

      try {
        setMessage('Enabling premium features...');
        
        // Update the user's is_paid status in the database
        const { error } = await supabase
          .from('users')
          .update({ is_paid: true })
          .eq('id', user.id);
          
        if (error) {
          throw error;
        }
        
        setMessage('Premium features enabled! Redirecting to dashboard...');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (error) {
        console.error('Error enabling premium features:', error);
        setMessage('Error enabling premium features. Please try again.');
      }
    };

    enablePremium();
  }, [user, router]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-6"></div>
      <h1 className="text-2xl font-bold mb-4">Developer Mode</h1>
      <p className="text-center max-w-md">{message}</p>
    </div>
  );
} 