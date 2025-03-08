'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/dateUtils';
import * as tipService from '../lib/tipService';

interface PastTipFormProps {
  onTipAdded: () => void;
  selectedDate?: string;
}

const PastTipForm: React.FC<PastTipFormProps> = ({ onTipAdded, selectedDate = '' }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingTip, setExistingTip] = useState<number | null>(null);
  const [checkingTip, setCheckingTip] = useState(false);
  const { user } = useAuth();

  // Calculate max date (today)
  const today = new Date().toISOString().split('T')[0];

  // Update date when selectedDate prop changes
  useEffect(() => {
    if (selectedDate) {
      setDate(selectedDate);
      checkExistingTip(selectedDate);
    }
  }, [selectedDate]);

  // Check if there's an existing tip for the selected date
  const checkExistingTip = async (dateToCheck: string) => {
    if (!user) return;
    
    setCheckingTip(true);
    
    try {
      console.log('Checking for existing tip on date:', dateToCheck);
      
      // Get tips for the date range (just this one date)
      const tips = await tipService.getTipsByDateRange(user.id, dateToCheck, dateToCheck);
      
      if (tips.length > 0) {
        console.log('Found existing tip:', tips[0]);
        // Convert cents to dollars for display
        const amountInDollars = (tips[0].amount / 100).toString();
        setAmount(amountInDollars);
        setExistingTip(tips[0].amount);
      } else {
        console.log('No existing tip found for date:', dateToCheck);
        setAmount('');
        setExistingTip(null);
      }
    } catch (err) {
      console.error('Error checking existing tip:', err);
    } finally {
      setCheckingTip(false);
    }
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setError(null);
    setSuccess(null);
    checkExistingTip(newDate);
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

    if (!date) {
      setError('Please select a date');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('Submitting tip form with amount:', amount, 'for date:', date);
      
      // Convert dollars to cents for storage
      const amountInCents = Math.round(Number(amount) * 100);
      
      // Save tip using our service
      const result = await tipService.saveTip(user.id, date, amountInCents);
      
      if (result) {
        const action = existingTip ? 'updated' : 'added';
        setSuccess(`$${amount} ${action} for ${formatDate(date)}`);
        setExistingTip(amountInCents);
        
        console.log('Tip saved successfully, calling onTipAdded callback');
        
        // Call the callback to refresh the calendar
        onTipAdded();
      } else {
        setError('Failed to save tip. Please try again.');
      }
    } catch (err) {
      console.error('Error adding tip:', err);
      setError('An error occurred while saving your tip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black border border-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-2 text-white">
        {existingTip ? 'EDIT TIP' : 'ADD PAST TIP'}
      </h2>
      <p className="mb-6 text-gray-400 text-sm">
        {selectedDate ? formatDate(selectedDate) : 'Select a date and enter your tip amount'}
      </p>
      
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
        
        {!selectedDate && (
          <div>
            <label htmlFor="date-select" className="block text-gray-400 mb-2">
              Select Date
            </label>
            <input
              id="date-select"
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              max={today}
              className="w-full bg-black border-2 border-gray-700 focus:border-white text-white rounded-md py-3 px-4 transition-colors"
              required
            />
          </div>
        )}
        
        <div>
          <label htmlFor="amount-input" className="block text-gray-400 mb-2">
            Tip Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <span className="text-gray-400 text-2xl">$</span>
            </div>
            <input
              id="amount-input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black border-2 border-gray-700 focus:border-white text-white text-3xl rounded-md py-4 pl-12 transition-colors"
              placeholder="0"
              min="0"
              step="1"
              aria-label="Tip amount in dollars"
              required
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

export default PastTipForm; 