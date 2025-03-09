'use client';

import { useEffect } from 'react';

export default function TipsPage() {
  useEffect(() => {
    // Only run in browser
    if (typeof document === 'undefined') return;
    
    // Get the root element
    const root = document.getElementById('root');
    if (!root) return;
    
    // Set the HTML content directly from the user's code
    document.documentElement.innerHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tip Tracker</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #1a1a1a;
            color: #e0e0e0;
            max-width: 900px;
            margin: 20px auto;
            padding: 20px;
        }
        .container {
            display: grid;
            gap: 20px;
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
    </style>
</head>
<body>
    <div class="container">
        <!-- Input Section -->
        <div class="input-section">
            <h2>Tip Tracker</h2>
            <input type="date" id="tipDate" required>
            <input type="number" id="tipAmount" placeholder="Enter tip amount" step="0.01" min="0" required>
            <button onclick="addTip()">Add Tip</button>
        </div>

        <!-- List of Tips -->
        <div class="tip-list">
            <h3>Tip History</h3>
            <ul id="tipList"></ul>
        </div>

        <!-- Calendar View -->
        <div class="calendar-view" id="calendarView">
            <!-- Calendar will be dynamically generated -->
        </div>
    </div>

    <script>
        let tips = JSON.parse(localStorage.getItem('tips')) || [];

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', () => {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('tipDate').value = today;
            renderTips();
            renderCalendar();
        });

        function addTip() {
            const date = document.getElementById('tipDate').value;
            const amount = parseFloat(document.getElementById('tipAmount').value);

            if (!date || isNaN(amount)) {
                alert('Please enter a valid date and tip amount.');
                return;
            }

            const tip = { date, amount };
            tips.push(tip);
            localStorage.setItem('tips', JSON.stringify(tips));
            
            renderTips();
            renderCalendar();
            document.getElementById('tipAmount').value = ''; // Clear input
        }

        function renderTips() {
            const tipList = document.getElementById('tipList');
            tipList.innerHTML = '';
            tips.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending
            tips.forEach(tip => {
                const li = document.createElement('li');
                li.textContent = \`\${tip.date}: $\${tip.amount.toFixed(2)}\`;
                tipList.appendChild(li);
            });
        }

        function renderCalendar() {
            const calendarView = document.getElementById('calendarView');
            calendarView.innerHTML = '';

            // Create simple calendar for current month
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();
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
                const dateStr = \`\${year}-\${String(month + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
                const dayDiv = document.createElement('div');
                dayDiv.className = 'calendar-day';
                dayDiv.onclick = function() {
                    document.getElementById('tipDate').value = dateStr;
                    document.getElementById('tipAmount').focus();
                };
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
                    tipText.textContent = \`$\${total.toFixed(2)}\`;
                    dayDiv.appendChild(tipText);
                }

                calendarView.appendChild(dayDiv);
            }
        }
    </script>
</body>
</html>
    `;
    
    // Execute the script immediately
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].textContent) {
        eval(scripts[i].textContent);
      }
    }
  }, []);

  // Return an empty div as a placeholder
  return <div id="root"></div>;
} 