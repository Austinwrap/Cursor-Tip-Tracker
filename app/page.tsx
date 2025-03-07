'use client';

import React from 'react';
import Link from 'next/link';
import Header from './components/Header';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-teal-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-8 relative inline-block">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 animate-gradient">
                TipTracker.ai
              </span>
            </h1>
            <div className="absolute -top-6 -right-6 w-12 h-12 text-yellow-400 animate-bounce-slow opacity-90">
              ✨
            </div>
          </div>
          
          <p className="text-2xl mb-10 text-gray-300 font-light">
            Track your tips. <span className="text-blue-400">Maximize</span> your earnings.
          </p>
          
          <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-10 shadow-2xl mb-16 transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="text-center">
                <p className="text-xl mb-8 text-gray-300 leading-relaxed">
                  The <span className="font-semibold text-blue-400">smarter way</span> for service industry professionals to track daily tips, 
                  analyze earnings, and unlock financial insights with AI.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-full hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-blue-500/20 transform hover:scale-105 uppercase tracking-wider inline-block">
                    Get Started Free
                  </Link>
                  <Link href="/upgrade" className="bg-transparent border-2 border-gray-700 text-white font-bold py-4 px-8 rounded-full hover:border-blue-500 hover:text-blue-400 transition-all uppercase tracking-wider inline-block">
                    View Premium
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Premium ROI Section */}
          <div className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 shadow-2xl mb-20 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 text-8xl text-yellow-300 opacity-10">💰</div>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-2/3 text-left">
                <div className="inline-block bg-yellow-500 text-black text-xs px-3 py-1 rounded-full mb-4 font-bold">PREMIUM ROI</div>
                <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">
                  Invest $30/year. <span className="text-white">Save $5,000+</span>
                </h2>
                <p className="text-gray-300 mb-6">
                  Our AI-powered analytics reveal hidden patterns in your earnings, helping you identify your most profitable shifts, locations, and strategies.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
                    <div className="text-2xl font-bold text-yellow-400">15-20%</div>
                    <div className="text-sm text-gray-400">Average earnings increase</div>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
                    <div className="text-2xl font-bold text-yellow-400">166x</div>
                    <div className="text-sm text-gray-400">Return on investment</div>
                  </div>
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
                    <div className="text-2xl font-bold text-yellow-400">$0.08</div>
                    <div className="text-sm text-gray-400">Cost per day</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex -space-x-2">
                    <img className="w-8 h-8 rounded-full border-2 border-black" src="https://randomuser.me/api/portraits/women/32.jpg" alt="User" />
                    <img className="w-8 h-8 rounded-full border-2 border-black" src="https://randomuser.me/api/portraits/men/44.jpg" alt="User" />
                    <img className="w-8 h-8 rounded-full border-2 border-black" src="https://randomuser.me/api/portraits/women/58.jpg" alt="User" />
                  </div>
                  <span className="text-sm text-gray-300">Join 10,000+ service professionals maximizing their income</span>
                </div>
              </div>
              
              <div className="md:w-1/3">
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30 transform hover:scale-105 transition-all duration-300 text-center">
                  <div className="text-4xl font-bold mb-2">$30</div>
                  <div className="text-sm text-gray-400 mb-4">per year</div>
                  <div className="text-xs text-yellow-400 mb-6">That's just $2.50/month!</div>
                  
                  <ul className="text-left space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-sm">AI-powered earnings insights</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-sm">Shift optimization recommendations</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-sm">Personalized AI chat assistant</span>
                    </li>
                  </ul>
                  
                  <Link href="/upgrade" className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-bold py-3 px-6 rounded-full hover:from-yellow-400 hover:to-yellow-300 transition-all shadow-lg hover:shadow-yellow-500/20 transform hover:scale-105 inline-block w-full">
                    Upgrade Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Features section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="bg-black/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
              <div className="text-blue-400 text-3xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Track Daily Tips</h3>
              <p className="text-gray-400">Easily log your daily earnings and track your progress over time.</p>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="text-purple-400 text-3xl mb-4">🔮</div>
              <h3 className="text-xl font-bold mb-2">AI Insights</h3>
              <p className="text-gray-400">Get personalized recommendations to maximize your earning potential.</p>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-teal-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-teal-500/20">
              <div className="text-teal-400 text-3xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-2">Access Anywhere</h3>
              <p className="text-gray-400">Track your tips on any device, anytime, anywhere.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add custom styles for animations */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
        
        @keyframes blob {
          0% { transform: scale(1); }
          33% { transform: scale(1.1); }
          66% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
      `}</style>
    </main>
  );
} 