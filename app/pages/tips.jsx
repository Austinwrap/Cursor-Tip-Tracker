'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase, addTip, getUserTips, isBrowser } from '../lib/supabaseClient';
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
  AlertDescription,
  Input,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Divider,
  List,
  ListItem
} from '@chakra-ui/react';
import 'react-calendar/dist/Calendar.css';
import '../styles/calendar-custom.css';

export default function TipsPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const toast = useToast();
  
  const [tips, setTips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tipAmount, setTipAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const tipInputRef = useRef(null);
  
  // Stats
  const [totalTips, setTotalTips] = useState(0);
  const [averageTip, setAverageTip] = useState(0);
  const [recentTips, setRecentTips] = useState([]);
  
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
        
        // Calculate stats
        if (data && data.length > 0) {
          // Total tips
          const total = data.reduce((sum, tip) => sum + Number(tip.amount), 0);
          setTotalTips(total);
          
          // Average tip
          setAverageTip(total / data.length);
          
          // Recent tips (last 5)
          const sortedTips = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
          setRecentTips(sortedTips.slice(0, 5));
        }
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
    setTipAmount(''); // Clear previous amount
    
    // Focus the tip input after a short delay to allow UI to update
    setTimeout(() => {
      if (tipInputRef.current) {
        tipInputRef.current.focus();
      }
    }, 100);
  };
  
  // Handle modal open
  const handleOpenModal = () => {
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
    
    if (!selectedDate) {
      toast({
        title: 'No date selected',
        description: 'Please select a date on the calendar',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const formattedDate = selectedDate instanceof Date 
        ? selectedDate.toISOString().split('T')[0] 
        : selectedDate;
      
      console.log('Saving tip:', { userId: user.id, date: formattedDate, amount: tipAmount });
      
      const { error } = await addTip(user.id, formattedDate, tipAmount);
      
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
          description: `$${tipAmount} has been saved for ${selectedDate.toLocaleDateString()}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Clear input and reload tips
        setTipAmount('');
        handleTipSaved();
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
        backgroundColor: '#3a4d3a', 
        color: '#aaffaa',
        borderRadius: '4px',
        marginTop: '2px',
        fontWeight: '500'
      }}>
        ${Number(amount).toFixed(2)}
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
  
  return (
    <Container maxW="container.xl" py={8} bg="#1a1a1a" color="#e0e0e0">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading as="h1" size="xl" color="#aaffaa">
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
        
        <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={6}>
          {/* Left Column - Calendar and Tip Entry */}
          <GridItem>
            <VStack spacing={4} align="stretch">
              <Box 
                borderWidth="1px" 
                borderRadius="lg" 
                p={4} 
                boxShadow="0 2px 10px rgba(0, 0, 0, 0.5)"
                bg="#2a2a2a"
                borderColor="#4d4d4d"
              >
                <Calendar 
                  onClickDay={handleDayClick}
                  tileContent={tileContent}
                  className="react-calendar"
                  value={selectedDate}
                />
              </Box>
              
              <Box 
                borderWidth="1px" 
                borderRadius="lg" 
                p={4} 
                boxShadow="0 2px 10px rgba(0, 0, 0, 0.5)"
                bg="#2a2a2a"
                borderColor="#4d4d4d"
              >
                <form onSubmit={handleSaveTip}>
                  <VStack spacing={4}>
                    <Heading size="md" color="#aaffaa">
                      Add Tip for {selectedDate.toLocaleDateString()}
                    </Heading>
                    
                    <HStack width="100%">
                      <FormControl isRequired>
                        <Input
                          ref={tipInputRef}
                          type="number"
                          value={tipAmount}
                          onChange={(e) => setTipAmount(e.target.value)}
                          placeholder="Enter tip amount"
                          min="0"
                          step="0.01"
                          bg="#333"
                          borderColor="#4d4d4d"
                          _hover={{ borderColor: "#aaffaa" }}
                          _focus={{ borderColor: "#aaffaa", boxShadow: "0 0 0 1px #aaffaa" }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveTip(e);
                            }
                          }}
                        />
                      </FormControl>
                      
                      <Button 
                        colorScheme="green" 
                        type="submit" 
                        isLoading={isSaving}
                        bg="#4CAF50"
                        _hover={{ bg: "#45a049" }}
                      >
                        Save Tip
                      </Button>
                    </HStack>
                    
                    <Text fontSize="sm" color="#aaffaa">
                      Click on any day in the calendar to select a different date
                    </Text>
                  </VStack>
                </form>
              </Box>
            </VStack>
          </GridItem>
          
          {/* Right Column - Stats and Recent Tips */}
          <GridItem>
            <VStack spacing={4} align="stretch">
              <Box 
                borderWidth="1px" 
                borderRadius="lg" 
                p={4} 
                boxShadow="0 2px 10px rgba(0, 0, 0, 0.5)"
                bg="#2a2a2a"
                borderColor="#4d4d4d"
              >
                <Heading size="md" mb={4} color="#aaffaa">
                  Your Tip Stats
                </Heading>
                
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Stat>
                    <StatLabel color="#e0e0e0">Total Tips</StatLabel>
                    <StatNumber color="#aaffaa">${totalTips.toFixed(2)}</StatNumber>
                    <StatHelpText>{tips.length} entries</StatHelpText>
                  </Stat>
                  
                  <Stat>
                    <StatLabel color="#e0e0e0">Average Tip</StatLabel>
                    <StatNumber color="#aaffaa">${averageTip.toFixed(2)}</StatNumber>
                    <StatHelpText>per entry</StatHelpText>
                  </Stat>
                </Grid>
              </Box>
              
              <Box 
                borderWidth="1px" 
                borderRadius="lg" 
                p={4} 
                boxShadow="0 2px 10px rgba(0, 0, 0, 0.5)"
                bg="#2a2a2a"
                borderColor="#4d4d4d"
              >
                <Heading size="md" mb={4} color="#aaffaa">
                  Recent Tips
                </Heading>
                
                {recentTips.length > 0 ? (
                  <List spacing={2}>
                    {recentTips.map((tip, index) => (
                      <ListItem key={index} p={2} borderRadius="md" bg="#333">
                        <Flex justify="space-between">
                          <Text>{new Date(tip.date).toLocaleDateString()}</Text>
                          <Text fontWeight="bold" color="#aaffaa">${Number(tip.amount).toFixed(2)}</Text>
                        </Flex>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Text>No tips recorded yet</Text>
                )}
              </Box>
              
              <Button 
                colorScheme="blue" 
                onClick={handleOpenModal}
                bg="#4CAF50"
                _hover={{ bg: "#45a049" }}
              >
                Advanced Tip Entry
              </Button>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
      
      {isModalOpen && (
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