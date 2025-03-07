import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { getBestAndWorstDays, Tip } from '../../lib/supabase';
import { formatDate, formatCurrency, getDayOfWeek } from '../../lib/dateUtils';

const BestWorstDays: React.FC = () => {
  const [bestDay, setBestDay] = useState<Tip | null>(null);
  const [worstDay, setWorstDay] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBestWorstDays = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { best, worst } = await getBestAndWorstDays(user.id);
        setBestDay(best);
        setWorstDay(worst);
      } catch (err) {
        console.error('Error fetching best/worst days:', err);
        setError('Failed to load best and worst days');
      } finally {
        setLoading(false);
      }
    };

    fetchBestWorstDays();
  }, [user]);

  if (loading) {
    return <div className="text-center py-4">Loading best and worst days...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-500 text-white p-3 rounded">
        {error}
      </div>
    );
  }

  if (!bestDay || !worstDay) {
    return (
      <div className="card text-center py-6">
        <p>Not enough data to determine best and worst days.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="section-title">Best & Worst Days</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-hover">
          <h3 className="font-bold mb-2">Best Day</h3>
          <p className="text-xl mb-1">{formatCurrency(bestDay.amount)}</p>
          <p>{formatDate(bestDay.date)}</p>
          <p className="text-sm opacity-70">{getDayOfWeek(bestDay.date)}</p>
        </div>
        
        <div className="card bg-hover">
          <h3 className="font-bold mb-2">Worst Day</h3>
          <p className="text-xl mb-1">{formatCurrency(worstDay.amount)}</p>
          <p>{formatDate(worstDay.date)}</p>
          <p className="text-sm opacity-70">{getDayOfWeek(worstDay.date)}</p>
        </div>
      </div>
    </div>
  );
};

export default BestWorstDays; 