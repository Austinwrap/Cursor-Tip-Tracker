'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-black border-b border-gray-800 py-5 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white tracking-tight">
          TIP TRACKER
        </Link>
        
        {user ? (
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider">
                Dashboard
              </Link>
              <Link href="/history" className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider">
                History
              </Link>
            </nav>
            
            <button
              onClick={signOut}
              className="bg-transparent border border-gray-700 text-gray-300 px-4 py-2 rounded-sm hover:border-white hover:text-white transition-all text-sm uppercase tracking-wider"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-x-4">
            <Link href="/signin" className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider">
              Sign In
            </Link>
            <Link href="/signup" className="bg-white text-black px-4 py-2 rounded-sm hover:bg-gray-200 transition-colors text-sm uppercase tracking-wider">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 