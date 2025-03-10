'use client';

import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { formatDate } from '../lib/dateUtils';

interface ParsedTip {
  date: string;
  amount: number;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

interface Tip {
  date: string;
  amount: number;
}

const BulkTipImport: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [parsedTips, setParsedTips] = useState<ParsedTip[]>([]);
  const [importing, setImporting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const { user } = useAuth();

  // Parse the input text to extract dates and amounts
  const parseInput = () => {
    if (!inputText.trim()) {
      setParseError('Please enter some text to parse');
      return;
    }

    setParseError(null);
    
    // Reset any previous parsed tips
    setParsedTips([]);
    
    // Split the input by lines
    const lines = inputText.split('\n').filter(line => line.trim());
    console.log('Lines to parse:', lines);
    
    // Regular expressions for different date formats
    const datePatterns = [
      // MM/DD/YYYY or MM-DD-YYYY
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
      // MM/DD or MM-DD (assume current year)
      /(\d{1,2})[\/\-](\d{1,2})/,
      // YYYY-MM-DD (ISO format)
      /(\d{4})-(\d{2})-(\d{2})/,
      // Month names: Jan 5, January 5, etc.
      /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:[,\s]+(\d{4}))?/i,
      // Day of week with date: Monday, January 5 or Mon, Jan 5
      /(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?)[,\s]+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:[,\s]+(\d{4}))?/i,
      // "Today", "Yesterday", "Last Monday", etc.
      /(today|yesterday|last\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))/i
    ];
    
    // Regular expression for money amounts
    const moneyPattern = /\$?(\d+(?:\.\d{1,2})?)/;
    
    const parsedResults: ParsedTip[] = [];
    const currentYear = new Date().getFullYear();
    const currentDate = new Date();
    
    // Month name to number mapping
    const monthNameToNumber: Record<string, number> = {
      'jan': 0, 'january': 0,
      'feb': 1, 'february': 1,
      'mar': 2, 'march': 2,
      'apr': 3, 'april': 3,
      'may': 4,
      'jun': 5, 'june': 5,
      'jul': 6, 'july': 6,
      'aug': 7, 'august': 7,
      'sep': 8, 'september': 8,
      'oct': 9, 'october': 9,
      'nov': 10, 'november': 10,
      'dec': 11, 'december': 11
    };
    
    // Day of week to number mapping (0 = Sunday)
    const dayOfWeekToNumber: Record<string, number> = {
      'sunday': 0, 'sun': 0,
      'monday': 1, 'mon': 1,
      'tuesday': 2, 'tue': 2,
      'wednesday': 3, 'wed': 3,
      'thursday': 4, 'thu': 4,
      'friday': 5, 'fri': 5,
      'saturday': 6, 'sat': 6
    };
    
    // Process each line
    lines.forEach(line => {
      console.log('Processing line:', line);
      let date: Date | null = null;
      let dateString = '';
      let amount = 0;
      
      // Try to extract a date
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          console.log('Date match found:', match);
          if (pattern === datePatterns[0]) {
            // MM/DD/YYYY
            const month = parseInt(match[1]) - 1;
            const day = parseInt(match[2]);
            const year = parseInt(match[3]);
            date = new Date(year, month, day);
          } else if (pattern === datePatterns[1]) {
            // MM/DD (current year)
            const month = parseInt(match[1]) - 1;
            const day = parseInt(match[2]);
            date = new Date(currentYear, month, day);
          } else if (pattern === datePatterns[2]) {
            // YYYY-MM-DD
            const year = parseInt(match[1]);
            const month = parseInt(match[2]) - 1;
            const day = parseInt(match[3]);
            date = new Date(year, month, day);
          } else if (pattern === datePatterns[3] || pattern === datePatterns[4]) {
            // Month name format
            let monthIdx, day, year;
            
            if (pattern === datePatterns[3]) {
              // Direct month name
              const monthName = match[1].toLowerCase();
              monthIdx = monthNameToNumber[monthName.substring(0, 3)];
              day = parseInt(match[2]);
              year = match[3] ? parseInt(match[3]) : currentYear;
            } else {
              // Day of week + month name
              const monthName = match[1].toLowerCase();
              monthIdx = monthNameToNumber[monthName.substring(0, 3)];
              day = parseInt(match[2]);
              year = match[3] ? parseInt(match[3]) : currentYear;
            }
            
            date = new Date(year, monthIdx, day);
          } else if (pattern === datePatterns[5]) {
            // Relative dates
            const relativeDate = match[1].toLowerCase();
            date = new Date();
            
            if (relativeDate === 'yesterday') {
              date.setDate(date.getDate() - 1);
            } else if (relativeDate.startsWith('last')) {
              // Extract day of week
              const dayOfWeek = relativeDate.split(' ')[1];
              const targetDayNum = dayOfWeekToNumber[dayOfWeek];
              const currentDayNum = date.getDay();
              
              // Calculate days to go back
              let daysToSubtract = currentDayNum - targetDayNum;
              if (daysToSubtract <= 0) daysToSubtract += 7;
              
              date.setDate(date.getDate() - daysToSubtract);
            }
          }
          
          break;
        }
      }
      
      // Try to extract an amount
      const moneyMatch = line.match(moneyPattern);
      if (moneyMatch) {
        console.log('Money match found:', moneyMatch);
        amount = parseFloat(moneyMatch[1]);
      }
      
      // If we found both a date and an amount, add to results
      if (date && !isNaN(date.getTime()) && amount > 0) {
        dateString = date.toISOString().split('T')[0];
        console.log('Valid tip found:', { date: dateString, amount });
        
        // Check if the date is in the future
        if (date > currentDate) {
          parsedResults.push({
            date: dateString,
            amount: Math.round(amount * 100), // Convert to cents
            status: 'error',
            message: 'Future date not allowed'
          });
        } else {
          parsedResults.push({
            date: dateString,
            amount: Math.round(amount * 100), // Convert to cents
            status: 'pending'
          });
        }
      }
    });
    
    if (parsedResults.length === 0) {
      setParseError('Could not find any valid date and amount combinations. Please check your input format.');
      return;
    }
    
    console.log('Parsed tips:', parsedResults);
    setParsedTips(parsedResults);
  };

  // Save tip to localStorage
  const saveTip = async (userId: string, date: string, amountInCents: number) => {
    console.log('Attempting to save tip:', { userId, date, amountInCents });
    
    try {
      // Get the storage key for this user
      const storageKey = `tips_${userId}`;
      
      // Get existing tips from localStorage
      const storedTips = localStorage.getItem(storageKey);
      let tips: Tip[] = [];
      
      if (storedTips) {
        tips = JSON.parse(storedTips);
      }
      
      // Check if a tip already exists for this date
      const existingTipIndex = tips.findIndex(tip => tip.date === date);
      
      if (existingTipIndex !== -1) {
        // Update existing tip
        tips[existingTipIndex].amount = amountInCents;
      } else {
        // Add new tip
        tips.push({
          date,
          amount: amountInCents
        });
      }
      
      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(tips));
      
      console.log('Tip saved successfully to localStorage');
      return true;
    } catch (err) {
      console.error('Error saving tip to localStorage:', err);
      return false;
    }
  };

  // Import all parsed tips
  const importTips = async () => {
    if (!user) {
      setImportSuccess('Please sign in to import tips');
      return;
    }
    
    if (parsedTips.length === 0) {
      setImportSuccess('No tips to import');
      return;
    }
    
    setImporting(true);
    setImportSuccess(null);
    
    const results = [...parsedTips];
    let successCount = 0;
    
    for (let i = 0; i < results.length; i++) {
      const tip = results[i];
      
      // Skip tips that already have an error
      if (tip.status === 'error') continue;
      
      try {
        // Try to save the tip
        const success = await saveTip(user.id, tip.date, tip.amount);
        
        if (success) {
          results[i] = { ...tip, status: 'success' };
          successCount++;
        } else {
          results[i] = { ...tip, status: 'error', message: 'Failed to save tip' };
        }
      } catch (err) {
        console.error('Error importing tip:', err);
        results[i] = { ...tip, status: 'error', message: 'Unexpected error' };
      }
      
      // Update the UI after each tip
      setParsedTips([...results]);
    }
    
    setImporting(false);
    setImportSuccess(`Successfully imported ${successCount} of ${parsedTips.length} tips`);
  };

  return (
    <div className="bg-black border border-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Bulk Import Tips</h2>
      
      <div className="mb-6">
        <p className="text-gray-400 mb-4">
          Paste text containing dates and amounts to quickly import multiple tips.
          The parser will try to detect dates and amounts in various formats.
        </p>
        
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full h-40 bg-black border-2 border-gray-700 focus:border-white text-white rounded-md py-2 px-3 transition-colors"
          placeholder="Example:
Monday 5/15 - $120
Tuesday - $85.50
Last Friday $95"
        />
        
        {parseError && (
          <div className="mt-2 text-red-400 text-sm">
            {parseError}
          </div>
        )}
        
        <button
          onClick={parseInput}
          className="mt-4 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          Parse Text
        </button>
      </div>
      
      {parsedTips.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2 text-white">Parsed Tips</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-900 text-gray-400 text-xs uppercase">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {parsedTips.map((tip, index) => (
                  <tr key={index} className="bg-gray-900/30 hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-2">{formatDate(tip.date)}</td>
                    <td className="px-4 py-2">${(tip.amount / 100).toFixed(2)}</td>
                    <td className="px-4 py-2">
                      {tip.status === 'pending' && (
                        <span className="text-yellow-400">Pending</span>
                      )}
                      {tip.status === 'success' && (
                        <span className="text-green-400">Imported</span>
                      )}
                      {tip.status === 'error' && (
                        <span className="text-red-400" title={tip.message}>
                          Error: {tip.message}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={importTips}
              disabled={importing || !user}
              className={`bg-white text-black font-bold py-2 px-4 rounded-md transition-colors ${
                importing || !user ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
              }`}
            >
              {importing ? 'Importing...' : 'Import All Tips'}
            </button>
            
            <button
              onClick={() => {
                setParsedTips([]);
                setInputText('');
                setImportSuccess(null);
              }}
              className="text-gray-400 hover:text-white"
            >
              Clear
            </button>
          </div>
          
          {importSuccess && (
            <div className="mt-4 bg-green-900/50 border-l-4 border-green-500 text-white p-4 rounded-md">
              {importSuccess}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkTipImport; 