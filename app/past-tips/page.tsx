'use client';

import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import PastTipForm from '../components/PastTipForm';
import TipCalendar from '../components/TipCalendar';
import BulkTipImport from '../components/BulkTipImport';
import AuthCheck from '../components/AuthCheck';
import PageTitle from '../components/PageTitle';

export default function PastTips() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'form' | 'bulk'>('form');
  
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
          
          {/* Tab navigation */}
          <div className="flex border-b border-gray-700 mb-6">
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === 'form'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('form')}
            >
              Single Tip Entry
            </button>
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === 'bulk'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('bulk')}
            >
              Bulk Import
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {activeTab === 'form' ? (
              <PastTipForm onTipAdded={handleTipAdded} />
            ) : (
              <BulkTipImport />
            )}
          </div>
          
          <div>
            <TipCalendar />
          </div>
        </div>
      </div>
    </AuthCheck>
  );
} 