'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import Header from '../components/Header';
import Link from 'next/link';
import { getTips } from '../lib/supabase';
import AIChatAssistant from '../components/analytics/AIChatAssistant';
import MonthlyChart from '../components/analytics/MonthlyChart';
import DailyAveragesChart from '../components/analytics/DailyAveragesChart';
import BestWorstDays from '../components/analytics/BestWorstDays';
import Projections from '../components/analytics/Projections';
import { format } from 'date-fns';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function PremiumDashboard() {
  const { user, isPaid, loading } = useAuth();
  const router = useRouter();
  const [tips, setTips] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeInsightTab, setActiveInsightTab] = useState('earnings');
  const [timeframe, setTimeframe] = useState('month');
  const [savingsTips, setSavingsTips] = useState([
    {
      id: 1,
      title: "Work More Weekend Shifts",
      description: "Your weekend shifts earn 35% more than weekday shifts. Consider adjusting your schedule.",
      impact: "Potential increase: $185/month",
      icon: "📅"
    },
    {
      id: 2,
      title: "Focus on Evening Hours",
      description: "Evening shifts (5pm-close) earn 40% more than morning shifts.",
      impact: "Potential increase: $210/month",
      icon: "🌙"
    },
    {
      id: 3,
      title: "Track Weather Patterns",
      description: "Your tips are 22% higher on rainy days. Check the forecast when scheduling.",
      impact: "Potential increase: $120/month",
      icon: "🌧️"
    }
  ]);

  // Redirect if not authenticated or not paid
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isPaid) {
        router.push('/upgrade');
      }
    }
  }, [user, isPaid, loading, router]);

  // Fetch user's tips
  useEffect(() => {
    const fetchTips = async () => {
      if (user) {
        const userTips = await getTips(user.id);
        setTips(userTips);
      }
    };

    fetchTips();
  }, [user]);

  // Generate sample chart data
  const generateChartData = () => {
    // Monthly data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map(() => Math.floor(Math.random() * 3000) + 1000);
    
    // Weekly data
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const weeklyData = weeks.map(() => Math.floor(Math.random() * 1000) + 500);
    
    // Daily data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyData = days.map(() => Math.floor(Math.random() * 300) + 100);
    
    // Shift type data
    const shiftTypes = ['Morning', 'Afternoon', 'Evening', 'Night'];
    const shiftData = shiftTypes.map(() => Math.floor(Math.random() * 200) + 100);
    
    // Location data
    const locations = ['Main Floor', 'Bar', 'Patio', 'Private Events'];
    const locationData = locations.map(() => Math.floor(Math.random() * 250) + 100);
    
    return {
      monthly: {
        labels: months,
        datasets: [
          {
            label: 'Monthly Earnings ($)',
            data: monthlyData,
            borderColor: '#EAB308',
            backgroundColor: 'rgba(234, 179, 8, 0.2)',
            tension: 0.3,
            fill: true
          }
        ]
      },
      weekly: {
        labels: weeks,
        datasets: [
          {
            label: 'Weekly Earnings ($)',
            data: weeklyData,
            borderColor: '#EAB308',
            backgroundColor: 'rgba(234, 179, 8, 0.2)',
            tension: 0.3,
            fill: true
          }
        ]
      },
      daily: {
        labels: days,
        datasets: [
          {
            label: 'Average Daily Earnings ($)',
            data: dailyData,
            backgroundColor: [
              'rgba(53, 162, 235, 0.5)',
              'rgba(53, 162, 235, 0.5)',
              'rgba(53, 162, 235, 0.5)',
              'rgba(53, 162, 235, 0.5)',
              'rgba(234, 179, 8, 0.5)',
              'rgba(234, 179, 8, 0.5)',
              'rgba(234, 179, 8, 0.5)'
            ],
            borderColor: [
              'rgba(53, 162, 235, 1)',
              'rgba(53, 162, 235, 1)',
              'rgba(53, 162, 235, 1)',
              'rgba(53, 162, 235, 1)',
              'rgba(234, 179, 8, 1)',
              'rgba(234, 179, 8, 1)',
              'rgba(234, 179, 8, 1)'
            ],
            borderWidth: 1
          }
        ]
      },
      shifts: {
        labels: shiftTypes,
        datasets: [
          {
            label: 'Average Earnings by Shift ($)',
            data: shiftData,
            backgroundColor: [
              'rgba(53, 162, 235, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(234, 179, 8, 0.5)',
              'rgba(153, 102, 255, 0.5)'
            ],
            borderColor: [
              'rgba(53, 162, 235, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(234, 179, 8, 1)',
              'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
          }
        ]
      },
      locations: {
        labels: locations,
        datasets: [
          {
            label: 'Average Earnings by Location ($)',
            data: locationData,
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(153, 102, 255, 0.5)'
            ],
            borderWidth: 0
          }
        ]
      }
    };
  };

  const chartData = generateChartData();

  if (loading || !user || !isPaid) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
            Premium Dashboard
          </h1>
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-sm px-3 py-1 rounded-full font-bold">
            PREMIUM MEMBER
          </div>
        </div>

        {/* Premium Navigation Tabs */}
        <div className="flex overflow-x-auto mb-8 pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('ai-assistant')}
            className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
              activeTab === 'ai-assistant'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            AI Assistant
          </button>
          <button
            onClick={() => setActiveTab('tip-history')}
            className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
              activeTab === 'tip-history'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Tip History
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Advanced Analytics
          </button>
          <button
            onClick={() => setActiveTab('projections')}
            className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
              activeTab === 'projections'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Future Projections
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-yellow-500 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-2">Total Tips</h3>
                <p className="text-3xl font-bold text-yellow-400">
                  ${(tips.reduce((sum, tip) => sum + tip.amount, 0) / 100).toFixed(2)}
                </p>
                <p className="text-sm text-gray-400 mt-1">Lifetime earnings</p>
              </div>
              
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-yellow-500 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-2">Average Tips</h3>
                <p className="text-3xl font-bold text-yellow-400">
                  ${tips.length > 0 ? ((tips.reduce((sum, tip) => sum + tip.amount, 0) / tips.length) / 100).toFixed(2) : '0.00'}
                </p>
                <p className="text-sm text-gray-400 mt-1">Per day worked</p>
              </div>
              
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-yellow-500 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-2">Days Tracked</h3>
                <p className="text-3xl font-bold text-yellow-400">{tips.length}</p>
                <p className="text-sm text-gray-400 mt-1">Total days with tips</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-yellow-500 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
                <MonthlyChart />
              </div>
              
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-yellow-500 transition-all duration-300">
                <h3 className="text-lg font-semibold mb-4">Daily Averages</h3>
                <DailyAveragesChart />
              </div>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-yellow-500 transition-all duration-300">
              <h3 className="text-lg font-semibold mb-4">AI Chat Assistant</h3>
              <AIChatAssistant />
            </div>
          </div>
        )}

        {/* AI Assistant Tab */}
        {activeTab === 'ai-assistant' && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold">AI Chat Assistant</h2>
              <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs rounded-full font-bold">PREMIUM</span>
            </div>
            <p className="text-gray-400 mb-6">
              Ask me anything about your tips and earnings! I can analyze your data and provide personalized insights.
            </p>
            <div className="h-[500px]">
              <AIChatAssistant />
            </div>
          </div>
        )}

        {/* Tip History Tab */}
        {activeTab === 'tip-history' && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Tip History</h2>
              <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs rounded-full font-bold">PREMIUM</span>
            </div>
            
            {tips.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-3 px-4 text-left">Day</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tips.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tip) => {
                      const date = new Date(tip.date);
                      const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
                      
                      return (
                        <tr key={tip.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="py-3 px-4">{formattedDate}</td>
                          <td className="py-3 px-4">{dayOfWeek}</td>
                          <td className="py-3 px-4 text-right font-medium text-yellow-400">
                            ${(tip.amount / 100).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>No tip history found. Start adding tips to see your history.</p>
                <Link href="/dashboard" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors">
                  Add Tips
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold">Advanced Analytics</h2>
                  <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs rounded-full font-bold">PREMIUM</span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTimeframe('week')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      timeframe === 'week'
                        ? 'bg-yellow-500 text-black font-bold'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setTimeframe('month')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      timeframe === 'month'
                        ? 'bg-yellow-500 text-black font-bold'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setTimeframe('year')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      timeframe === 'year'
                        ? 'bg-yellow-500 text-black font-bold'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Year
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">Earnings Trend</h3>
                  <div className="h-64">
                    <Line 
                      data={timeframe === 'week' ? chartData.weekly : (timeframe === 'month' ? chartData.monthly : chartData.monthly)} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                              color: 'rgba(255, 255, 255, 0.7)'
                            }
                          },
                          x: {
                            grid: {
                              color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                              color: 'rgba(255, 255, 255, 0.7)'
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            labels: {
                              color: 'rgba(255, 255, 255, 0.7)'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">Daily Averages</h3>
                  <div className="h-64">
                    <Bar 
                      data={chartData.daily}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                              color: 'rgba(255, 255, 255, 0.7)'
                            }
                          },
                          x: {
                            grid: {
                              color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                              color: 'rgba(255, 255, 255, 0.7)'
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            labels: {
                              color: 'rgba(255, 255, 255, 0.7)'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">Earnings by Shift</h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-3/4 h-full">
                      <Pie 
                        data={chartData.shifts}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                              labels: {
                                color: 'rgba(255, 255, 255, 0.7)'
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">Earnings by Location</h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-3/4 h-full">
                      <Pie 
                        data={chartData.locations}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                              labels: {
                                color: 'rgba(255, 255, 255, 0.7)'
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projections Tab */}
        {activeTab === 'projections' && (
          <div className="space-y-8">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-6">
                <h2 className="text-xl font-semibold">Future Projections</h2>
                <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs rounded-full font-bold">PREMIUM</span>
              </div>
              
              <p className="text-gray-400 mb-6">
                Based on your historical data, here are AI-powered projections of your future earnings.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-yellow-500 transition-all duration-300">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Next Month</h3>
                  <p className="text-3xl font-bold text-yellow-400">$2,450</p>
                  <p className="text-sm text-green-500 mt-1">+12% from current month</p>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-yellow-500 transition-all duration-300">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Next Quarter</h3>
                  <p className="text-3xl font-bold text-yellow-400">$7,850</p>
                  <p className="text-sm text-green-500 mt-1">+8% from current quarter</p>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-yellow-500 transition-all duration-300">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Annual Projection</h3>
                  <p className="text-3xl font-bold text-yellow-400">$32,400</p>
                  <p className="text-sm text-green-500 mt-1">+15% from last year</p>
                </div>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
                <h3 className="text-lg font-semibold mb-4">Earnings Forecast</h3>
                <div className="h-64">
                  <Line 
                    data={{
                      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                      datasets: [
                        {
                          label: 'Actual Earnings',
                          data: [1800, 2200, 2100, 2400, 2300, 2600, null, null, null, null, null, null],
                          borderColor: '#3B82F6',
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          tension: 0.3,
                          fill: true
                        },
                        {
                          label: 'Projected Earnings',
                          data: [null, null, null, null, null, 2600, 2800, 2900, 3100, 3300, 3500, 3800],
                          borderColor: '#EAB308',
                          backgroundColor: 'rgba(234, 179, 8, 0.2)',
                          borderDash: [5, 5],
                          tension: 0.3,
                          fill: true
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          },
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                          }
                        },
                        x: {
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          },
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          labels: {
                            color: 'rgba(255, 255, 255, 0.7)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-6">Optimization Recommendations</h3>
                
                <div className="space-y-4">
                  {savingsTips.map(tip => (
                    <div key={tip.id} className="flex items-start p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-yellow-500 transition-all duration-300">
                      <div className="text-3xl mr-4">{tip.icon}</div>
                      <div>
                        <h4 className="font-semibold text-yellow-400">{tip.title}</h4>
                        <p className="text-gray-400 text-sm mt-1">{tip.description}</p>
                        <p className="text-green-500 text-sm font-semibold mt-2">{tip.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 