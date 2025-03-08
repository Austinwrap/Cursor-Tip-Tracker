import dynamic from 'next/dynamic';

// Import the Analytics component from the app directory
const AppAnalytics = dynamic(() => import('../app/analytics/page'), {
  ssr: false,
});

export default function AnalyticsPage() {
  return <AppAnalytics />;
} 