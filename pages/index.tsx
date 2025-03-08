import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the app dashboard
    router.replace('/dashboard');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Cursor Tip Tracker</h1>
        <p className="mb-4">Loading your dashboard...</p>
        <div className="w-12 h-12 border-t-2 border-b-2 border-white rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
} 