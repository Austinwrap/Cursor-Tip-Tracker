'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase, getUserTips, isBrowser } from '../lib/supabaseClient';
import Calendar from 'react-calendar';
import TipEntryModal from '../components/TipEntryModal';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Button, 
  useToast,
  VStack,
  HStack,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import 'react-calendar/dist/Calendar.css';

export default function TipsPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const toast = useToast();
  
  const [tips, setTips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      if (!isBrowser()) return;
      
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('User is logged in:', session.user);
          setUser(session.user);
          loadTips(session.user.id);
        } else {
          console.log('No user logged in, redirecting to login');
          setIsLoading(false);
          // Uncomment to redirect to login
          // router.push('/pages/login');
        }
      } catch (err) {
        console.error('Error checking auth:', err);
        setIsLoading(false);
      }
    };
    
    checkUser();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in:', session.user);
          setUser(session.user);
          loadTips(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setUser(null);
          setTips([]);
          // Uncomment to redirect to login
          // router.push('/pages/login');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Function to load tips from Supabase
  const loadTips = async (userId) => {
    if (!userId) {
      console.error('No user ID provided to loadTips');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Loading tips for user:', userId);
      const { data, error } = await getUserTips(userId);
      
      if (error) {
        console.error('Error loading tips:', error);
        toast({
          title: 'Error loading tips',
          description: error.message || 'Please try again',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        console.log('Tips loaded:', data);
        setTips(data || []);
      }
    } catch (err) {
      console.error('Unexpected error loading tips:', err);
      toast({
        title: 'Error',
        description: 'Failed to load your tips. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
    if (user) {
      loadTips(user.id); // Reload tips after saving
    }
  };
  
  // Function to get tip amount for a specific date
  const getTipForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const tip = tips.find(t => t.date === dateStr);
    return tip ? tip.amount : null;
  };
  
  // Custom tile content for calendar
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const amount = getTipForDate(date);
    if (!amount) return null;
    
    return (
      <div style={{ 
        fontSize: '0.8em', 
        padding: '2px', 
        backgroundColor: '#e6f7ff', 
        borderRadius: '4px',
        marginTop: '2px'
      }}>
        ${amount}
      </div>
    );
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Signed out',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };
  
  // Handle demo login
  const handleDemoLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'demo@example.com',
        password: 'password123'
      });
      
      if (error) {
        console.error('Demo login error:', error);
        toast({
          title: 'Login failed',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        console.log('Demo login successful:', data);
      }
    } catch (err) {
      console.error('Unexpected error during demo login:', err);
    }
  };
  
  if (!isBrowser()) {
    return null; // Don't render during SSR
  }
  
  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }
  
  if (!user) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl" textAlign="center">
            Tip Tracker
          </Heading>
          
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Not logged in</AlertTitle>
              <AlertDescription>
                You need to log in to track your tips.
              </AlertDescription>
            </Box>
          </Alert>
          
          <Button 
            colorScheme="blue" 
            onClick={handleDemoLogin}
            size="lg"
            mx="auto"
            display="block"
            width="200px"
          >
            Use Demo Account
          </Button>
        </VStack>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading as="h1" size="xl">
            Tip Tracker
          </Heading>
          
          <Button 
            colorScheme="red" 
            variant="outline" 
            size="sm"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </HStack>
        
        <Text fontSize="lg">
          Track your tips by clicking on a day in the calendar
        </Text>
        
        <Box 
          borderWidth="1px" 
          borderRadius="lg" 
          p={4} 
          boxShadow="md"
          bg="white"
        >
          <Calendar 
            onClickDay={handleDayClick}
            tileContent={tileContent}
            className="react-calendar"
          />
        </Box>
        
        <HStack justify="center">
          <Button 
            colorScheme="blue" 
            onClick={() => handleDayClick(new Date())}
          >
            Add Today's Tip
          </Button>
        </HStack>
      </VStack>
      
      {isModalOpen && selectedDate && (
        <TipEntryModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          date={selectedDate}
          userId={user.id}
          onTipSaved={handleTipSaved}
        />
      )}
    </Container>
  );
} 