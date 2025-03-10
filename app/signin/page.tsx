'use client';

import React from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import AuthForm from '@/app/components/AuthForm';

export default function SignIn() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-black border border-gray-800 rounded-sm p-8 shadow-lg">
            <AuthForm initialMode="signin" />
            
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                Don't have an account?{' '}
                <Link href="/signup" className="text-white hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 