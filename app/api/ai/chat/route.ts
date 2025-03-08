import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTips, getUserProfile } from '@/app/lib/supabase';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to analyze user question
function analyzeQuestion(question: string) {
  // Convert to lowercase for easier matching
  const lowerQuestion = question.toLowerCase();
  
  // Define regex patterns for date-related queries
  const datePatterns = {
    today: /today|current day/,
    yesterday: /yesterday|last day/,
    thisWeek: /this week|current week/,
    lastWeek: /last week|previous week/,
    thisMonth: /this month|current month/,
    lastMonth: /last month|previous month/,
    thisYear: /this year|current year/,
    specificDate: /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/,
    dateRange: /between (\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))? and (\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/,
  };
  
  // Check for different types of questions
  if (lowerQuestion.includes('total') || lowerQuestion.includes('sum')) {
    return { type: 'total', timeframe: getTimeframe(lowerQuestion, datePatterns) };
  } else if (lowerQuestion.includes('average') || lowerQuestion.includes('avg')) {
    return { type: 'average', timeframe: getTimeframe(lowerQuestion, datePatterns) };
  } else if (lowerQuestion.includes('best day') || lowerQuestion.includes('highest')) {
    return { type: 'best', timeframe: getTimeframe(lowerQuestion, datePatterns) };
  } else if (lowerQuestion.includes('worst day') || lowerQuestion.includes('lowest')) {
    return { type: 'worst', timeframe: getTimeframe(lowerQuestion, datePatterns) };
  } else if (lowerQuestion.includes('compare')) {
    return { type: 'compare', timeframe: getTimeframe(lowerQuestion, datePatterns) };
  } else if (lowerQuestion.includes('trend') || lowerQuestion.includes('pattern')) {
    return { type: 'trend', timeframe: getTimeframe(lowerQuestion, datePatterns) };
  } else if (lowerQuestion.includes('predict') || lowerQuestion.includes('forecast')) {
    return { type: 'predict', timeframe: getTimeframe(lowerQuestion, datePatterns) };
  } else {
    return { type: 'general', timeframe: getTimeframe(lowerQuestion, datePatterns) };
  }
}

// Helper function to determine timeframe from question
function getTimeframe(question: string, patterns: Record<string, RegExp>) {
  if (patterns.today.test(question)) {
    return 'today';
  } else if (patterns.yesterday.test(question)) {
    return 'yesterday';
  } else if (patterns.thisWeek.test(question)) {
    return 'thisWeek';
  } else if (patterns.lastWeek.test(question)) {
    return 'lastWeek';
  } else if (patterns.thisMonth.test(question)) {
    return 'thisMonth';
  } else if (patterns.lastMonth.test(question)) {
    return 'lastMonth';
  } else if (patterns.thisYear.test(question)) {
    return 'thisYear';
  } else if (patterns.dateRange.test(question)) {
    return 'dateRange';
  } else if (patterns.specificDate.test(question)) {
    return 'specificDate';
  } else {
    return 'all';
  }
}

// Helper function to get date ranges based on timeframe
function getDateRange(timeframe: string) {
  const today = new Date();
  const startDate = new Date();
  const endDate = new Date();
  
  switch (timeframe) {
    case 'today':
      // Start and end are both today
      break;
    case 'yesterday':
      startDate.setDate(today.getDate() - 1);
      endDate.setDate(today.getDate() - 1);
      break;
    case 'thisWeek':
      // Start of week (Sunday)
      startDate.setDate(today.getDate() - today.getDay());
      break;
    case 'lastWeek':
      // Start of last week
      startDate.setDate(today.getDate() - today.getDay() - 7);
      // End of last week
      endDate.setDate(today.getDate() - today.getDay() - 1);
      break;
    case 'thisMonth':
      startDate.setDate(1);
      break;
    case 'lastMonth':
      // Start of last month
      startDate.setMonth(today.getMonth() - 1);
      startDate.setDate(1);
      // End of last month
      endDate.setDate(0);
      break;
    case 'thisYear':
      startDate.setMonth(0);
      startDate.setDate(1);
      break;
    default:
      // Default to all time - set start date to 1 year ago
      startDate.setFullYear(today.getFullYear() - 1);
      break;
  }
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100); // Convert cents to dollars
}

// Main handler for AI chat
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { message, userId, devMode } = await request.json();
    
    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId are required' },
        { status: 400 }
      );
    }
    
    // Check if user exists and is paid (or in dev mode)
    const userProfile = await getUserProfile(userId);
    
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Allow access in dev mode or if user is paid
    if (!userProfile.is_paid && !devMode) {
      return NextResponse.json(
        { error: 'This feature is only available for premium users' },
        { status: 403 }
      );
    }
    
    // Analyze the user's question
    const analysis = analyzeQuestion(message);
    const dateRange = getDateRange(analysis.timeframe);
    
    // Fetch user's tips
    const tips = await getTips(userId);
    
    if (!tips || tips.length === 0) {
      return NextResponse.json({
        response: "I don't see any tips in your history yet. Start adding tips to get insights!"
      });
    }
    
    // Filter tips based on date range if needed
    const filteredTips = tips.filter(tip => {
      const tipDate = tip.date;
      return tipDate >= dateRange.start && tipDate <= dateRange.end;
    });
    
    // Generate response based on analysis
    let response = '';
    
    switch (analysis.type) {
      case 'total':
        if (filteredTips.length === 0) {
          response = `I don't see any tips for the specified time period.`;
        } else {
          const total = filteredTips.reduce((sum, tip) => sum + tip.amount, 0);
          response = `Your total tips for this period are ${formatCurrency(total)}.`;
        }
        break;
        
      case 'average':
        if (filteredTips.length === 0) {
          response = `I don't see any tips for the specified time period.`;
        } else {
          const total = filteredTips.reduce((sum, tip) => sum + tip.amount, 0);
          const average = total / filteredTips.length;
          response = `Your average tip for this period is ${formatCurrency(average)} (across ${filteredTips.length} days).`;
        }
        break;
        
      case 'best':
        if (filteredTips.length === 0) {
          response = `I don't see any tips for the specified time period.`;
        } else {
          const bestTip = filteredTips.reduce((best, tip) => 
            tip.amount > best.amount ? tip : best, filteredTips[0]);
          response = `Your best day was ${bestTip.date} with ${formatCurrency(bestTip.amount)}.`;
        }
        break;
        
      case 'worst':
        if (filteredTips.length === 0) {
          response = `I don't see any tips for the specified time period.`;
        } else {
          const worstTip = filteredTips.reduce((worst, tip) => 
            tip.amount < worst.amount ? tip : worst, filteredTips[0]);
          response = `Your lowest tip day was ${worstTip.date} with ${formatCurrency(worstTip.amount)}.`;
        }
        break;
        
      case 'trend':
        if (filteredTips.length < 7) {
          response = `I need at least a week of data to analyze trends. Please add more tips.`;
        } else {
          // Simple trend analysis
          const sortedTips = [...filteredTips].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime());
          
          const firstWeekAvg = sortedTips.slice(0, 7)
            .reduce((sum, tip) => sum + tip.amount, 0) / 7;
          const lastWeekAvg = sortedTips.slice(-7)
            .reduce((sum, tip) => sum + tip.amount, 0) / 7;
          
          const percentChange = ((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100;
          
          if (percentChange > 10) {
            response = `Your tips are trending up! You've seen a ${percentChange.toFixed(1)}% increase comparing your most recent week to your earliest week in this period.`;
          } else if (percentChange < -10) {
            response = `Your tips are trending down. You've seen a ${Math.abs(percentChange).toFixed(1)}% decrease comparing your most recent week to your earliest week in this period.`;
          } else {
            response = `Your tips have been relatively stable (${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}% change) comparing your most recent week to your earliest week in this period.`;
          }
        }
        break;
        
      case 'predict':
        if (filteredTips.length < 14) {
          response = `I need at least two weeks of data to make predictions. Please add more tips.`;
        } else {
          // Simple prediction based on average
          const avgDaily = filteredTips.reduce((sum, tip) => sum + tip.amount, 0) / filteredTips.length;
          const monthlyPrediction = avgDaily * 30;
          const yearlyPrediction = avgDaily * 365;
          
          response = `Based on your tip history, I predict you'll earn approximately ${formatCurrency(monthlyPrediction)} per month and ${formatCurrency(yearlyPrediction)} per year.`;
        }
        break;
        
      default:
        // General response
        const total = tips.reduce((sum, tip) => sum + tip.amount, 0);
        const average = total / tips.length;
        response = `You have recorded ${tips.length} days of tips, with a total of ${formatCurrency(total)} and an average of ${formatCurrency(average)} per day. What would you like to know about your tips?`;
        break;
    }
    
    // In a production environment, we would use Google Cloud AI API here
    // For now, we'll just return our generated response
    return NextResponse.json({ response });
    
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
} 