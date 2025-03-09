'use client';

import { useState, useEffect } from 'react';
import { Box, Heading } from '@chakra-ui/react';

export default function TipsPage() {
  // Use useEffect to inject our standalone Tip Tracker code
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Create container for the Tip Tracker
    const container = document.getElementById('tip-tracker-container');
    if (!container) return;
    
    // Apply styles
    document.body.style.backgroundColor = '#1a1a1a';
    document.body.style.color = '#e0e0e0';
    
    // Create the Tip Tracker HTML structure
    container.innerHTML = `
      <div class="container">
        <!-- Input Section -->
        <div class="input-section">
            <h2>Add New Tip</h2>
            <input type="date" id="tipDate" required>
            <input type="number" id="tipAmount" placeholder="Enter tip amount" step="0.01" min="0" required>
            <button id="addTipButton">Add Tip</button>
        </div>

        <!-- Stats Section -->
        <div class="tip-list">
            <h3>Tip Statistics</h3>
            <div class="stats">
                <div class="stat-box">
                    <div class="stat-label">Total Tips</div>
                    <div class="stat-value" id="totalTips">$0.00</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Average Tip</div>
                    <div class="stat-value" id="avgTip">$0.00</div>
                </div>
            </div>
            <h3 style="margin-top: 20px;">Recent Tips</h3>
            <ul id="tipList"></ul>
        </div>

        <!-- Calendar View -->
        <div class="tip-list">
            <div class="calendar-header">
                <button id="prevMonthButton">&lt; Prev</button>
                <div class="calendar-title" id="calendarTitle">March 2025</div>
                <button id="nextMonthButton">Next &gt;</button>
            </div>
            <div class="calendar-view" id="calendarView">
                <!-- Calendar will be dynamically generated -->
            </div>
        </div>
      </div>
    `;
    
    // Add the CSS styles
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .container {
          display: grid;
          gap: 20px;
          max-width: 900px;
          margin: 20px auto;
      }
      .input-section {
          background-color: #2a2a2a;
          border: 1px solid #4d4d4d;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
      }
      .tip-list, .calendar-view {
          background-color: #2a2a2a;
          border: 1px solid #4d4d4d;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
      }
      .calendar-view {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          text-align: center;
      }
      .calendar-day {
          padding: 10px;
          background-color: #333;
          border: 1px solid #4d4d4d;
          border-radius: 6px;
          position: relative;
          min-height: 60px;
          transition: transform 0.2s ease, background-color 0.3s ease;
      }
      .calendar-day:hover {
          transform: scale(1.05);
          background-color: #444;
      }
      .calendar-day.has-tip {
          background-color: #3a4d3a;
      }
      .calendar-day .tip-text {
          font-size: 11px;
          color: #aaffaa;
          font-weight: 500;
          margin-top: 5px;
          display: block;
          background: rgba(0, 0, 0, 0.6);
          border-radius: 4px;
          padding: 2px 6px;
      }
      .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
      }
      .calendar-title {
          color: #aaffaa;
          font-size: 18px;
          font-weight: bold;
      }
      input, button {
          margin: 5px;
          padding: 10px;
          border-radius: 4px;
          border: 1px solid #4d4d4d;
          background-color: #333;
          color: #e0e0e0;
          font-size: 14px;
      }
      input:focus, button:focus {
          outline: none;
          border-color: #aaffaa;
          box-shadow: 0 0 5px rgba(170, 255, 170, 0.5);
      }
      button {
          background-color: #4CAF50;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s ease;
      }
      button:hover {
          background-color: #45a049;
      }
      ul {
          list-style: none;
          padding: 0;
      }
      li {
          padding: 8px 0;
          border-bottom: 1px solid #4d4d4d;
      }
      h2, h3 {
          margin-top: 0;
          color: #aaffaa;
      }
      .stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 10px;
      }
      .stat-box {
          background-color: #333;
          padding: 10px;
          border-radius: 4px;
      }
      .stat-label {
          font-size: 12px;
          color: #e0e0e0;
      }
      .stat-value {
          font-size: 18px;
          font-weight: bold;
          color: #aaffaa;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Initialize the Tip Tracker functionality
    let tips = JSON.parse(localStorage.getItem('tips')) || [];
    let currentMonth = new Date();
    
    // Initialize on page load
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tipDate').value = today;
    renderTips();
    renderCalendar();
    updateStats();
    
    // Add event listeners
    document.getElementById('addTipButton').addEventListener('click', addTip);
    document.getElementById('prevMonthButton').addEventListener('click', prevMonth);
    document.getElementById('nextMonthButton').addEventListener('click', nextMonth);
    
    // Add a new tip
    function addTip() {
      const date = document.getElementById('tipDate').value;
      const amount = parseFloat(document.getElementById('tipAmount').value);

      if (!date || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid date and tip amount.');
        return;
      }

      const tip = { date, amount };
      tips.push(tip);
      localStorage.setItem('tips', JSON.stringify(tips));
      
      renderTips();
      renderCalendar();
      updateStats();
      document.getElementById('tipAmount').value = ''; // Clear input
    }

    // Render the tip list
    function renderTips() {
      const tipList = document.getElementById('tipList');
      tipList.innerHTML = '';
      
      // Sort tips by date (newest first)
      const sortedTips = [...tips].sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Show only the 5 most recent tips
      const recentTips = sortedTips.slice(0, 5);
      
      recentTips.forEach(tip => {
        const li = document.createElement('li');
        const formattedDate = new Date(tip.date).toLocaleDateString();
        li.textContent = `${formattedDate}: $${tip.amount.toFixed(2)}`;
        tipList.appendChild(li);
      });
    }

    // Update statistics
    function updateStats() {
      const totalTipsElement = document.getElementById('totalTips');
      const avgTipElement = document.getElementById('avgTip');
      
      if (tips.length === 0) {
        totalTipsElement.textContent = '$0.00';
        avgTipElement.textContent = '$0.00';
        return;
      }
      
      const total = tips.reduce((sum, tip) => sum + tip.amount, 0);
      const average = total / tips.length;
      
      totalTipsElement.textContent = `$${total.toFixed(2)}`;
      avgTipElement.textContent = `$${average.toFixed(2)}`;
    }

    // Render the calendar
    function renderCalendar() {
      const calendarView = document.getElementById('calendarView');
      const calendarTitle = document.getElementById('calendarTitle');
      calendarView.innerHTML = '';
      
      // Set calendar title
      const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
      calendarTitle.textContent = monthName;

      // Get current month details
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // Add day labels
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      daysOfWeek.forEach(day => {
        const dayLabel = document.createElement('div');
        dayLabel.textContent = day;
        dayLabel.style.fontWeight = 'bold';
        dayLabel.style.color = '#aaffaa';
        calendarView.appendChild(dayLabel);
      });

      // Add empty slots for days before the 1st
      for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        calendarView.appendChild(emptyDay);
      }

      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.dataset.date = dateStr;
        
        // Add click handler to select date
        dayDiv.addEventListener('click', () => {
          document.getElementById('tipDate').value = dateStr;
          document.getElementById('tipAmount').focus();
        });
        
        const dayNum = document.createElement('span');
        dayNum.textContent = day;
        dayDiv.appendChild(dayNum);

        // Highlight days with tips and show total
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
    }

    // Navigate to previous month
    function prevMonth() {
      currentMonth.setMonth(currentMonth.getMonth() - 1);
      renderCalendar();
    }

    // Navigate to next month
    function nextMonth() {
      currentMonth.setMonth(currentMonth.getMonth() + 1);
      renderCalendar();
    }
  }, []);

  return (
    <Box bg="#1a1a1a" minH="100vh" py={8}>
      <Heading as="h1" size="xl" textAlign="center" color="#aaffaa" mb={6}>
        Tip Tracker
      </Heading>
      <div id="tip-tracker-container"></div>
    </Box>
  );
} 