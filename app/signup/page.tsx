'use client';

import React from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import AuthForm from '@/app/components/AuthForm';

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Create a Tip Tracker Account</h1>
          <AuthForm initialMode="signup" />
          
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link href="/signin" className="text-white hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 