import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import fs from 'fs';
import path from 'path';

// Google Cloud AI API integration
// This uses the service account key file you already have
const GOOGLE_APPLICATION_CREDENTIALS = path.join(process.cwd(), 'tip-tracker-453021-6c1b66b9bf5e.json');

// Function to get user's tip data
async function getUserTipData(userId: string) {
  const { data, error } = await supabase
    .from('tips')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
    
  if (error) {
    console.error('Error fetching tip data:', error);
    return [];
  }
  
  return data || [];
}

// Function to analyze the user's question and find relevant tip data
async function analyzeQuestion(question: string, tipData: any[]) {
  // Check for date-related queries
  const dateRegex = /(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}\/\d{4})|(\d{1,2}\/\d{1,2}\/\d{2})|yesterday|today|last week|last month|last year/i;
  const dateMatch = question.match(dateRegex);
  
  let response = '';
  
  // Handle date-specific queries
  if (dateMatch) {
    let targetDate;
    const match = dateMatch[0];
    
    if (match === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      targetDate = yesterday.toISOString().split('T')[0];
    } else if (match === 'today') {
      targetDate = new Date().toISOString().split('T')[0];
    } else if (match === 'last year') {
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      
      // Find tips from around the same time last year
      const monthDay = new Date().toISOString().split('T')[0].substring(5); // Get MM-DD
      const lastYearPrefix = lastYear.getFullYear().toString();
      
      const lastYearTips = tipData.filter(tip => 
        tip.date.startsWith(lastYearPrefix)
      );
      
      if (lastYearTips.length > 0) {
        const totalLastYear = lastYearTips.reduce((sum, tip) => sum + tip.amount, 0) / 100;
        return `Last year, you made a total of $${totalLastYear.toFixed(2)} in tips. Would you like to see a breakdown by month?`;
      } else {
        return "I don't see any tip data from last year. Would you like to see your most recent tips instead?";
      }
    } else {
      // Try to parse the date
      try {
        targetDate = new Date(match).toISOString().split('T')[0];
      } catch (e) {
        return `I'm having trouble understanding the date "${match}". Could you try formatting it as YYYY-MM-DD?`;
      }
    }
    
    // Find the tip for the target date
    const tipForDate = tipData.find(tip => tip.date === targetDate);
    
    if (tipForDate) {
      const amount = (tipForDate.amount / 100).toFixed(2);
      response = `On ${targetDate}, you made $${amount} in tips.`;
    } else {
      response = `I don't have any tip data for ${targetDate}. Would you like to see your most recent tips instead?`;
    }
  } 
  // Handle general analytics queries
  else if (question.includes('average') || question.includes('avg')) {
    if (tipData.length === 0) {
      return "You don't have any tip data yet. Start tracking your tips to see analytics!";
    }
    
    const total = tipData.reduce((sum, tip) => sum + tip.amount, 0);
    const average = total / tipData.length / 100;
    response = `Your average tip amount is $${average.toFixed(2)} across ${tipData.length} recorded shifts.`;
  }
  // Handle "best day" queries
  else if (question.includes('best day') || question.includes('highest tip')) {
    if (tipData.length === 0) {
      return "You don't have any tip data yet. Start tracking your tips to see your best days!";
    }
    
    const bestTip = tipData.reduce((best, tip) => tip.amount > best.amount ? tip : best, tipData[0]);
    const amount = (bestTip.amount / 100).toFixed(2);
    response = `Your best day was ${bestTip.date} when you made $${amount} in tips!`;
  }
  // Handle recent tips queries
  else if (question.includes('recent') || question.includes('latest')) {
    if (tipData.length === 0) {
      return "You don't have any tip data yet. Start tracking your tips to see your history!";
    }
    
    const recentTips = tipData.slice(0, 5);
    response = "Here are your most recent tips:\n";
    recentTips.forEach(tip => {
      response += `${tip.date}: $${(tip.amount / 100).toFixed(2)}\n`;
    });
  }
  // Default response for other queries
  else {
    response = "I can help you analyze your tip data. Try asking about specific dates, your average tips, your best day, or your recent tips.";
  }
  
  return response;
}

export async function POST(request: Request) {
  try {
    // Check if the user is authenticated and on the paid tier
    // This would normally be done with a middleware or auth check
    const { message, userId, isPaid } = await request.json();
    
    if (!isPaid) {
      return NextResponse.json({
        response: "This feature is only available to premium subscribers. Please upgrade to access AI chat features.",
        isPaidFeature: true
      }, { status: 403 });
    }
    
    if (!userId) {
      return NextResponse.json({
        response: "You must be logged in to use this feature.",
        error: "Not authenticated"
      }, { status: 401 });
    }
    
    // Get the user's tip data
    const tipData = await getUserTipData(userId);
    
    // Analyze the question and generate a response
    const response = await analyzeQuestion(message, tipData);
    
    // In a production app, you would use Google Cloud's AI API here
    // For now, we're using a simpler approach to avoid unnecessary API calls
    
    /*
    // This is how you would use Google Cloud's AI API
    // Requires installing: npm install @google-cloud/vertexai
    
    const { VertexAI } = require('@google-cloud/vertexai');
    
    // Initialize Vertex with your project and location
    const vertex_ai = new VertexAI({
      project: 'tip-tracker-453021',
      location: 'us-central1',
    });
    
    const model = 'gemini-pro';
    const generativeModel = vertex_ai.preview.getGenerativeModel({
      model: model,
      generation_config: {
        max_output_tokens: 256,
        temperature: 0.2,
        top_p: 0.8,
        top_k: 40,
      },
    });
    
    const tipDataContext = JSON.stringify(tipData);
    const prompt = `
      You are a helpful assistant for a tip tracking app. The user is asking: "${message}"
      
      Here is their tip data: ${tipDataContext}
      
      Provide a helpful, concise response about their tips based on their question.
      If they ask about a specific date, tell them how much they made that day.
      If they ask about averages or trends, analyze their data and provide insights.
      Always be friendly and professional.
    `;
    
    const result = await generativeModel.generateContent(prompt);
    const response = result.response.text();
    */
    
    return NextResponse.json({ response });
    
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { error: 'Error processing your request' },
      { status: 500 }
    );
  }
} 