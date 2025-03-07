import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { getProjectedEarnings } from '../../lib/supabase';
import { formatCurrency } from '../../lib/dateUtils';

const Projections: React.FC = () => {
  const [sevenDayProjection, setSevenDayProjection] = useState<number>(0);
  const [thirtyDayProjection, setThirtyDayProjection] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProjections = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const sevenDays = await getProjectedEarnings(user.id, 7);
        const thirtyDays = await getProjectedEarnings(user.id, 30);
        
        setSevenDayProjection(sevenDays);
        setThirtyDayProjection(thirtyDays);
      } catch (err) {
        console.error('Error fetching projections:', err);
        setError('Failed to load projections');
      } finally {
        setLoading(false);
      }
    };

    fetchProjections();
  }, [user]);

  if (loading) {
    return <div className="text-center py-4">Loading projections...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-500 text-white p-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="section-title">Future Projections</h2>
      <p className="mb-4 text-sm opacity-70">
        Based on your historical average tips
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-hover">
          <h3 className="font-bold mb-2">Next 7 Days</h3>
          <p className="text-xl">{formatCurrency(sevenDayProjection)}</p>
        </div>
        
        <div className="card bg-hover">
          <h3 className="font-bold mb-2">Next 30 Days</h3>
          <p className="text-xl">{formatCurrency(thirtyDayProjection)}</p>
        </div>
      </div>
    </div>
  );
};

export default Projections; 