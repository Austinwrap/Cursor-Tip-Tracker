'use client';

import { ReactNode } from 'react';
import Header from '../components/Header';

export default function TipsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
} 