import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getTips, Tip } from '../lib/supabase';
import { formatDate, formatCurrency } from '../lib/dateUtils';

const TipHistory: React.FC = () => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTips = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const tipsData = await getTips(user.id);
        setTips(tipsData);
      } catch (err) {
        console.error('Error fetching tips:', err);
        setError('Failed to load tip history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, [user]);

  if (loading) {
    return <div className="text-center py-4">Loading tip history...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-500 text-white p-3 rounded">
        {error}
      </div>
    );
  }

  if (tips.length === 0) {
    return (
      <div className="card text-center py-6">
        <p>No tip history found. Start by adding your first tip!</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="section-title">Tip History</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-accent">
              <th className="text-left py-2">Date</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {tips.map((tip) => (
              <tr key={tip.id} className="border-b border-gray-800 hover:bg-hover">
                <td className="py-2">{formatDate(tip.date)}</td>
                <td className="py-2 text-right">{formatCurrency(tip.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TipHistory; 