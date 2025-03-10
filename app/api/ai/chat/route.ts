import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, tips } = await request.json();
    
    // Mock AI response based on the message
    let response = '';
    
    if (message.toLowerCase().includes('best day')) {
      response = "Based on your tip history, your best day appears to be Friday. You might want to consider picking up more Friday shifts if possible.";
    } else if (message.toLowerCase().includes('average')) {
      response = "Your average tip amount is approximately $85 per shift. This is about 15% higher than the typical average in your area.";
    } else if (message.toLowerCase().includes('improve') || message.toLowerCase().includes('increase')) {
      response = "To improve your tips, consider working during peak hours (6-9pm), focusing on providing personalized service, and building rapport with regular customers.";
    } else if (message.toLowerCase().includes('trend') || message.toLowerCase().includes('pattern')) {
      response = "I've noticed your tips tend to be higher on weekends and during evening shifts. There's also a positive correlation with holidays and special events.";
    } else {
      response = "I'm your AI tip assistant. I can analyze your tip data and provide insights on patterns, best days, averages, and suggestions for improvement. What would you like to know?";
    }
    
    // Add a small delay to simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error processing AI chat:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
} 