'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';

const Header: React.FC = () => {
  const { user, isPaid, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-black border-b border-gray-800 py-5 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500">
            TipTracker.ai
          </span>
        </Link>
        
        {user ? (
          <div className="flex items-center space-x-6">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider">
                Dashboard
              </Link>
              <Link href="/history" className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider">
                History
              </Link>
              <Link href="/past-tips" className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider">
                Past Tips
              </Link>
              <Link href="/analytics" className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider flex items-center">
                Analytics
                {!isPaid && <span className="ml-1 text-yellow-500 text-xs">★</span>}
              </Link>
              {isPaid && (
                <Link href="/premium-dashboard" className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm uppercase tracking-wider flex items-center">
                  Premium
                  <span className="ml-1 text-yellow-500 text-xs">★</span>
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
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {isPaid && (
              <div className="hidden md:flex items-center mr-4">
                <Link href="/premium-dashboard" className="flex items-center">
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs px-3 py-1.5 rounded-full font-bold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    PREMIUM DASHBOARD
                  </span>
                </Link>
              </div>
            )}
            
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
      
      {/* Mobile Menu */}
      {mobileMenuOpen && user && (
        <div className="md:hidden mt-4 border-t border-gray-800 pt-4">
          <nav className="flex flex-col space-y-4">
            <Link 
              href="/dashboard" 
              className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/history" 
              className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider"
              onClick={() => setMobileMenuOpen(false)}
            >
              History
            </Link>
            <Link 
              href="/past-tips" 
              className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider"
              onClick={() => setMobileMenuOpen(false)}
            >
              Past Tips
            </Link>
            <Link 
              href="/analytics" 
              className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Analytics
              {!isPaid && <span className="ml-1 text-yellow-500 text-xs">★</span>}
            </Link>
            {isPaid && (
              <Link 
                href="/premium-dashboard" 
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-1.5 px-4 rounded-full flex items-center justify-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Premium Dashboard
              </Link>
            )}
            {!isPaid && (
              <Link 
                href="/upgrade" 
                className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm uppercase tracking-wider"
                onClick={() => setMobileMenuOpen(false)}
              >
                Upgrade
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header; 