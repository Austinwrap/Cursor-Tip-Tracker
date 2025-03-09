'use client';

import { useEffect, useState } from 'react';

export default function TipsPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    // Add the Tip Tracker styles
    const style = document.createElement('style');
    style.innerHTML = `
      .tip-container {
        font-family: 'Inter', Arial, sans-serif;
        background: #0a0a0a;
        color: #c8c8c8;
        margin: 0;
        padding: 10px;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: flex-start;
      }
      .tip-inner-container {
        width: 100%;
        max-width: 600px;
        display: grid;
        gap: 10px;
      }
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
      /* Responsive adjustments */
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
        .tip-inner-container {
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
    `;
    document.head.appendChild(style);

    // Initialize the Tip Tracker functionality
    const initTipTracker = () => {
      let tips = JSON.parse(localStorage.getItem('tips')) || [];

      const tipDate = document.getElementById('tipDate');
      const tipAmount = document.getElementById('tipAmount');
      const tipList = document.getElementById('tipList');
      const weeklyTotal = document.getElementById('weeklyTotal');
      const monthlyTotal = document.getElementById('monthlyTotal');
      const calendarView = document.getElementById('calendarView');
      const addTipButton = document.getElementById('addTipButton');

      // Set today's date as default
      const today = new Date().toISOString().split('T')[0];
      tipDate.value = today;

      // Add tip function
      const addTip = () => {
        const date = tipDate.value;
        const amount = parseFloat(tipAmount.value);

        if (!date || isNaN(amount)) {
          alert('Please enter a valid date and tip amount.');
          return;
        }

        const tip = { date, amount };
        tips.push(tip);
        saveTips();
        renderTips();
        renderCalendar();
        updateTotals();
        tipAmount.value = ''; // Clear input
      };

      // Edit tip function
      window.editTip = (index) => {
        const newAmount = prompt('Enter new tip amount:', tips[index].amount);
        if (newAmount && !isNaN(newAmount)) {
          tips[index].amount = parseFloat(newAmount);
          saveTips();
          renderTips();
          renderCalendar();
          updateTotals();
        }
      };

      // Delete tip function
      window.deleteTip = (index) => {
        if (confirm('Are you sure you want to delete this tip?')) {
          tips.splice(index, 1);
          saveTips();
          renderTips();
          renderCalendar();
          updateTotals();
        }
      };

      // Save tips to localStorage
      const saveTips = () => {
        localStorage.setItem('tips', JSON.stringify(tips));
      };

      // Render tips list
      const renderTips = () => {
        tipList.innerHTML = '';
        tips.sort((a, b) => new Date(b.date) - new Date(a.date));
        tips.forEach((tip, index) => {
          const li = document.createElement('li');
          li.innerHTML = `
            ${tip.date}: $${tip.amount.toFixed(2)}
            <span>
              <button onclick="editTip(${index})">Edit</button>
              <button onclick="deleteTip(${index})">Delete</button>
            </span>
          `;
          tipList.appendChild(li);
        });
      };

      // Render calendar
      const renderCalendar = () => {
        calendarView.innerHTML = '';

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
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
            tipDate.value = dateStr;
            tipAmount.focus();
          };
          const dayNum = document.createElement('span');
          dayNum.textContent = day;
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

        weeklyTotal.textContent = weeklyTotalValue.toFixed(2);
        monthlyTotal.textContent = monthlyTotalValue.toFixed(2);
      };

      // Add event listener to the button
      addTipButton.addEventListener('click', addTip);

      // Initialize
      renderTips();
      renderCalendar();
      updateTotals();
    };

    // Set a small timeout to ensure the DOM is fully loaded
    setTimeout(() => {
      initTipTracker();
      setIsLoaded(true);
    }, 100);
  }, []);

  return (
    <div className="tip-container">
      <div className="tip-inner-container">
        {/* Input Section */}
        <div className="input-section">
          <h2>Tip Tracker</h2>
          <input type="date" id="tipDate" required />
          <input type="number" id="tipAmount" placeholder="Enter tip amount" step="0.01" min="0" required />
          <button id="addTipButton">Add Tip</button>
        </div>

        {/* Totals Section */}
        <div className="totals-section">
          <div>Weekly Total: $<span id="weeklyTotal">0.00</span></div>
          <div>Monthly Total: $<span id="monthlyTotal">0.00</span></div>
        </div>

        {/* List of Tips */}
        <div className="tip-list">
          <h3>Tip History</h3>
          <ul id="tipList"></ul>
        </div>

        {/* Calendar View */}
        <div className="calendar-view" id="calendarView"></div>
      </div>
    </div>
  );
} 