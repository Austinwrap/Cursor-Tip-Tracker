'use client';

import React, { useEffect, useState } from 'react';
import Header from '../components/Header';

export default function Dashboard() {
  const [tips, setTips] = useState<Array<{date: string, amount: number}>>([]);
  const [weeklyTotal, setWeeklyTotal] = useState('0.00');
  const [monthlyTotal, setMonthlyTotal] = useState('0.00');

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    // Load tips from localStorage
    const storedTips = localStorage.getItem('tips');
    if (storedTips) {
      setTips(JSON.parse(storedTips));
    }

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('tipDate') as HTMLInputElement;
    if (dateInput) {
      dateInput.value = today;
    }

    // Initialize
    renderCalendar();
    updateTotals();
  }, []);

  // Update totals whenever tips change
  useEffect(() => {
    renderCalendar();
    updateTotals();
  }, [tips]);

  // Add tip function
  const addTip = () => {
    const dateInput = document.getElementById('tipDate') as HTMLInputElement;
    const amountInput = document.getElementById('tipAmount') as HTMLInputElement;
    
    const date = dateInput?.value;
    const amount = parseFloat(amountInput?.value || '0');

    if (!date || isNaN(amount)) {
      alert('Please enter a valid date and tip amount.');
      return;
    }

    const newTips = [...tips, { date, amount }];
    setTips(newTips);
    localStorage.setItem('tips', JSON.stringify(newTips));
    
    // Clear input
    if (amountInput) {
      amountInput.value = '';
    }
  };

  // Edit tip function
  const editTip = (index: number) => {
    const newAmount = prompt('Enter new tip amount:', tips[index].amount.toString());
    if (newAmount && !isNaN(parseFloat(newAmount))) {
      const newTips = [...tips];
      newTips[index].amount = parseFloat(newAmount);
      setTips(newTips);
      localStorage.setItem('tips', JSON.stringify(newTips));
    }
  };

  // Delete tip function
  const deleteTip = (index: number) => {
    if (confirm('Are you sure you want to delete this tip?')) {
      const newTips = [...tips];
      newTips.splice(index, 1);
      setTips(newTips);
      localStorage.setItem('tips', JSON.stringify(newTips));
    }
  };

  // Render calendar
  const renderCalendar = () => {
    const calendarView = document.getElementById('calendarView');
    if (!calendarView) return;
    
    calendarView.innerHTML = '';

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
      const dayLabel = document.createElement('div');
      dayLabel.textContent = day;
      dayLabel.style.fontWeight = '600';
      dayLabel.style.color = '#00a3af';
      dayLabel.style.fontSize = '10px';
      calendarView.appendChild(dayLabel);
    });

    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day';
      calendarView.appendChild(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayDiv = document.createElement('div');
      dayDiv.className = 'calendar-day';
      dayDiv.dataset.date = dateStr;
      dayDiv.onclick = () => {
        const dateInput = document.getElementById('tipDate') as HTMLInputElement;
        const amountInput = document.getElementById('tipAmount') as HTMLInputElement;
        if (dateInput) {
          dateInput.value = dateStr;
        }
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

      calendarView.appendChild(dayDiv);
    }
  };

  // Update totals
  const updateTotals = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const weeklyTotalValue = tips
      .filter(tip => new Date(tip.date) >= weekStart)
      .reduce((sum, tip) => sum + tip.amount, 0);
    
    const monthlyTotalValue = tips
      .filter(tip => new Date(tip.date) >= monthStart)
      .reduce((sum, tip) => sum + tip.amount, 0);

    setWeeklyTotal(weeklyTotalValue.toFixed(2));
    setMonthlyTotal(monthlyTotalValue.toFixed(2));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <style jsx global>{`
          .input-section, .totals-section, .tip-list, .calendar-view {
            background: linear-gradient(145deg, #141414, #1c1c1c);
            border: 1px solid #88eaff;
            padding: 10px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(136, 234, 255, 0.1);
            position: relative;
            overflow: hidden;
          }
          .input-section::before, .totals-section::before, .tip-list::before, .calendar-view::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(145deg, rgba(136, 234, 255, 0.05), rgba(136, 234, 255, 0));
            pointer-events: none;
          }
          .input-section {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
          }
          .input-section input, .input-section button {
            padding: 8px 12px;
            border-radius: 25px;
            border: 1px solid #88eaff;
            background: #222222;
            color: #c8c8c8;
            font-size: 12px;
            flex: 1;
            min-width: 100px;
            box-shadow: 0 2px 4px rgba(136, 234, 255, 0.2);
            transition: box-shadow 0.3s ease;
          }
          .input-section input:focus, .input-section button:focus {
            outline: none;
            box-shadow: 0 0 6px rgba(136, 234, 255, 0.5);
          }
          .input-section button {
            background: #00a3af;
            color: #000;
            border: none;
            cursor: pointer;
            transition: transform 0.2s ease, background 0.3s ease;
            font-weight: 600;
          }
          .input-section button:hover, .input-section button:active {
            background: #008c96;
            transform: scale(0.9);
          }
          .totals-section {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            gap: 8px;
          }
          .totals-section div {
            background: #1a1a1a;
            padding: 8px;
            border-radius: 8px;
            flex: 1;
            text-align: center;
            border: 1px solid #88eaff;
            box-shadow: 0 2px 4px rgba(136, 234, 255, 0.1);
          }
          .tip-list ul {
            list-style: none;
            padding: 0;
            max-height: 120px;
            overflow-y: auto;
          }
          .tip-list li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 0;
            border-bottom: 1px solid #3a3a3a;
            font-size: 11px;
          }
          .tip-list button {
            background: none;
            border: 1px solid #ff5555;
            color: #ff5555;
            cursor: pointer;
            font-size: 10px;
            padding: 4px 6px;
            border-radius: 15px;
            transition: background 0.3s ease, transform 0.2s ease;
            box-shadow: 0 2px 4px rgba(255, 85, 85, 0.2);
          }
          .tip-list button:hover, .tip-list button:active {
            background: #ff5555;
            color: #000;
            transform: scale(0.9);
          }
          .calendar-view {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 3px;
            text-align: center;
          }
          .calendar-day {
            padding: 6px;
            background: #1e1e1e;
            border: 1px solid #88eaff;
            border-radius: 6px;
            min-height: 40px;
            transition: background 0.3s ease, transform 0.2s ease;
            cursor: pointer;
          }
          .calendar-day:hover {
            background: #282828;
            transform: scale(1.02);
          }
          .calendar-day.has-tip {
            background: #2a3a2a;
          }
          .calendar-day .tip-text {
            font-size: 8px;
            color: #b0ffb0;
            font-weight: 500;
            margin-top: 4px;
            display: block;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 4px;
            padding: 2px 4px;
          }
          h2, h3 {
            margin: 3px 0;
            color: #00a3af;
            font-size: 16px;
            font-weight: 600;
          }
          .calendar-day span:first-child {
            font-size: 10px;
            font-weight: 500;
          }
          .tip-container {
            width: 100%;
            max-width: 600px;
            display: grid;
            gap: 10px;
            margin: 0 auto;
          }
          @media (max-width: 400px) {
            .input-section {
              flex-direction: column;
            }
            .input-section input, .input-section button {
              width: 100%;
              min-width: unset;
              font-size: 11px;
              padding: 7px 10px;
            }
            .totals-section {
              flex-direction: column;
              gap: 6px;
            }
            .calendar-day {
              padding: 5px;
              min-height: 35px;
            }
            .calendar-day span:first-child {
              font-size: 9px;
            }
            .calendar-day .tip-text {
              font-size: 7px;
              padding: 1px 3px;
            }
            .tip-list ul {
              max-height: 100px;
            }
          }
          @media (min-width: 800px) {
            .tip-container {
              max-width: 700px;
            }
            .calendar-day {
              padding: 8px;
              min-height: 45px;
            }
            .input-section input, .input-section button {
              font-size: 13px;
            }
          }
        `}</style>

        <div className="tip-container">
          {/* Input Section */}
          <div className="input-section">
            <h2>Tip Tracker</h2>
            <input type="date" id="tipDate" required />
            <input type="number" id="tipAmount" placeholder="Enter tip amount" step="0.01" min="0" required />
            <button onClick={addTip}>Add Tip</button>
          </div>

          {/* Totals Section */}
          <div className="totals-section">
            <div>Weekly Total: $<span id="weeklyTotal">{weeklyTotal}</span></div>
            <div>Monthly Total: $<span id="monthlyTotal">{monthlyTotal}</span></div>
          </div>

          {/* List of Tips */}
          <div className="tip-list">
            <h3>Tip History</h3>
            <ul id="tipList">
              {tips.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tip, index) => (
                <li key={`${tip.date}-${index}`}>
                  {tip.date}: ${tip.amount.toFixed(2)}
                  <span>
                    <button onClick={() => editTip(index)}>Edit</button>
                    <button onClick={() => deleteTip(index)}>Delete</button>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Calendar View */}
          <div className="calendar-view" id="calendarView"></div>
        </div>
      </main>
    </div>
  );
} 