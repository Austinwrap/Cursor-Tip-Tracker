'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import Header from '../components/Header';

interface Tip {
  id?: string;
  user_id?: string;
  date: string;
  amount: number;
  created_at?: string;
  updated_at?: string;
}

export default function TipsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tips, setTips] = useState<Tip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/signin');
    }
  }, [user, isLoading, router]);

  // Load tips from localStorage
  useEffect(() => {
    if (!user) return;

    const loadTips = () => {
      setIsLoading(true);
      try {
        const storageKey = `tips_${user.id}`;
        const storedTips = localStorage.getItem(storageKey);
        
        if (storedTips) {
          const parsedTips = JSON.parse(storedTips);
          setTips(parsedTips);
        } else {
          setTips([]);
        }
      } catch (error) {
        console.error('Error loading tips:', error);
        setError('Failed to load tips. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTips();
  }, [user]);

  // Delete a tip
  const deleteTip = async (tipToDelete: Tip) => {
    if (!user) return;
    
    // Update local state immediately
    const updatedTips = tips.filter(tip => 
      !(tip.date === tipToDelete.date && tip.amount === tipToDelete.amount)
    );
    setTips(updatedTips);
    
    // Save to localStorage
    localStorage.setItem(`tips_${user.id}`, JSON.stringify(updatedTips));
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Sort and filter tips
  const sortedAndFilteredTips = [...tips]
    .filter(tip => {
      if (!searchTerm) return true;
      
      const date = new Date(tip.date);
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      
      return formattedDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
             tip.amount.toString().includes(searchTerm);
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
    });

  // Toggle sort order
  const toggleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-xl">Loading tips...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tip History</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border-l-4 border-red-500 p-4 mb-8">
            <p className="text-red-200">{error}</p>
          </div>
        )}
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-xl font-semibold mb-4 md:mb-0">All Tips</h2>
            
            <div className="w-full md:w-auto">
              <input
                type="text"
                placeholder="Search tips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {sortedAndFilteredTips.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {searchTerm ? (
                <p>No tips found matching your search.</p>
              ) : (
                <p>No tips recorded yet. Add your first tip on the dashboard!</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th 
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700"
                      onClick={() => toggleSort('date')}
                    >
                      <div className="flex items-center">
                        Date
                        {sortBy === 'date' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-right cursor-pointer hover:bg-gray-700"
                      onClick={() => toggleSort('amount')}
                    >
                      <div className="flex items-center justify-end">
                        Amount
                        {sortBy === 'amount' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredTips.map((tip, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/30">
                      <td className="px-4 py-3">{formatDate(tip.date)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(tip.amount)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteTip(tip)}
                          className="text-red-500 hover:text-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-400">
            Total: {sortedAndFilteredTips.length} tips
          </div>
        </div>
      </div>
    </div>
  );
} 