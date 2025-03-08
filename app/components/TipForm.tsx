'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { getCurrentDate, formatDate } from '../lib/dateUtils';

interface TipFormProps {
  onTipAdded: () => void;
  selectedDate?: Date;
}

const TipForm: React.FC<TipFormProps> = ({ onTipAdded, selectedDate }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingTip, setExistingTip] = useState<number | null>(null);
  const [checkingTip, setCheckingTip] = useState(false);
  const { user } = useAuth();
  
  // Use selectedDate if provided, otherwise use current date
  const dateToUse = selectedDate 
    ? selectedDate.toISOString().split('T')[0]
    : getCurrentDate();
  
  const formattedDate = formatDate(dateToUse);

  // Check for existing tip when date changes
  useEffect(() => {
    if (user && dateToUse) {
      checkExistingTip(dateToUse);
    }
  }, [user, dateToUse]);

  // Check if there's an existing tip for the selected date
  const checkExistingTip = async (date: string) => {
    if (!user) return;
    
    setCheckingTip(true);
    
    try {
      const { data, error } = await supabase
        .from('tips')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking for existing tip:', error);
        return;
      }
      
      if (data) {
        // Convert cents to dollars for display
        const amountInDollars = (data.amount / 100).toString();
        setAmount(amountInDollars);
        setExistingTip(data.amount);
      } else {
        setAmount('');
        setExistingTip(null);
      }
    } catch (err) {
      console.error('Error checking existing tip:', err);
    } finally {
      setCheckingTip(false);
    }
  };

  // Direct Supabase implementation to save tips
  const saveTip = async (userId: string, date: string, amountInCents: number) => {
    try {
      // First check if a tip already exists for this date
      const { data: existingTip, error: fetchError } = await supabase
        .from('tips')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error checking for existing tip:', fetchError);
        throw new Error('Failed to check for existing tip');
      }
      
      let result;
      
      if (existingTip) {
        // Update existing tip
        result = await supabase
          .from('tips')
          .update({ amount: amountInCents })
          .eq('id', existingTip.id)
          .select();
      } else {
        // Insert new tip
        result = await supabase
          .from('tips')
          .insert([{ 
            user_id: userId, 
            date: date, 
            amount: amountInCents 
          }])
          .select();
      }
      
      if (result.error) {
        console.error('Error saving tip:', result.error);
        throw new Error(result.error.message || 'Failed to save tip');
      }
      
      return result.data;
    } catch (err) {
      console.error('Error in saveTip function:', err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please sign in to add tips');
      return;
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Convert dollars to cents for storage
      const amountInCents = Math.round(Number(amount) * 100);
      
      // Save tip directly using Supabase
      await saveTip(user.id, dateToUse, amountInCents);
      
      const action = existingTip ? 'updated' : 'added';
      setSuccess(`$${amount} ${action} for ${formattedDate}`);
      setExistingTip(amountInCents);
      setAmount('');
      onTipAdded(); // Notify parent component
    } catch (err) {
      console.error('Error adding tip:', err);
      setError('Failed to add tip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black border border-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-2 text-white">
        {existingTip ? 'UPDATE TIP' : 'ADD TIP'}
      </h2>
      <p className="mb-6 text-gray-400 text-sm">{formattedDate}</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-900/50 border-l-4 border-red-500 text-white p-4 rounded-md animate-fadeIn">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/50 border-l-4 border-green-500 text-white p-4 rounded-md animate-fadeIn">
            <p className="font-bold">Success!</p>
            <p>{success}</p>
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
              disabled={checkingTip}
            />
            {checkingTip && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
              </div>
            )}
          </div>
        </div>
        
        <button
          type="submit"
          className={`w-full font-bold text-lg py-4 px-4 rounded-md transition-colors ${
            loading || checkingTip
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
              : 'bg-white text-black hover:bg-gray-200'
          }`}
          disabled={loading || checkingTip}
        >
          {loading 
            ? (existingTip ? 'UPDATING...' : 'ADDING...') 
            : checkingTip 
              ? 'CHECKING...' 
              : (existingTip ? 'UPDATE TIP' : 'ADD TIP')
          }
        </button>
      </form>
    </div>
  );
};

export default TipForm; 