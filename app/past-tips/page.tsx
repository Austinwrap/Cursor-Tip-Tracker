'use client';

import React from 'react';
import { useAuth } from '../lib/AuthContext';
import PastTipForm from '../components/PastTipForm';
import TipCalendar from '../components/TipCalendar';
import AuthCheck from '../components/AuthCheck';
import PageTitle from '../components/PageTitle';

export default function PastTips() {
  const { user } = useAuth();
  
  const handleTipAdded = () => {
    // This will be handled by the PastTipForm component
  };

  return (
    <AuthCheck>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <PageTitle title="Past Tips" />
        
        <div className="mb-8">
          <p className="text-gray-300 mb-6">
            Add or edit tips from previous days. You can either use the form below to select a specific date, 
            or click on a date in the calendar to add or edit a tip for that day.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <PastTipForm onTipAdded={handleTipAdded} />
          </div>
          
          <div>
            <TipCalendar />
          </div>
        </div>
      </div>
    </AuthCheck>
  );
} 