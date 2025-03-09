// This file provides utilities for interacting with Polar.sh
// It's a simplified implementation - for a more robust solution, use the official Polar.sh SDK

/**
 * Initialize Polar.sh checkout
 * @param publicKey Your Polar.sh public key
 * @returns A Polar object with methods to interact with Polar.sh
 */
export function initPolar(publicKey: string) {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return {
      redirectToCheckout: async () => {
        throw new Error('Polar.sh checkout can only be used in browser environment');
      }
    };
  }

  // Load the Polar.sh SDK script if it's not already loaded
  const loadPolarScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.Polar) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.polar.sh/v1/polar.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Polar.sh SDK'));
      document.body.appendChild(script);
    });
  };

  return {
    /**
     * Redirect to Polar.sh checkout
     * @param sessionId The checkout session ID from your backend
     */
    redirectToCheckout: async (sessionId: string) => {
      try {
        await loadPolarScript();
        
        if (!window.Polar) {
          throw new Error('Polar.sh SDK failed to initialize');
        }
        
        const polar = new window.Polar(publicKey);
        return polar.redirectToCheckout(sessionId);
      } catch (error) {
        console.error('Error redirecting to Polar.sh checkout:', error);
        throw error;
      }
    }
  };
}

// Add TypeScript definitions for the Polar.sh SDK
declare global {
  interface Window {
    Polar: any;
  }
} 