'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase, addTip, getUserTips, isBrowser } from '../lib/supabaseClient';
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
  AlertDescription,
  Input,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Flex,
  List,
  ListItem
} from '@chakra-ui/react';

export default function TipsPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const toast = useToast();
  
  const [tips, setTips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tipDate, setTipDate] = useState(new Date().toISOString().split('T')[0]);
  const [tipAmount, setTipAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const tipInputRef = useRef(null);
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  
  // Check if user is logged in - for website
  useEffect(() => {
    // This needs to run only in the browser
    if (!isBrowser()) return;
    
    const checkUser = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('User is logged in:', session.user);
          setUser(session.user);
          loadTips(session.user.id);
        } else {
          console.log('No user logged in');
          setIsLoading(false);
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
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Generate calendar days when month changes or tips are loaded
  useEffect(() => {
    generateCalendarDays();
  }, [currentMonth, tips]);
  
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
  
  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Add day labels
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
      days.push({
        type: 'label',
        text: day
      });
    });
    
    // Add empty slots for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push({
        type: 'empty'
      });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTips = tips.filter(tip => tip.date === dateStr);
      
      let tipTotal = 0;
      if (dayTips.length > 0) {
        tipTotal = dayTips.reduce((sum, tip) => sum + Number(tip.amount), 0);
      }
      
      days.push({
        type: 'day',
        day: day,
        date: dateStr,
        hasTip: dayTips.length > 0,
        tipAmount: tipTotal
      });
    }
    
    setCalendarDays(days);
  };
  
  // Handle day click on calendar
  const handleDayClick = (date) => {
    setTipDate(date);
    setTipAmount('');
    
    // Focus the tip input after a short delay
    setTimeout(() => {
      if (tipInputRef.current) {
        tipInputRef.current.focus();
      }
    }, 100);
  };
  
  // Handle previous month
  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };
  
  // Handle next month
  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };
  
  // Handle direct tip save
  const handleSaveTip = async (e) => {
    e.preventDefault();
    
    if (!tipAmount || isNaN(Number(tipAmount)) || Number(tipAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid tip amount',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!tipDate) {
      toast({
        title: 'No date selected',
        description: 'Please select a date',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      console.log('Saving tip:', { userId: user.id, date: tipDate, amount: tipAmount });
      
      const { error } = await addTip(user.id, tipDate, tipAmount);
      
      if (error) {
        console.error('Error saving tip:', error);
        toast({
          title: 'Error saving tip',
          description: error.message || 'Please try again',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Tip saved!',
          description: `$${tipAmount} has been saved for ${new Date(tipDate).toLocaleDateString()}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Clear input and reload tips
        setTipAmount('');
        if (user) {
          loadTips(user.id);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: 'Unexpected error',
        description: err.message || 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
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
  
  // Handle demo login - for website
  const handleDemoLogin = async () => {
    try {
      setIsLoading(true);
      
      // Create a random demo account for testing
      const demoEmail = `demo${Math.floor(Math.random() * 10000)}@example.com`;
      const demoPassword = 'password123';
      
      console.log('Creating demo account:', demoEmail);
      
      // Sign up with Supabase
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword
      });
      
      if (signUpError) {
        console.error('Demo signup error:', signUpError);
        toast({
          title: 'Error creating demo account',
          description: signUpError.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }
      
      console.log('Demo signup response:', signUpData);
      
      // If we got a session, we're already logged in
      if (signUpData.session) {
        console.log('Demo account created and logged in:', signUpData.user);
        toast({
          title: 'Demo account created',
          description: 'You are now logged in with a demo account',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Otherwise, try to sign in with the demo credentials
      console.log('Signing in with demo account');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword
      });
      
      if (signInError) {
        console.error('Demo login error:', signInError);
        toast({
          title: 'Login failed',
          description: signInError.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        console.log('Demo login successful:', signInData);
        toast({
          title: 'Logged in',
          description: 'You are now logged in with a demo account',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Unexpected error during demo login:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Don't render during SSR for Next.js
  if (!isBrowser()) {
    return null;
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
              <AlertTitle>Welcome to Tip Tracker</AlertTitle>
              <AlertDescription>
                Click the button below to create a demo account and start tracking your tips.
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
            isLoading={isLoading}
          >
            Create Demo Account
          </Button>
        </VStack>
      </Container>
    );
  }
  
  // Format month name
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  return (
    <Box 
      fontFamily="'Segoe UI', Arial, sans-serif"
      backgroundColor="#1a1a1a"
      color="#e0e0e0"
      maxWidth="900px"
      margin="20px auto"
      padding="20px"
    >
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading as="h1" size="xl" color="#aaffaa">
            Tip Tracker
          </Heading>
          
          <Button 
            backgroundColor="#4CAF50"
            color="#e0e0e0"
            _hover={{ backgroundColor: "#45a049" }}
            size="sm"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </HStack>
        
        <Grid templateColumns={{ base: "1fr", md: "1fr" }} gap={5}>
          {/* Input Section */}
          <Box
            backgroundColor="#2a2a2a"
            border="1px solid #4d4d4d"
            padding="20px"
            borderRadius="8px"
            boxShadow="0 2px 10px rgba(0, 0, 0, 0.5)"
          >
            <Heading as="h2" size="md" color="#aaffaa" mb={4}>
              Tip Tracker
            </Heading>
            
            <form onSubmit={handleSaveTip}>
              <HStack spacing={4} wrap="wrap">
                <Input
                  type="date"
                  value={tipDate}
                  onChange={(e) => setTipDate(e.target.value)}
                  required
                  backgroundColor="#333"
                  border="1px solid #4d4d4d"
                  color="#e0e0e0"
                  _focus={{
                    outline: "none",
                    borderColor: "#aaffaa",
                    boxShadow: "0 0 5px rgba(170, 255, 170, 0.5)"
                  }}
                  width={{ base: "100%", md: "auto" }}
                />
                
                <Input
                  ref={tipInputRef}
                  type="number"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  placeholder="Enter tip amount"
                  step="0.01"
                  min="0"
                  required
                  backgroundColor="#333"
                  border="1px solid #4d4d4d"
                  color="#e0e0e0"
                  _focus={{
                    outline: "none",
                    borderColor: "#aaffaa",
                    boxShadow: "0 0 5px rgba(170, 255, 170, 0.5)"
                  }}
                  width={{ base: "100%", md: "auto" }}
                />
                
                <Button
                  type="submit"
                  backgroundColor="#4CAF50"
                  color="#e0e0e0"
                  border="none"
                  _hover={{ backgroundColor: "#45a049" }}
                  isLoading={isSaving}
                  width={{ base: "100%", md: "auto" }}
                >
                  Add Tip
                </Button>
              </HStack>
            </form>
          </Box>
          
          {/* Tip List */}
          <Box
            backgroundColor="#2a2a2a"
            border="1px solid #4d4d4d"
            padding="20px"
            borderRadius="8px"
            boxShadow="0 2px 10px rgba(0, 0, 0, 0.5)"
          >
            <Heading as="h3" size="md" color="#aaffaa" mb={4}>
              Tip History
            </Heading>
            
            {tips.length > 0 ? (
              <List spacing={2}>
                {[...tips]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 10)
                  .map((tip, index) => (
                    <ListItem 
                      key={index} 
                      padding="8px 0"
                      borderBottom="1px solid #4d4d4d"
                    >
                      {new Date(tip.date).toLocaleDateString()}: ${Number(tip.amount).toFixed(2)}
                    </ListItem>
                  ))
                }
              </List>
            ) : (
              <Text>No tips recorded yet</Text>
            )}
          </Box>
          
          {/* Calendar View */}
          <Box
            backgroundColor="#2a2a2a"
            border="1px solid #4d4d4d"
            padding="20px"
            borderRadius="8px"
            boxShadow="0 2px 10px rgba(0, 0, 0, 0.5)"
          >
            <HStack justify="space-between" mb={4}>
              <Button
                onClick={handlePrevMonth}
                backgroundColor="#333"
                color="#e0e0e0"
                _hover={{ backgroundColor: "#444" }}
                size="sm"
              >
                &lt; Prev
              </Button>
              
              <Heading as="h3" size="md" color="#aaffaa">
                {monthName}
              </Heading>
              
              <Button
                onClick={handleNextMonth}
                backgroundColor="#333"
                color="#e0e0e0"
                _hover={{ backgroundColor: "#444" }}
                size="sm"
              >
                Next &gt;
              </Button>
            </HStack>
            
            <Grid
              templateColumns="repeat(7, 1fr)"
              gap="8px"
              textAlign="center"
            >
              {calendarDays.map((day, index) => {
                if (day.type === 'label') {
                  return (
                    <Box
                      key={index}
                      fontWeight="bold"
                      color="#aaffaa"
                      p={2}
                    >
                      {day.text}
                    </Box>
                  );
                } else if (day.type === 'empty') {
                  return (
                    <Box
                      key={index}
                      padding="10px"
                      backgroundColor="#333"
                      border="1px solid #4d4d4d"
                      borderRadius="6px"
                      position="relative"
                      minHeight="60px"
                    />
                  );
                } else {
                  return (
                    <Box
                      key={index}
                      padding="10px"
                      backgroundColor={day.hasTip ? "#3a4d3a" : "#333"}
                      border="1px solid #4d4d4d"
                      borderRadius="6px"
                      position="relative"
                      minHeight="60px"
                      transition="transform 0.2s ease, background-color 0.3s ease"
                      _hover={{
                        transform: "scale(1.05)",
                        backgroundColor: "#444"
                      }}
                      onClick={() => handleDayClick(day.date)}
                      cursor="pointer"
                    >
                      <Text>{day.day}</Text>
                      
                      {day.hasTip && (
                        <Text
                          fontSize="11px"
                          color="#aaffaa"
                          fontWeight="500"
                          marginTop="5px"
                          display="block"
                          background="rgba(0, 0, 0, 0.6)"
                          borderRadius="4px"
                          padding="2px 6px"
                        >
                          ${day.tipAmount.toFixed(2)}
                        </Text>
                      )}
                    </Box>
                  );
                }
              })}
            </Grid>
          </Box>
        </Grid>
      </VStack>
    </Box>
  );
} 