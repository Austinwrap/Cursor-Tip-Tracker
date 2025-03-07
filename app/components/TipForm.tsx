'use client';

import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { addTip } from '../lib/supabase';
import { getCurrentDate, formatDate } from '../lib/dateUtils';

const TipForm: React.FC<{ onTipAdded: () => void }> = ({ onTipAdded }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();
  
  const currentDate = getCurrentDate();
  const formattedDate = formatDate(currentDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please sign in');
      return;
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Enter valid amount');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Convert dollars to cents for storage
      const amountInCents = Math.round(Number(amount) * 100);
      
      const result = await addTip(user.id, currentDate, amountInCents);
      
      if (result) {
        setSuccess(`$${amount} added`);
        setAmount('');
        onTipAdded();
      } else {
        setError('Failed to add tip');
      }
    } catch (err) {
      console.error('Error adding tip:', err);
      setError('Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black border border-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-2 text-white">TODAY'S TIPS</h2>
      <p className="mb-6 text-gray-400 text-sm">{formattedDate}</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-900/50 border-l-4 border-red-500 text-white p-3 rounded-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/50 border-l-4 border-green-500 text-white p-3 rounded-sm">
            {success}
          </div>
        )}
        
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <span className="text-gray-400 text-2xl">$</span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black border-2 border-gray-700 focus:border-white text-white text-3xl rounded-md py-6 pl-12 transition-colors"
              placeholder="0"
              min="0"
              step="1"
              aria-label="Tip amount in dollars"
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-white text-black font-bold text-lg py-4 px-4 rounded-md hover:bg-gray-200 transition-colors"
          disabled={loading}
        >
          {loading ? 'ADDING...' : 'ADD TIP'}
        </button>
      </form>
    </div>
  );
};

export default TipForm; 