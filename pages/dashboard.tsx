import dynamic from 'next/dynamic';

// Import the Dashboard component from the app directory
const AppDashboard = dynamic(() => import('../app/dashboard/page'), {
  ssr: false,
});

export default function DashboardPage() {
  return <AppDashboard />;
} 