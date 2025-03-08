'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';

const Header: React.FC = () => {
  const { user, isPaid, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-black border-b border-gray-800 py-4 px-4 safe-area-inset-top">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500">
            TipTracker.ai
          </span>
        </Link>
        
        {user ? (
          <div className="flex items-center">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider">
                Dashboard
              </Link>
              <Link href="/history" className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider">
                History
              </Link>
              <Link href="/analytics" className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider flex items-center">
                Analytics
                {!isPaid && <span className="ml-1 text-yellow-500 text-xs">★</span>}
              </Link>
              {isPaid && (
                <Link href="/premium-dashboard" className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm uppercase tracking-wider">
                  Premium
                </Link>
              )}
              {!isPaid && (
                <Link href="/upgrade" className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm uppercase tracking-wider">
                  Upgrade
                </Link>
              )}
            </nav>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-400 hover:text-white p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <button
              onClick={signOut}
              className="hidden md:block bg-transparent border border-gray-700 text-gray-300 px-4 py-2 rounded-sm hover:border-white hover:text-white transition-all text-sm uppercase tracking-wider ml-6"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-x-3">
            <Link href="/signin" className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider">
              Sign In
            </Link>
            <Link href="/signup" className="bg-white text-black px-3 py-1.5 rounded-sm hover:bg-gray-200 transition-colors text-sm uppercase tracking-wider">
              Sign Up
            </Link>
          </div>
        )}
      </div>
      
      {/* Mobile Menu - Optimized for iPhone */}
      {mobileMenuOpen && user && (
        <div className="md:hidden mt-4 border-t border-gray-800 pt-4 pb-2 px-2 bg-black">
          <nav className="grid grid-cols-2 gap-y-3 gap-x-2 mb-4">
            <Link 
              href="/dashboard" 
              className="text-gray-300 hover:text-white transition-colors text-sm py-2 px-3 rounded-md bg-gray-900/50 flex items-center justify-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Dashboard
            </Link>
            <Link 
              href="/history" 
              className="text-gray-300 hover:text-white transition-colors text-sm py-2 px-3 rounded-md bg-gray-900/50 flex items-center justify-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              History
            </Link>
            <Link 
              href="/analytics" 
              className="text-gray-300 hover:text-white transition-colors text-sm py-2 px-3 rounded-md bg-gray-900/50 flex items-center justify-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Analytics
              {!isPaid && <span className="ml-1 text-yellow-500 text-xs">★</span>}
            </Link>
            {isPaid ? (
              <Link 
                href="/premium-dashboard" 
                className="text-black font-bold py-2 px-3 rounded-md bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Premium
              </Link>
            ) : (
              <Link 
                href="/upgrade" 
                className="text-black font-bold py-2 px-3 rounded-md bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                Upgrade
              </Link>
            )}
          </nav>
          <button
            onClick={() => {
              signOut();
              setMobileMenuOpen(false);
            }}
            className="w-full bg-transparent border border-gray-700 text-gray-300 py-2 rounded-md hover:border-white hover:text-white transition-all text-sm uppercase tracking-wider"
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
};

export default Header; 