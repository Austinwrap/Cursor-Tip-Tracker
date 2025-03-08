'use client';

import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/dateUtils';

interface ParsedTip {
  date: string;
  amount: number;
  status: 'pending' | 'success' | 'error';
  message?: string;
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

  // Robust tip saving function with multiple fallback approaches
  const saveTip = async (userId: string, date: string, amountInCents: number) => {
    console.log('Attempting to save tip:', { userId, date, amountInCents });
    
    // First approach: Direct Supabase query
    try {
      // Check if a tip already exists for this date
      const { data: existingTip, error: fetchError } = await supabase
        .from('tips')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error checking for existing tip (approach 1):', fetchError);
        // Continue to next approach
      } else {
        let result;
        
        if (existingTip) {
          // Update existing tip
          result = await supabase
            .from('tips')
            .update({ amount: amountInCents })
            .eq('id', existingTip.id);
            
          if (!result.error) {
            console.log('Successfully updated tip (approach 1)');
            return true;
          }
          console.error('Error updating tip (approach 1):', result.error);
        } else {
          // Insert new tip
          result = await supabase
            .from('tips')
            .insert([{ 
              user_id: userId, 
              date: date, 
              amount: amountInCents 
            }]);
            
          if (!result.error) {
            console.log('Successfully inserted tip (approach 1)');
            return true;
          }
          console.error('Error inserting tip (approach 1):', result.error);
        }
      }
    } catch (err) {
      console.error('Unexpected error in saveTip approach 1:', err);
    }
    
    // Second approach: Using RPC (Remote Procedure Call)
    try {
      const { data, error } = await supabase.rpc('save_tip', {
        p_user_id: userId,
        p_date: date,
        p_amount: amountInCents
      });
      
      if (!error) {
        console.log('Successfully saved tip using RPC (approach 2)');
        return true;
      }
      
      console.error('Error saving tip using RPC (approach 2):', error);
    } catch (err) {
      console.error('Unexpected error in saveTip approach 2:', err);
    }
    
    // Third approach: Using raw SQL via Supabase
    try {
      // First check if tip exists
      const { data: existsData, error: existsError } = await supabase.rpc('tip_exists', {
        p_user_id: userId,
        p_date: date
      });
      
      if (existsError) {
        console.error('Error checking if tip exists (approach 3):', existsError);
      } else {
        const exists = existsData;
        
        if (exists) {
          // Update
          const { error: updateError } = await supabase.rpc('update_tip', {
            p_user_id: userId,
            p_date: date,
            p_amount: amountInCents
          });
          
          if (!updateError) {
            console.log('Successfully updated tip using SQL (approach 3)');
            return true;
          }
          
          console.error('Error updating tip using SQL (approach 3):', updateError);
        } else {
          // Insert
          const { error: insertError } = await supabase.rpc('insert_tip', {
            p_user_id: userId,
            p_date: date,
            p_amount: amountInCents
          });
          
          if (!insertError) {
            console.log('Successfully inserted tip using SQL (approach 3)');
            return true;
          }
          
          console.error('Error inserting tip using SQL (approach 3):', insertError);
        }
      }
    } catch (err) {
      console.error('Unexpected error in saveTip approach 3:', err);
    }
    
    // Fourth approach: Simplified direct insert/update with less error checking
    try {
      // Try update first (will do nothing if no record exists)
      const { error: updateError } = await supabase
        .from('tips')
        .update({ amount: amountInCents })
        .match({ user_id: userId, date: date });
      
      if (!updateError) {
        // Check if any rows were affected
        const { count, error: countError } = await supabase
          .from('tips')
          .select('*', { count: 'exact', head: true })
          .match({ user_id: userId, date: date });
        
        if (!countError && count && count > 0) {
          console.log('Successfully updated tip (approach 4)');
          return true;
        }
      }
      
      // If update didn't work or no rows existed, try insert
      const { error: insertError } = await supabase
        .from('tips')
        .insert([{ 
          user_id: userId, 
          date: date, 
          amount: amountInCents 
        }]);
      
      if (!insertError) {
        console.log('Successfully inserted tip (approach 4)');
        return true;
      }
      
      console.error('Error in simplified approach (approach 4):', insertError);
    } catch (err) {
      console.error('Unexpected error in saveTip approach 4:', err);
    }
    
    // If all approaches failed, return false
    return false;
  };

  // Import the parsed tips to the database
  const importTips = async () => {
    if (!user || parsedTips.length === 0) return;
    
    setImporting(true);
    setImportSuccess(null);
    
    // Create a copy of the parsed tips to update their status
    const updatedTips = [...parsedTips];
    let successCount = 0;
    
    for (let i = 0; i < updatedTips.length; i++) {
      const tip = updatedTips[i];
      
      // Skip tips that already have an error
      if (tip.status === 'error') continue;
      
      try {
        // Use our robust tip saving function
        const result = await saveTip(user.id, tip.date, tip.amount);
        
        if (result) {
          updatedTips[i] = {
            ...tip,
            status: 'success'
          };
          successCount++;
        } else {
          updatedTips[i] = {
            ...tip,
            status: 'error',
            message: 'Failed to save tip after multiple attempts'
          };
        }
      } catch (err) {
        console.error('Error in importTips:', err);
        updatedTips[i] = {
          ...tip,
          status: 'error',
          message: 'Unexpected error occurred'
        };
      }
      
      // Update the UI after each tip is processed
      setParsedTips([...updatedTips]);
    }
    
    setImporting(false);
    
    if (successCount > 0) {
      setImportSuccess(`Successfully imported ${successCount} tips!`);
      
      // Clear the input text on success
      if (successCount === parsedTips.length) {
        setInputText('');
      }
    }
  };

  return (
    <div className="bg-black border border-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-2 text-white">Bulk Import Tips</h2>
      <p className="mb-6 text-gray-400 text-sm">
        Paste your tip notes below. The system will try to detect dates and amounts automatically.
      </p>
      
      <div className="space-y-6">
        {parseError && (
          <div className="bg-red-900/50 border-l-4 border-red-500 text-white p-4 rounded-md">
            <p className="font-bold">Error</p>
            <p>{parseError}</p>
          </div>
        )}
        
        {importSuccess && (
          <div className="bg-green-900/50 border-l-4 border-green-500 text-white p-4 rounded-md">
            <p className="font-bold">Success!</p>
            <p>{importSuccess}</p>
          </div>
        )}
        
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your tip notes here. Example:
1/15 $120
Jan 16 $85
Yesterday $95
Last Friday $150"
          className="w-full bg-gray-900 border border-gray-700 focus:border-white text-white rounded-md p-4 h-40 resize-none"
          disabled={importing}
        />
        
        <div className="flex space-x-4">
          <button
            onClick={parseInput}
            disabled={importing || !inputText.trim()}
            className={`flex-1 py-3 px-4 rounded-md transition-colors ${
              importing || !inputText.trim()
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Parse Input
          </button>
          
          <button
            onClick={importTips}
            disabled={importing || parsedTips.length === 0}
            className={`flex-1 py-3 px-4 rounded-md transition-colors ${
              importing || parsedTips.length === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {importing ? 'Importing...' : 'Import Tips'}
          </button>
        </div>
        
        {parsedTips.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Detected Tips</h3>
            <div className="bg-gray-900 rounded-md overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedTips.map((tip, index) => (
                    <tr 
                      key={index} 
                      className={`border-b border-gray-800 ${
                        tip.status === 'success' 
                          ? 'bg-green-900/20' 
                          : tip.status === 'error' 
                            ? 'bg-red-900/20' 
                            : ''
                      }`}
                    >
                      <td className="px-4 py-3">{formatDate(tip.date)}</td>
                      <td className="px-4 py-3">${(tip.amount / 100).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        {tip.status === 'pending' && (
                          <span className="text-gray-400">Pending</span>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkTipImport; 