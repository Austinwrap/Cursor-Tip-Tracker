'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { 
  Box, 
  Container, 
  Heading, 
  FormControl, 
  FormLabel, 
  Input, 
  Button, 
  Text, 
  VStack,
  Alert,
  AlertIcon,
  Link
} from '@chakra-ui/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simple validation
      if (!email || !password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }

      console.log('Attempting to sign in with:', email);
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        setError(error.message || 'Failed to sign in');
      } else {
        console.log('Login successful:', data);
        // Redirect to tips page on success
        router.push('/pages/tips');
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes, let's add a quick login function
  const handleQuickLogin = async () => {
    setEmail('demo@example.com');
    setPassword('password123');
    
    setLoading(true);
    setError('');

    try {
      console.log('Attempting quick login with demo account');
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'demo@example.com',
        password: 'password123'
      });

      if (error) {
        console.error('Demo login error:', error);
        setError('Demo account login failed. Try creating an account instead.');
      } else {
        console.log('Demo login successful:', data);
        // Redirect to tips page on success
        router.push('/pages/tips');
      }
    } catch (err) {
      console.error('Unexpected error during demo login:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes, let's add a quick signup function
  const handleQuickSignup = async () => {
    setLoading(true);
    setError('');

    const demoEmail = `demo${Math.floor(Math.random() * 10000)}@example.com`;
    const demoPassword = 'password123';

    try {
      console.log('Creating demo account:', demoEmail);
      
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword
      });

      if (error) {
        console.error('Demo signup error:', error);
        setError(error.message || 'Failed to create demo account');
      } else {
        console.log('Demo signup successful:', data);
        setEmail(demoEmail);
        setPassword(demoPassword);
        
        // If auto-confirmation is enabled, sign in immediately
        if (data.session) {
          router.push('/pages/tips');
        } else {
          setError('Demo account created! In a real app, you would need to confirm your email.');
        }
      }
    } catch (err) {
      console.error('Unexpected error during demo signup:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Tip Tracker Login
        </Heading>
        
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        <Box borderWidth="1px" borderRadius="lg" p={6} boxShadow="md" bg="white">
          <form onSubmit={handleLogin}>
            <VStack spacing={4} align="stretch">
              <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </FormControl>
              
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </FormControl>
              
              <Button 
                colorScheme="blue" 
                type="submit" 
                isLoading={loading}
                loadingText="Signing In"
                width="100%"
              >
                Sign In
              </Button>
            </VStack>
          </form>
        </Box>
        
        <VStack spacing={4}>
          <Text textAlign="center">
            Don't have an account? Use one of these options:
          </Text>
          
          <Button 
            colorScheme="green" 
            onClick={handleQuickLogin}
            isLoading={loading}
            width="100%"
          >
            Quick Login (Demo Account)
          </Button>
          
          <Button 
            colorScheme="purple" 
            onClick={handleQuickSignup}
            isLoading={loading}
            width="100%"
          >
            Create Demo Account
          </Button>
        </VStack>
      </VStack>
    </Container>
  );
} 