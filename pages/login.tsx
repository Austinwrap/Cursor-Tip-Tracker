import dynamic from 'next/dynamic';

// Import the Login component from the app directory
const AppLogin = dynamic(() => import('../app/login/page'), {
  ssr: false,
});

export default function LoginPage() {
  return <AppLogin />;
} 