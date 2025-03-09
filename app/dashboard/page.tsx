'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { useAuth } from '../lib/AuthContext';
import { supabase, addTip as saveTipToSupabase, getTips as getSupabaseTips, deleteTip as deleteSupabaseTip } from '../lib/supabase';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tips, setTips] = useState<Array<{date: string, amount: number}>>([]);
  const [weeklyTotal, setWeeklyTotal] = useState('0.00');
  const [monthlyTotal, setMonthlyTotal] = useState('0.00');
  const [yearlyTotal, setYearlyTotal] = useState('0.00');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [tipDate, setTipDate] = useState<string>('');
  const [tipAmount, setTipAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Only run in browser and if user is authenticated
    if (typeof window === 'undefined' || !user) return;
    
    const loadTips = async () => {
      setIsLoading(true);
      setSyncStatus('Loading tips...');
      
      try {
        // Try to load tips from Supabase first
        const supabaseTips = await getSupabaseTips(user.id);
        
        if (supabaseTips && supabaseTips.length > 0) {
          // Convert Supabase tips to the format used in the dashboard
          const formattedTips = supabaseTips.map(tip => ({
            date: tip.date,
            amount: tip.amount
          }));
          
          setTips(formattedTips);
          
          // Also update localStorage with the latest data
          const storageKey = `tips_${user.id}`;
          localStorage.setItem(storageKey, JSON.stringify(formattedTips));
          setSyncStatus('Tips loaded from database');
        } else {
          // Fall back to localStorage if no tips in Supabase
          const storageKey = `tips_${user.id}`;
          const storedTips = localStorage.getItem(storageKey);
          
          if (storedTips) {
            const parsedTips = JSON.parse(storedTips);
            setTips(parsedTips);
            
            // Sync localStorage tips to Supabase
            setSyncStatus('Syncing tips to database...');
            for (const tip of parsedTips) {
              await saveTipToSupabase(user.id, tip.date, tip.amount);
            }
            setSyncStatus('Tips synced to database');
          }
        }
      } catch (error) {
        console.error('Error loading tips:', error);
        setSyncStatus('Error loading tips');
        
        // Fall back to localStorage if there's an error
        const storageKey = `tips_${user.id}`;
        const storedTips = localStorage.getItem(storageKey);
        if (storedTips) {
          setTips(JSON.parse(storedTips));
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setTipDate(today);

    loadTips();
  }, [user]);

  // Update totals whenever tips change
  useEffect(() => {
    if (!user) return;
    renderCalendar();
    updateTotals();
  }, [tips, selectedMonth, user]);

  // Add tip function
  const addTip = async () => {
    if (!user) {
      router.push('/signin');
      return;
    }

    const date = tipDate;
    const amount = parseFloat(tipAmount);

    if (!date || isNaN(amount)) {
      alert('Please enter a valid date and tip amount.');
      return;
    }

    setIsLoading(true);
    setSyncStatus('Saving tip...');

    try {
      // Save to Supabase
      const success = await saveTipToSupabase(user.id, date, amount);
      
      if (success) {
        // Update local state
        const newTips = [...tips, { date, amount }];
        setTips(newTips);
        
        // Also update localStorage
        const storageKey = `tips_${user.id}`;
        localStorage.setItem(storageKey, JSON.stringify(newTips));
        
        setSyncStatus('Tip saved successfully');
      } else {
        setSyncStatus('Error saving tip to database');
      }
    } catch (error) {
      console.error('Error saving tip:', error);
      setSyncStatus('Error saving tip');
    } finally {
      setIsLoading(false);
    }
    
    // Clear input
    setTipAmount('');
  };

  // Edit tip function
  const editTip = async (index: number) => {
    if (!user) {
      router.push('/signin');
      return;
    }

    const newAmount = prompt('Enter new tip amount:', tips[index].amount.toString());
    if (newAmount && !isNaN(parseFloat(newAmount))) {
      setIsLoading(true);
      setSyncStatus('Updating tip...');
      
      try {
        const date = tips[index].date;
        const amount = parseFloat(newAmount);
        
        // Update in Supabase
        const success = await saveTipToSupabase(user.id, date, amount);
        
        if (success) {
          // Update local state
          const newTips = [...tips];
          newTips[index].amount = amount;
          setTips(newTips);
          
          // Also update localStorage
          const storageKey = `tips_${user.id}`;
          localStorage.setItem(storageKey, JSON.stringify(newTips));
          
          setSyncStatus('Tip updated successfully');
        } else {
          setSyncStatus('Error updating tip in database');
        }
      } catch (error) {
        console.error('Error updating tip:', error);
        setSyncStatus('Error updating tip');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Delete tip function
  const deleteTip = async (index: number) => {
    if (!user) {
      router.push('/signin');
      return;
    }

    if (confirm('Are you sure you want to delete this tip?')) {
      setIsLoading(true);
      setSyncStatus('Deleting tip...');
      
      try {
        // Find the tip in Supabase to get its ID
        const date = tips[index].date;
        const supabaseTips = await getSupabaseTips(user.id);
        const tipToDelete = supabaseTips.find(tip => tip.date === date);
        
        if (tipToDelete) {
          // Delete from Supabase
          const success = await deleteSupabaseTip(tipToDelete.id, user.id);
          
          if (success) {
            // Update local state
            const newTips = [...tips];
            newTips.splice(index, 1);
            setTips(newTips);
            
            // Also update localStorage
            const storageKey = `tips_${user.id}`;
            localStorage.setItem(storageKey, JSON.stringify(newTips));
            
            setSyncStatus('Tip deleted successfully');
          } else {
            setSyncStatus('Error deleting tip from database');
          }
        } else {
          // If tip not found in Supabase, just update local state
          const newTips = [...tips];
          newTips.splice(index, 1);
          setTips(newTips);
          
          // Also update localStorage
          const storageKey = `tips_${user.id}`;
          localStorage.setItem(storageKey, JSON.stringify(newTips));
          
          setSyncStatus('Tip deleted from local storage');
        }
      } catch (error) {
        console.error('Error deleting tip:', error);
        setSyncStatus('Error deleting tip');
        
        // Fall back to just updating local state
        const newTips = [...tips];
        newTips.splice(index, 1);
        setTips(newTips);
        
        // Also update localStorage
        const storageKey = `tips_${user.id}`;
        localStorage.setItem(storageKey, JSON.stringify(newTips));
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Change month
  const changeMonth = (increment: number) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setSelectedMonth(newMonth);
  };

  // Render calendar
  const renderCalendar = () => {
    if (!user) return;
    
    const calendarView = document.getElementById('calendarView');
    if (!calendarView) return;
    
    calendarView.innerHTML = '';

    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
      const dayLabel = document.createElement('div');
      dayLabel.textContent = day;
      dayLabel.style.fontWeight = '600';
      dayLabel.style.color = '#00a3af';
      dayLabel.style.fontSize = '12px';
      calendarView.appendChild(dayLabel);
    });

    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day empty';
      calendarView.appendChild(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayDiv = document.createElement('div');
      dayDiv.className = 'calendar-day';
      dayDiv.dataset.date = dateStr;
      dayDiv.onclick = () => {
        setTipDate(dateStr);
        const amountInput = document.getElementById('tipAmount') as HTMLInputElement;
        if (amountInput) {
          amountInput.focus();
        }
      };
      
      const dayNum = document.createElement('span');
      dayNum.textContent = day.toString();
      dayDiv.appendChild(dayNum);

      const dayTips = tips.filter(tip => tip.date === dateStr);
      if (dayTips.length > 0) {
        dayDiv.classList.add('has-tip');
        const total = dayTips.reduce((sum, tip) => sum + tip.amount, 0);
        const tipText = document.createElement('span');
        tipText.className = 'tip-text';
        tipText.textContent = `$${total.toFixed(2)}`;
        dayDiv.appendChild(tipText);
      }

      // Check if this is today's date
      const today = new Date();
      if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        dayDiv.classList.add('today');
      }

      calendarView.appendChild(dayDiv);
    }
  };

  // Update totals
  const updateTotals = () => {
    if (!user) return;
    
    const today = new Date();
    
    // Calculate week start (Sunday)
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    // Calculate month start (1st day of current month)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);
    
    // Calculate year start (January 1st of current year)
    const yearStart = new Date(today.getFullYear(), 0, 1);
    yearStart.setHours(0, 0, 0, 0);

    // Calculate weekly total - tips from this week
    const weeklyTotalValue = tips
      .filter(tip => {
        const tipDate = new Date(tip.date);
        tipDate.setHours(0, 0, 0, 0);
        return tipDate >= weekStart;
      })
      .reduce((sum, tip) => sum + tip.amount, 0);
    
    // Calculate monthly total - tips from this month
    const monthlyTotalValue = tips
      .filter(tip => {
        const tipDate = new Date(tip.date);
        tipDate.setHours(0, 0, 0, 0);
        return tipDate >= monthStart;
      })
      .reduce((sum, tip) => sum + tip.amount, 0);
      
    // Calculate yearly total - tips from this year
    const yearlyTotalValue = tips
      .filter(tip => {
        const tipDate = new Date(tip.date);
        tipDate.setHours(0, 0, 0, 0);
        return tipDate >= yearStart;
      })
      .reduce((sum, tip) => sum + tip.amount, 0);

    setWeeklyTotal(weeklyTotalValue.toFixed(2));
    setMonthlyTotal(monthlyTotalValue.toFixed(2));
    setYearlyTotal(yearlyTotalValue.toFixed(2));
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-pulse text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render the dashboard (will redirect to signin)
  if (!user) {
    return null;
  }

  return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        
      <main className="container mx-auto px-4 py-6 safe-area-inset">
        <style jsx global>{`
          /* Safe area insets for modern iOS devices */
          .safe-area-inset {
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
            padding-bottom: env(safe-area-inset-bottom);
          }
          
          .input-section, .totals-section, .tip-list, .calendar-container {
            background: linear-gradient(145deg, #141414, #1c1c1c);
            border: 1px solid #00a3af;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 163, 175, 0.15);
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
          }
          
          .input-section:hover, .totals-section:hover, .tip-list:hover, .calendar-container:hover {
            box-shadow: 0 8px 30px rgba(0, 163, 175, 0.25);
            border-color: #00a3af;
          }
          
          .input-section::before, .totals-section::before, .tip-list::before, .calendar-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(145deg, rgba(0, 163, 175, 0.05), rgba(0, 163, 175, 0));
            pointer-events: none;
          }
          
          .input-section {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: center;
          }
          
          .input-section input, .input-section button {
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #00a3af;
            background: #222222;
            color: #ffffff;
            font-size: 14px;
            flex: 1;
            min-width: 100px;
            box-shadow: 0 2px 8px rgba(0, 163, 175, 0.2);
            transition: all 0.3s ease;
            -webkit-appearance: none; /* Remove default iOS styling */
          }
          
          .input-section input:focus, .input-section button:focus {
            outline: none;
            box-shadow: 0 0 12px rgba(0, 163, 175, 0.5);
            border-color: #00a3af;
          }
          
          .input-section button {
            background: linear-gradient(135deg, #00a3af, #0088a3);
            color: #fff;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .input-section button:hover {
            background: linear-gradient(135deg, #00b8c6, #009bb8);
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(0, 163, 175, 0.4);
          }
          
          .input-section button:active {
            transform: translateY(1px);
          }
          
          .totals-section {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            font-size: 14px;
          }
          
          .total-card {
            background: linear-gradient(145deg, #1a1a1a, #222222);
            padding: 16px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #00a3af;
            box-shadow: 0 4px 12px rgba(0, 163, 175, 0.1);
            transition: all 0.3s ease;
          }
          
          .total-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0, 163, 175, 0.2);
          }
          
          .total-card h3 {
            font-size: 14px;
            color: #00a3af;
            margin-bottom: 8px;
          }
          
          .total-card .amount {
            font-size: 24px;
            font-weight: 700;
            color: white;
          }
          
          .tip-list {
            margin-top: 24px;
          }
          
          .tip-list h2 {
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .tip-list ul {
            list-style: none;
            padding: 0;
            max-height: 240px;
            overflow-y: auto;
            margin: 0;
            -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
          }
          
          .tip-list li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            border-bottom: 1px solid #333;
            font-size: 14px;
            transition: background 0.2s ease;
          }
          
          .tip-list li:hover {
            background: rgba(0, 163, 175, 0.05);
          }
          
          .tip-list li:last-child {
            border-bottom: none;
          }
          
          .tip-list .date {
            font-weight: 500;
          }
          
          .tip-list .amount {
            font-weight: 700;
            color: #00a3af;
          }
          
          .tip-list .actions {
            display: flex;
            gap: 8px;
          }
          
          .tip-list button {
            background: none;
            border: 1px solid;
            cursor: pointer;
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 4px;
            transition: all 0.2s ease;
          }
          
          .tip-list .edit-btn {
            border-color: #00a3af;
            color: #00a3af;
          }
          
          .tip-list .edit-btn:hover {
            background: rgba(0, 163, 175, 0.1);
          }
          
          .tip-list .delete-btn {
            border-color: #ff5555;
            color: #ff5555;
          }
          
          .tip-list .delete-btn:hover {
            background: rgba(255, 85, 85, 0.1);
          }
          
          .calendar-container {
            margin-top: 24px;
          }
          
          .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }
          
          .calendar-title {
            font-size: 18px;
            font-weight: 600;
            color: #00a3af;
          }
          
          .calendar-nav {
            display: flex;
            gap: 12px;
          }
          
          .calendar-nav button {
            background: none;
            border: 1px solid #00a3af;
            color: #00a3af;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .calendar-nav button:hover {
            background: rgba(0, 163, 175, 0.1);
            transform: scale(1.05);
          }
          
          .calendar-view {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 8px;
            text-align: center;
          }
          
          .calendar-day {
            padding: 8px;
            background: linear-gradient(145deg, #1e1e1e, #252525);
            border: 1px solid #333;
            border-radius: 8px;
            min-height: 60px;
            transition: all 0.3s ease;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
          }
          
          .calendar-day:hover {
            background: linear-gradient(145deg, #252525, #2a2a2a);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            border-color: #00a3af;
          }
          
          .calendar-day.empty {
            background: transparent;
            border-color: transparent;
            cursor: default;
          }
          
          .calendar-day.empty:hover {
            transform: none;
            box-shadow: none;
          }
          
          .calendar-day.has-tip {
            background: linear-gradient(145deg, #1a2a2a, #203030);
            border-color: #00a3af;
          }
          
          .calendar-day.today {
            border: 2px solid #00a3af;
            box-shadow: 0 0 10px rgba(0, 163, 175, 0.3);
          }
          
          .calendar-day span:first-child {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 4px;
          }
          
          .calendar-day .tip-text {
            font-size: 12px;
            color: #00a3af;
            font-weight: 600;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 4px;
            padding: 2px 6px;
          }
          
          .section-title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 20px;
            color: #00a3af;
            text-align: center;
            position: relative;
            display: inline-block;
          }
          
          .section-title::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #00a3af, transparent);
          }
          
          .dashboard-container {
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
            max-width: 1000px;
            margin: 0 auto;
          }
          
          @media (min-width: 768px) {
            .dashboard-container {
              grid-template-columns: 1fr 1fr;
            }
            
            .totals-section {
              grid-column: span 2;
            }
          }
          
          @media (max-width: 640px) {
            .input-section {
              flex-direction: column;
            }
            
            .input-section input, .input-section button {
              width: 100%;
              font-size: 16px; /* Larger font for better touch targets */
              padding: 14px 16px; /* Taller inputs for better touch targets */
            }
            
            .totals-section {
              grid-template-columns: 1fr;
              gap: 8px;
            }
            
            .calendar-day {
              min-height: 45px;
              padding: 4px;
            }
            
            .calendar-day span:first-child {
              font-size: 12px;
            }
            
            .calendar-day .tip-text {
              font-size: 10px;
            }
            
            .tip-list li {
              padding: 14px 8px; /* Taller list items for better touch targets */
            }
            
            .tip-list .actions {
              gap: 4px;
            }
            
            .tip-list button {
              padding: 6px 10px; /* Larger buttons for better touch targets */
              font-size: 13px;
            }
          }
          
          /* iPhone-specific optimizations */
          @media screen and (max-width: 428px) { /* iPhone 13 Pro Max width */
            .calendar-view {
              gap: 4px;
            }
            
            .calendar-day {
              min-height: 40px;
              padding: 2px;
            }
            
            .calendar-day span:first-child {
              font-size: 11px;
            }
            
            .calendar-day .tip-text {
              font-size: 9px;
              padding: 1px 3px;
            }
            
            .section-title {
              font-size: 20px;
            }
            
            .total-card .amount {
              font-size: 20px;
            }
            
            .total-card h3 {
              font-size: 12px;
            }
            
            .tip-list .date {
              font-size: 13px;
            }
            
            .tip-list .amount {
              font-size: 13px;
            }
          }
        `}</style>

        <h1 className="section-title mx-auto text-center mb-6">Tip Tracker</h1>

        <div className="dashboard-container">
          {/* Status message */}
          {syncStatus && (
            <div className={`text-center mb-4 text-sm ${syncStatus.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
              {syncStatus}
            </div>
          )}

          {/* Totals Section */}
          <div className="totals-section">
            <div className="total-card">
              <h3>Weekly Total</h3>
              <div className="amount">${weeklyTotal}</div>
            </div>
            <div className="total-card">
              <h3>Monthly Total</h3>
              <div className="amount">${monthlyTotal}</div>
            </div>
            <div className="total-card">
              <h3>Yearly Total</h3>
              <div className="amount">${yearlyTotal}</div>
            </div>
          </div>

          {/* Input Section */}
          <div className="input-section">
            <h2 className="text-xl font-semibold text-white mb-2 w-full">Add New Tip</h2>
            <input 
              type="date" 
              value={tipDate}
              onChange={(e) => setTipDate(e.target.value)}
              required 
            />
            <input 
              type="number" 
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              placeholder="Enter tip amount" 
              step="0.01" 
              min="0" 
              required 
            />
            <button onClick={addTip}>Add Tip</button>
          </div>

          {/* Calendar View */}
          <div className="calendar-container">
            <div className="calendar-header">
              <h2 className="calendar-title">
                {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="calendar-nav">
                <button onClick={() => changeMonth(-1)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                  </svg>
                </button>
                <button onClick={() => setSelectedMonth(new Date())}>
                  Today
                </button>
                <button onClick={() => changeMonth(1)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="calendar-view" id="calendarView"></div>
          </div>

          {/* List of Tips */}
          <div className="tip-list">
            <h2 className="text-xl font-semibold text-white">
              Tip History
              <span className="text-sm text-gray-400 font-normal">
                {tips.length} {tips.length === 1 ? 'entry' : 'entries'}
              </span>
            </h2>
            {tips.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No tips recorded yet. Add your first tip to see it here.
              </div>
            ) : (
              <ul>
                {tips
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((tip, index) => (
                    <li key={`${tip.date}-${index}`}>
                      <span className="date">
                        {new Date(tip.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className="amount">${tip.amount.toFixed(2)}</span>
                      <span className="actions">
                        <button 
                          className="edit-btn"
                          onClick={() => editTip(index)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => deleteTip(index)}
                        >
                          Delete
                        </button>
                      </span>
                    </li>
                  ))}
              </ul>
            )}
            </div>
          </div>
        </main>
      </div>
  );
} 