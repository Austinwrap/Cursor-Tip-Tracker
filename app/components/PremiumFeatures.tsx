'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';

// Define valid plan types
type PlanType = 'starter' | 'pro' | 'ultimate';

interface PremiumFeaturesProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minimumPlan?: PlanType;
}

/**
 * A component that conditionally renders content based on the user's premium status
 * 
 * @param children The content to show if the user has premium access
 * @param fallback Optional content to show if the user doesn't have premium access
 * @param minimumPlan Optional minimum plan required ('starter', 'pro', or 'ultimate')
 */
export default function PremiumFeatures({ 
  children, 
  fallback, 
  minimumPlan = 'starter' 
}: PremiumFeaturesProps) {
  const { user, isPaid, premiumStatus, loading: authLoading, refreshPremiumStatus } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Plan hierarchy for access control with proper type definition
  const planHierarchy: Record<PlanType, number> = {
    'starter': 1,
    'pro': 2,
    'ultimate': 3
  };

  useEffect(() => {
    // If auth is still loading, wait
    if (authLoading) return;
    
    // If no user, definitely no access
    if (!user) {
      setHasAccess(false);
      setLoading(false);
      return;
    }
    
    // Quick check based on isPaid from AuthContext
    if (!isPaid) {
      setHasAccess(false);
      setLoading(false);
      return;
    }
    
    // Refresh premium status to get the latest data
    const checkPremiumAccess = async () => {
      try {
        // Refresh premium status
        await refreshPremiumStatus();
        
        // Check if premium features are enabled
        if (!premiumStatus.premiumFeaturesEnabled) {
          setHasAccess(false);
          return;
        }
        
        // Check if subscription is active or lifetime
        if (premiumStatus.subscriptionStatus !== 'active' && premiumStatus.subscriptionStatus !== 'lifetime') {
          setHasAccess(false);
          return;
        }
        
        // Check if the user's plan meets the minimum required plan
        // Cast the plan type to ensure TypeScript knows it's a valid key
        const userPlanType = (premiumStatus.planType || 'starter') as PlanType;
        const userPlanLevel = planHierarchy[userPlanType] || 0;
        const requiredPlanLevel = planHierarchy[minimumPlan] || 1;
        
        setHasAccess(userPlanLevel >= requiredPlanLevel);
      } catch (err) {
        console.error('Error in premium access check:', err);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkPremiumAccess();
  }, [user, isPaid, authLoading, minimumPlan, premiumStatus, refreshPremiumStatus]);

  // Show loading state
  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // If user has access, show the children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If fallback is provided, show it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default fallback is an upgrade prompt
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
      <h3 className="text-xl font-bold mb-2 text-white">Premium Feature</h3>
      <p className="text-gray-400 mb-4">
        This feature requires a{' '}
        {minimumPlan === 'starter' ? 'Premium' : 
         minimumPlan === 'pro' ? 'Pro' : 'Ultimate'} 
        {' '}plan or higher.
      </p>
      <button
        onClick={() => router.push('/upgrade')}
        className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:from-cyan-600 hover:to-teal-600 transition-all"
      >
        Upgrade Now
      </button>
    </div>
  );
} 