import { useState } from 'react';
import styles from './Calendar.module.css';

export default function Calendar({ tips = [], onDayClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get current month and year
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  
  // Calculate days in month and first day of month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Group tips by day for the current month
  const tipsByDay = {};
  tips.forEach(tip => {
    const tipDate = new Date(tip.date);
    if (tipDate.getMonth() === month && tipDate.getFullYear() === year) {
      const day = tipDate.getDate();
      if (!tipsByDay[day]) {
        tipsByDay[day] = [];
      }
      tipsByDay[day].push(tip);
    }
  });
  
  // Calculate monthly total
  const monthlyTotal = Object.values(tipsByDay).reduce((total, dayTips) => {
    return total + dayTips.reduce((dayTotal, tip) => dayTotal + Number(tip.amount), 0);
  }, 0);
  
  // Handle month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  // Generate calendar days
  const renderDays = () => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Add day headers
    dayNames.forEach(day => {
      days.push(
        <div key={`header-${day}`} className={styles.dayHeader}>
          {day}
        </div>
      );
    });
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className={styles.emptyDay}></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayTips = tipsByDay[day] || [];
      const dayTotal = dayTips.reduce((sum, tip) => sum + Number(tip.amount), 0);
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`${styles.day} ${dayTips.length > 0 ? styles.hasTips : ''}`}
          onClick={() => onDayClick(new Date(year, month, day))}
        >
          <div className={styles.dayNumber}>{day}</div>
          {dayTotal > 0 && (
            <div className={styles.tipAmount}>${dayTotal}</div>
          )}
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        <button className={styles.navButton} onClick={prevMonth}>
          &lt;
        </button>
        <div className={styles.monthDisplay}>
          <h2>{monthNames[month]} {year}</h2>
          <div className={styles.monthTotal}>
            Total: ${monthlyTotal}
          </div>
        </div>
        <button className={styles.navButton} onClick={nextMonth}>
          &gt;
        </button>
      </div>
      
      <div className={styles.calendarGrid}>
        {renderDays()}
      </div>
    </div>
  );
} 