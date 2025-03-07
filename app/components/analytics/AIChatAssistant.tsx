'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/app/lib/AuthContext';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

const AIChatAssistant: React.FC = () => {
  const { user, isPaid } = useAuth();
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
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
      // Call the AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          userId: user?.id,
          isPaid,
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
    <div className="flex flex-col h-96 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex items-start ${message.sender === 'user' ? 'justify-end' : ''}`}
          >
            {message.sender === 'ai' && (
              <div className="bg-purple-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-white text-xs">AI</span>
              </div>
            )}
            
            <div 
              className={`rounded-lg p-3 max-w-[80%] ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              {message.text.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < message.text.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
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
            <div className="bg-purple-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-white text-xs">AI</span>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-gray-300">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your tips and earnings..."
            className="flex-grow bg-gray-800 border border-gray-700 rounded-l-lg px-4 py-2 text-white resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className={`bg-blue-600 text-white px-4 py-2 rounded-r-lg transition-colors ${
              isLoading || !inputValue.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'
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