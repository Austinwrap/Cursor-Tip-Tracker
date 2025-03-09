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
  Textarea,
  useToast,
  VStack,
  Text,
  Box,
  Code,
  HStack,
  Select
} from '@chakra-ui/react';

export default function TipEntryModal({ isOpen, onClose, date, userId, onTipSaved }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [tipType, setTipType] = useState('cash');
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

  // Advanced submit handler with additional fields
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid tip amount',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    setDebugInfo('Saving tip...');
    
    try {
      // Format the date as YYYY-MM-DD
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
        numericAmount: Number(amount),
        note,
        tipType
      };
      
      console.log('Submitting tip with data:', debugData);
      setDebugInfo(`Submitting: ${JSON.stringify(debugData, null, 2)}`);
      
      // Call the addTip function
      const { data, error } = await addTip(userId, formattedDate, amount, note, tipType);
      
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
        setNote('');
        setTipType('cash');
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
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay backdropFilter="blur(3px)" />
      <ModalContent bg="#2a2a2a" color="#e0e0e0" borderColor="#4d4d4d">
        <ModalHeader color="#aaffaa">Advanced Tip Entry for {formatDate(date)}</ModalHeader>
        <ModalCloseButton color="#e0e0e0" />
        <ModalBody pb={6}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel color="#e0e0e0">Amount ($)</FormLabel>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter tip amount"
                  min="0"
                  step="0.01"
                  bg="#333"
                  borderColor="#4d4d4d"
                  _hover={{ borderColor: "#aaffaa" }}
                  _focus={{ borderColor: "#aaffaa", boxShadow: "0 0 0 1px #aaffaa" }}
                  autoFocus
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color="#e0e0e0">Tip Type</FormLabel>
                <Select 
                  value={tipType}
                  onChange={(e) => setTipType(e.target.value)}
                  bg="#333"
                  borderColor="#4d4d4d"
                  _hover={{ borderColor: "#aaffaa" }}
                  _focus={{ borderColor: "#aaffaa", boxShadow: "0 0 0 1px #aaffaa" }}
                >
                  <option value="cash">Cash</option>
                  <option value="credit">Credit Card</option>
                  <option value="digital">Digital Payment</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel color="#e0e0e0">Notes (optional)</FormLabel>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add any notes about this tip"
                  bg="#333"
                  borderColor="#4d4d4d"
                  _hover={{ borderColor: "#aaffaa" }}
                  _focus={{ borderColor: "#aaffaa", boxShadow: "0 0 0 1px #aaffaa" }}
                  rows={3}
                />
              </FormControl>
              
              {debugInfo && (
                <Box 
                  p={2} 
                  bg="#1a1a1a" 
                  borderRadius="md" 
                  fontSize="xs" 
                  fontFamily="monospace"
                  overflowX="auto"
                >
                  <Code whiteSpace="pre-wrap" bg="transparent" color="#aaffaa">{debugInfo}</Code>
                </Box>
              )}
              
              <HStack spacing={4} justify="flex-end">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  borderColor="#4d4d4d"
                  color="#e0e0e0"
                  _hover={{ bg: "#444" }}
                >
                  Cancel
                </Button>
                
                <Button 
                  colorScheme="green" 
                  type="submit" 
                  isLoading={isLoading}
                  bg="#4CAF50"
                  _hover={{ bg: "#45a049" }}
                >
                  Save Tip
                </Button>
              </HStack>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 