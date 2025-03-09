'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';
import { getUserTips, isBrowser } from '../lib/supabaseClient';
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
  Center
} from '@chakra-ui/react';
import 'react-calendar/dist/Calendar.css';

export default function TipsPage() {
  const user = useUser();
  const router = useRouter();
  const toast = useToast();
  
  const [tips, setTips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Check if user is logged in
  useEffect(() => {
    if (isBrowser() && !user) {
      router.push('/login');
    } else if (user) {
      loadTips();
    }
  }, [user]);
  
  // Function to load tips from Supabase
  const loadTips = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      console.log('Loading tips for user:', user.id);
      const { data, error } = await getUserTips(user.id);
      
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
    loadTips(); // Reload tips after saving
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
  
  if (!isBrowser()) {
    return null; // Don't render during SSR
  }
  
  if (!user) {
    return (
      <Center h="100vh">
        <Spinner />
      </Center>
    );
  }
  
  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Tip Tracker
        </Heading>
        
        <Text textAlign="center" fontSize="lg">
          Track your tips by clicking on a day in the calendar
        </Text>
        
        {isLoading ? (
          <Center p={10}>
            <Spinner size="xl" />
          </Center>
        ) : (
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
        )}
        
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