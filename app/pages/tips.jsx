'use client';

import { useState, useEffect } from 'react';
import { supabase, getUserTips, isBrowser } from '../lib/supabaseClient';
import Calendar from '../components/Calendar';
import TipEntryModal from '../components/TipEntryModal';
import styles from '../styles/Tips.module.css';

export default function TipsPage() {
  const [user, setUser] = useState(null);
  const [tips, setTips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Check for authenticated user
  useEffect(() => {
    // This needs to run only on the client side
    if (isBrowser()) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user || null);
        }
      );
      
      // Get initial auth state
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user || null);
      });
      
      return () => {
        authListener?.subscription.unsubscribe();
      };
    }
  }, []);
  
  // Load tips when user changes
  useEffect(() => {
    if (user) {
      loadTips();
    } else {
      setTips([]);
      setIsLoading(false);
    }
  }, [user]);
  
  // Function to load tips from Supabase
  const loadTips = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Use the simplified getUserTips function
      const { data, error: fetchError } = await getUserTips(user.id);
      
      if (fetchError) throw new Error(fetchError.message);
      
      setTips(data || []);
    } catch (err) {
      console.error('Error loading tips:', err);
      setError('Failed to load your tips. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle day click on calendar
  const handleDayClick = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };
  
  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  // Handle tip saved
  const handleTipSaved = () => {
    loadTips();
  };
  
  if (!user) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Tips Tracker</h1>
        <div className={styles.loginMessage}>
          <p>Please log in to track your tips</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tips Tracker</h1>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      {isLoading ? (
        <div className={styles.loading}>Loading your tips...</div>
      ) : (
        <Calendar 
          tips={tips} 
          onDayClick={handleDayClick} 
        />
      )}
      
      {isModalOpen && (
        <TipEntryModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          date={selectedDate}
          userId={user.id}
          onTipSaved={handleTipSaved}
        />
      )}
    </div>
  );
} 