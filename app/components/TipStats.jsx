import { useState, useEffect } from 'react';
import styles from './TipStats.module.css';

export default function TipStats({ tips = [] }) {
  const [stats, setStats] = useState({
    totalTips: 0,
    averagePerDay: 0,
    bestDay: { day: '', amount: 0 },
    bestDayOfWeek: { day: '', average: 0 },
    thisMonth: 0,
    lastMonth: 0
  });

  useEffect(() => {
    if (!tips.length) return;
    
    // Calculate total tips
    const totalAmount = tips.reduce((sum, tip) => sum + Number(tip.amount), 0);
    
    // Calculate average per day worked
    const averagePerDay = totalAmount / tips.length;
    
    // Find best single day
    let bestDay = { day: '', amount: 0 };
    
    // Group tips by day
    const tipsByDay = {};
    tips.forEach(tip => {
      const dateStr = new Date(tip.date).toISOString().split('T')[0];
      if (!tipsByDay[dateStr]) {
        tipsByDay[dateStr] = 0;
      }
      tipsByDay[dateStr] += Number(tip.amount);
      
      if (tipsByDay[dateStr] > bestDay.amount) {
        bestDay = {
          day: dateStr,
          amount: tipsByDay[dateStr]
        };
      }
    });
    
    // Group by day of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayTotals = Array(7).fill(0);
    const dayCount = Array(7).fill(0);
    
    tips.forEach(tip => {
      const date = new Date(tip.date);
      const dayOfWeek = date.getDay();
      dayTotals[dayOfWeek] += Number(tip.amount);
      dayCount[dayOfWeek]++;
    });
    
    // Find best day of week
    let bestDayOfWeek = { day: '', average: 0 };
    dayTotals.forEach((total, index) => {
      if (dayCount[index] > 0) {
        const average = total / dayCount[index];
        if (average > bestDayOfWeek.average) {
          bestDayOfWeek = {
            day: dayNames[index],
            average: average
          };
        }
      }
    });
    
    // Calculate this month and last month
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    
    const thisMonthTotal = tips.reduce((sum, tip) => {
      const date = new Date(tip.date);
      return (date.getMonth() === thisMonth && date.getFullYear() === thisYear)
        ? sum + Number(tip.amount)
        : sum;
    }, 0);
    
    const lastMonthTotal = tips.reduce((sum, tip) => {
      const date = new Date(tip.date);
      return (date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear)
        ? sum + Number(tip.amount)
        : sum;
    }, 0);
    
    setStats({
      totalTips: totalAmount,
      averagePerDay: averagePerDay,
      bestDay: bestDay,
      bestDayOfWeek: bestDayOfWeek,
      thisMonth: thisMonthTotal,
      lastMonth: lastMonthTotal
    });
  }, [tips]);

  if (!tips.length) {
    return (
      <div className={styles.emptyStats}>
        <p>Add some tips to see your statistics!</p>
      </div>
    );
  }

  return (
    <div className={styles.statsContainer}>
      <h2 className={styles.statsTitle}>Your Tip Stats</h2>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Tips</h3>
          <p className={styles.statValue}>${stats.totalTips.toFixed(0)}</p>
        </div>
        
        <div className={styles.statCard}>
          <h3>Average Per Day</h3>
          <p className={styles.statValue}>${stats.averagePerDay.toFixed(0)}</p>
        </div>
        
        <div className={styles.statCard}>
          <h3>Best Day</h3>
          <p className={styles.statValue}>${stats.bestDay.amount.toFixed(0)}</p>
          <p className={styles.statSubtext}>
            {stats.bestDay.day ? new Date(stats.bestDay.day).toLocaleDateString() : '-'}
          </p>
        </div>
        
        <div className={styles.statCard}>
          <h3>Best Day of Week</h3>
          <p className={styles.statValue}>${stats.bestDayOfWeek.average.toFixed(0)}</p>
          <p className={styles.statSubtext}>{stats.bestDayOfWeek.day}</p>
        </div>
      </div>
      
      <div className={styles.monthComparison}>
        <div className={styles.monthCard}>
          <h3>This Month</h3>
          <p className={styles.monthValue}>${stats.thisMonth.toFixed(0)}</p>
        </div>
        
        <div className={styles.monthCard}>
          <h3>Last Month</h3>
          <p className={styles.monthValue}>${stats.lastMonth.toFixed(0)}</p>
        </div>
      </div>
      
      <div className={styles.freemiumNotice}>
        <p>Want more detailed insights? <a href="/premium">Upgrade to Premium</a></p>
      </div>
    </div>
  );
} 