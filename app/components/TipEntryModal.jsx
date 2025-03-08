'use client';

import { useState } from 'react';
import styles from './TipEntryModal.module.css';
import { supabase } from '../lib/supabaseClient';

export default function TipEntryModal({ isOpen, onClose, date, userId, onTipSaved }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  if (!isOpen) return null;
  
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid tip amount');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Save tip to Supabase
      const { data, error: saveError } = await supabase
        .from('tips')
        .insert({
          user_id: userId,
          date: date.toISOString().split('T')[0],
          amount: Number(amount),
          note: note || '',
          type: 'cash'
        })
        .select();
      
      if (saveError) throw new Error(saveError.message);
      
      console.log('Tip saved successfully:', data);
      setSuccess('Tip saved successfully!');
      
      // Clear form
      setAmount('');
      setNote('');
      
      // Wait a moment to show success message before closing
      setTimeout(() => {
        onTipSaved();
        onClose();
      }, 1000);
      
    } catch (err) {
      console.error('Error saving tip:', err);
      setError(`Failed to save tip: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Add Tip for {formattedDate}</h2>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="amount" className={styles.label}>Tip Amount ($)</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter tip amount"
              className={styles.input}
              step="1"
              min="0"
              required
              autoFocus
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="note" className={styles.label}>Note (optional)</label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this tip"
              className={styles.textarea}
            />
          </div>
          
          <div className={styles.buttonGroup}>
            <button 
              type="button" 
              onClick={onClose} 
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.saveButton}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Tip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 