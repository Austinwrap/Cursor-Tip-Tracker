import '../app/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../app/lib/AuthContext';
import { Analytics } from '@vercel/analytics/react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Analytics />
    </AuthProvider>
  );
}

export default MyApp; 