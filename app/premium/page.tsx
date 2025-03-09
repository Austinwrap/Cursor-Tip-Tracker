'use client';

import React from 'react';
import { useAuth } from '../lib/AuthContext';
import Header from '../components/Header';
import PremiumFeatures from '../components/PremiumFeatures';
import AuthCheck from '../components/AuthCheck';

export default function PremiumPage() {
  const { user } = useAuth();

  return (
    <AuthCheck>
      <div className="min-h-screen bg-black text-white">
        <Header />
        
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-400">
            Premium Features
          </h1>
          <p className="text-xl text-gray-400 text-center mb-12">
            Access your premium features and tools
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Basic Premium Feature (Starter Plan) */}
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Advanced Analytics</h2>
                <PremiumFeatures minimumPlan="starter">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <p className="text-gray-300 mb-4">
                      View detailed analytics about your tips and earnings.
                    </p>
                    <div className="bg-gray-700 h-40 rounded-lg flex items-center justify-center">
                      <p className="text-cyan-400 font-semibold">Analytics Dashboard</p>
                    </div>
                    <p className="text-gray-400 text-sm mt-4">
                      Available with Starter plan and above
                    </p>
                  </div>
                </PremiumFeatures>
              </div>
            </div>
            
            {/* Pro Feature */}
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Earnings Projections</h2>
                <PremiumFeatures minimumPlan="pro">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <p className="text-gray-300 mb-4">
                      See projected earnings based on your historical data.
                    </p>
                    <div className="bg-gray-700 h-40 rounded-lg flex items-center justify-center">
                      <p className="text-cyan-400 font-semibold">Projections Chart</p>
                    </div>
                    <p className="text-gray-400 text-sm mt-4">
                      Available with Pro plan and above
                    </p>
                  </div>
                </PremiumFeatures>
              </div>
            </div>
            
            {/* Ultimate Feature */}
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Data Export</h2>
                <PremiumFeatures minimumPlan="starter">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <p className="text-gray-300 mb-4">
                      Export your tip data in various formats.
                    </p>
                    <div className="flex space-x-2 mt-4">
                      <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded">
                        Export CSV
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded">
                        Export PDF
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm mt-4">
                      Available with Starter plan and above
                    </p>
                  </div>
                </PremiumFeatures>
              </div>
            </div>
            
            {/* Ultimate Feature */}
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Priority Support</h2>
                <PremiumFeatures minimumPlan="ultimate">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <p className="text-gray-300 mb-4">
                      Get priority support from our team.
                    </p>
                    <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
                      Contact Support
                    </button>
                    <p className="text-gray-400 text-sm mt-4">
                      Available with Ultimate plan only
                    </p>
                  </div>
                </PremiumFeatures>
              </div>
            </div>
          </div>
          
          <div className="mt-12 max-w-3xl mx-auto bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Your Subscription</h2>
            <PremiumFeatures>
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-300 mb-4">
                  You currently have access to premium features. Thank you for your support!
                </p>
                <p className="text-gray-400">
                  If you have any questions about your subscription, please contact our support team.
                </p>
              </div>
            </PremiumFeatures>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
} 