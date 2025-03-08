import dynamic from 'next/dynamic';

// Import the Upgrade component from the app directory
const AppUpgrade = dynamic(() => import('../app/upgrade/page'), {
  ssr: false,
});

export default function UpgradePage() {
  return <AppUpgrade />;
} 