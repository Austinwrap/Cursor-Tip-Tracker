'use client';

import { useState } from 'react';
import { addTip } from '../lib/supabaseClient';
import { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  VStack,
  Text,
  Box,
  Code
} from '@chakra-ui/react';

export default function TipEntryModal({ isOpen, onClose, date, userId, onTipSaved }) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const toast = useToast();

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Selected Date';
    
    if (typeof date === 'string') {
      // Try to parse the string date
      try {
        const parsedDate = new Date(date);
        return parsedDate.toLocaleDateString();
      } catch (e) {
        return date;
      }
    }
    
    // If it's a Date object
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    
    // Fallback
    return String(date);
  };

  // ULTRA simple submit handler - just save the number!
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!amount || isNaN(Number(amount))) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid number',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    setDebugInfo('Saving tip...');
    
    try {
      // Log all the information for debugging
      const formattedDate = date instanceof Date 
        ? date.toISOString().split('T')[0] 
        : typeof date === 'string' 
          ? date 
          : new Date().toISOString().split('T')[0];
          
      const debugData = { 
        userId, 
        date: date instanceof Date ? date.toISOString() : date,
        formattedDate,
        amount, 
        numericAmount: Number(amount)
      };
      
      console.log('Submitting tip with data:', debugData);
      setDebugInfo(`Submitting: ${JSON.stringify(debugData, null, 2)}`);
      
      // Call the simplified addTip function
      const { data, error } = await addTip(userId, formattedDate, amount);
      
      if (error) {
        console.error('Error saving tip:', error);
        setDebugInfo(`Error: ${JSON.stringify(error, null, 2)}`);
        toast({
          title: 'Error saving tip',
          description: error.message || 'Please try again',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Success!
        console.log('Tip saved successfully:', data);
        setDebugInfo(`Success: ${JSON.stringify(data, null, 2)}`);
        toast({
          title: 'Tip saved!',
          description: `$${amount} has been saved for ${formatDate(date)}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Reset form and close
        setAmount('');
        onTipSaved();
        onClose();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setDebugInfo(`Exception: ${err.message}`);
      toast({
        title: 'Unexpected error',
        description: err.message || 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Tip for {formatDate(date)}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Amount ($)</FormLabel>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter tip amount"
                  min="0"
                  step="0.01"
                />
              </FormControl>
              
              {debugInfo && (
                <Box 
                  p={2} 
                  bg="gray.100" 
                  borderRadius="md" 
                  fontSize="xs" 
                  fontFamily="monospace"
                  overflowX="auto"
                >
                  <Code whiteSpace="pre-wrap">{debugInfo}</Code>
                </Box>
              )}
              
              <Button 
                colorScheme="blue" 
                type="submit" 
                isLoading={isLoading}
                width="100%"
                mt={4}
              >
                Save Tip
              </Button>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 