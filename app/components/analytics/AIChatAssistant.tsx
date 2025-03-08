'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/app/lib/AuthContext';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

// Sample AI responses for development
const sampleResponses = [
  "Based on your tip history, your best day was Friday, March 15th when you made $245.00 in tips!",
  "Looking at your data, I can see that Fridays and Saturdays are your most profitable days, averaging $178.50 per shift.",
  "Your tips have increased by 12% compared to last month. Great job!",
  "I notice you've been working more weekday shifts lately. Did you know your weekend shifts average 35% higher tips?",
  "Based on your current trends, I project you'll earn approximately $2,450 in tips next month.",
  "Your highest earning period is typically the last week of the month, with an average of $210 per day.",
  "If you worked one additional Saturday shift per month, you could increase your monthly earnings by approximately $185.",
  "Your tips are 22% higher on rainy days compared to sunny days. Interesting weather pattern!",
  "Looking at your year-to-date earnings, you're on track to make $24,800 in tips this year.",
  "I've analyzed your data and found that evening shifts (5pm-close) earn 40% more than morning shifts."
];

const AIChatAssistant: React.FC = () => {
  const { user, isPaid, devMode } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi there! I\'m your AI assistant. Ask me anything about your tips and earnings!',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "What was my best tipping day last month?",
    "Which day of the week is most profitable for me?",
    "How have my tips changed compared to last month?",
    "What are my projected earnings for next month?",
    "How can I increase my monthly earnings?"
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !user) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          userId: user.id,
          devMode: devMode
        }),
      });
      
      const data = await response.json();
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  // For free users, show a premium teaser
  if (!isPaid) {
    return (
      <div className="h-96 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg border border-gray-800 group hover:border-purple-500/50 transition-all duration-300 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
        
        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">💬</div>
        <div className="text-xl font-semibold text-gray-400">AI Chat Assistant</div>
        <p className="text-sm text-gray-500 mt-2 text-center max-w-xs px-6">
          Chat with our AI assistant about your tips and earnings. Get personalized insights and answers to your questions.
        </p>
        
        <div className="mt-6 bg-black/30 rounded-lg p-4 w-4/5 max-w-md">
          <div className="flex items-start mb-4 opacity-50">
            <div className="bg-purple-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-white text-xs">AI</span>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300">
              What was my best tipping day last month?
            </div>
          </div>
          <div className="flex items-start mb-4 opacity-50">
            <div className="bg-purple-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-white text-xs">AI</span>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300">
              Your best day was March 15th when you made $245.00 in tips!
            </div>
          </div>
        </div>
        
        <a 
          href="/upgrade" 
          className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-2 px-6 rounded-full hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg transform hover:scale-105"
        >
          Upgrade to Access
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-xl">
      {/* Chat header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 p-4">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0">
            <span className="text-black font-bold text-sm">AI</span>
          </div>
          <div>
            <h3 className="font-bold text-white">TipTracker AI Assistant</h3>
            <p className="text-xs text-gray-400">Powered by Google Cloud AI</p>
          </div>
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-900 to-black">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex items-start ${message.sender === 'user' ? 'justify-end' : ''}`}
          >
            {message.sender === 'ai' && (
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-black font-bold text-xs">AI</span>
              </div>
            )}
            
            <div 
              className={`rounded-lg p-3 max-w-[80%] shadow-md ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 border border-gray-700'
              }`}
            >
              {message.text.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < message.text.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
              <div className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            {message.sender === 'user' && (
              <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center ml-3 flex-shrink-0">
                <span className="text-white text-xs">You</span>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-black font-bold text-xs">AI</span>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-gray-300 border border-gray-700 shadow-md">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 py-2 bg-gray-900 border-t border-gray-800 overflow-x-auto whitespace-nowrap">
          <div className="flex space-x-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm hover:bg-gray-700 transition-colors whitespace-nowrap border border-gray-700"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input area */}
      <div className="border-t border-gray-700 p-4 bg-gray-900">
        <div className="flex">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your tips and earnings..."
            className="flex-grow bg-gray-800 border border-gray-700 rounded-l-lg px-4 py-2 text-white resize-none focus:outline-none focus:border-yellow-500 transition-colors"
            rows={1}
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className={`bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-4 py-2 rounded-r-lg transition-colors font-bold ${
              isLoading || !inputValue.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:from-yellow-400 hover:to-yellow-500'
            }`}
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
};

export default AIChatAssistant; 