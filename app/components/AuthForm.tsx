'use client';

import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/navigation';

type AuthFormProps = {
  isSignUp?: boolean;
};

const AuthForm: React.FC<AuthFormProps> = ({ isSignUp = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up flow
        const { error, success } = await signUp(email, password);
        
        if (error) {
          setError(error.message || 'Failed to create account. Please try again.');
        } else if (success) {
          setSuccess('Account created successfully! You may need to verify your email before signing in.');
          // Clear form
          setEmail('');
          setPassword('');
        }
      } else {
        // Sign in flow
        const { error, success } = await signIn(email, password);
        
        if (error) {
          setError(error.message || 'Invalid email or password. Please try again.');
        } else if (success) {
          setSuccess('Signing in...');
          // Router redirect is handled in AuthContext
        }
      }
    } catch (err) {
      setError('Authentication error. Please try again later.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-center text-white tracking-tight">
        {isSignUp ? 'CREATE ACCOUNT' : 'WELCOME BACK'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-900/50 border-l-4 border-red-500 text-white p-3 rounded-sm text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/50 border-l-4 border-green-500 text-white p-3 rounded-sm text-sm">
            {success}
          </div>
        )}
        
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-black border-2 border-gray-700 focus:border-white text-white rounded-sm py-3 px-4 transition-colors"
            placeholder="Email"
          />
        </div>
        
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-black border-2 border-gray-700 focus:border-white text-white rounded-sm py-3 px-4 transition-colors"
            placeholder="Password"
            minLength={6}
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-white text-black font-bold py-3 px-4 rounded-sm hover:bg-gray-200 transition-colors uppercase tracking-wider"
          disabled={loading}
        >
          {loading ? 'PROCESSING...' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
        </button>
      </form>
    </div>
  );
};

export default AuthForm; 