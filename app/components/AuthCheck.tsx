'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';

interface AuthCheckProps {
  children: React.ReactNode;
}

const AuthCheck: React.FC<AuthCheckProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  return <>{children}</>;
};

export default AuthCheck; 