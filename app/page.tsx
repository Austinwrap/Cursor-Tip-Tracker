import React from 'react';
import Link from 'next/link';
import Header from './components/Header';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-8 tracking-tight">
            TRACK YOUR TIPS
          </h1>
          
          <p className="text-xl mb-16 text-gray-400">
            Simple. Minimal. Effective.
          </p>
          
          <div className="bg-black border border-gray-800 rounded-sm p-10 shadow-lg mb-16">
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="text-center">
                <p className="text-xl mb-8 text-gray-300">
                  The simplest way for bartenders to track daily tips.
                </p>
                <Link href="/signup" className="bg-white text-black font-bold py-4 px-8 rounded-sm hover:bg-gray-200 transition-colors uppercase tracking-wider inline-block">
                  GET STARTED
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 