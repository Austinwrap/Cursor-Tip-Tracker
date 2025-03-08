'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import Link from 'next/link';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

// Sample suggestions for the chat
const chatSuggestions = [
  "What was my total for last week?",
  "What's my average tip amount?",
  "What was my best day this month?",
  "How do my tips compare to last month?",
  "What's the trend in my tips over time?"
];

const AIChatAssistant: React.FC = () => {
  const { user, isPaid, devMode } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: Date.now().toString(),
      text: "Hello! I'm your AI tip assistant. How can I help you analyze your tip data today?",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !user) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }
      
      const data = await response.json();
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I'm sorry, I couldn't process your request at this time.",
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error processing your request. Please try again later.",
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pressing Enter to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle clicking on a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  // If user is not premium and not in dev mode, show teaser
  if (!isPaid && !devMode) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-white">AI Chat Assistant</h2>
        <div className="bg-black/40 p-6 rounded-lg border border-gray-800 mb-6">
          <div className="flex items-start space-x-4 mb-4 opacity-50">
            <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs">You</span>
            </div>
            <div className="bg-blue-900/50 rounded-lg p-3 text-white">
              What was my best tipping day last month?
            </div>
          </div>
          <div className="flex items-start space-x-4 opacity-50">
            <div className="bg-purple-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs">AI</span>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-white">
              Your best day was March 15th when you made $245.00 in tips! That's 58% higher than your daily average.
            </div>
          </div>
        </div>
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            Upgrade to premium to chat with our AI assistant about your tip history and get personalized insights.
          </p>
          <Link 
            href="/upgrade" 
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg h-[600px] flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-white">AI Chat Assistant</h2>
      
      {/* Messages container */}
      <div className="flex-grow overflow-y-auto mb-4 pr-2 custom-scrollbar">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-3">
              <div 
                className={`rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' ? 'bg-blue-600' : 'bg-purple-600'
                }`}
              >
                <span className="text-white text-xs">
                  {message.sender === 'user' ? 'You' : 'AI'}
                </span>
              </div>
              <div 
                className={`rounded-lg p-3 ${
                  message.sender === 'user' 
                    ? 'bg-blue-900/50 text-white' 
                    : 'bg-gray-800 text-white'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="bg-purple-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">AI</span>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-white flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Suggestions */}
      <div className="mb-4 flex flex-wrap gap-2">
        {chatSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs py-1 px-3 rounded-full transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
      
      {/* Input area */}
      <div className="flex items-center space-x-2">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your tips..."
          className="flex-grow bg-gray-800 border border-gray-700 focus:border-blue-500 text-white rounded-lg py-2 px-4 resize-none h-12 max-h-32"
          rows={1}
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim()}
          className={`p-2 rounded-lg ${
            isLoading || !inputValue.trim()
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AIChatAssistant; 