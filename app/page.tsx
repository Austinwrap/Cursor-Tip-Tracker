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