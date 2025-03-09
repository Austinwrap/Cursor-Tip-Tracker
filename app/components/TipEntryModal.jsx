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
  VStack
} from '@chakra-ui/react';

export default function TipEntryModal({ isOpen, onClose, date, userId, onTipSaved }) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Super simple submit handler - just save the number!
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
    
    try {
      console.log('Submitting tip:', { amount, date, userId });
      
      // Call the simplified addTip function
      const { error } = await addTip(userId, date, amount);
      
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
        // Success!
        toast({
          title: 'Tip saved!',
          description: `$${amount} has been saved for ${date.toLocaleDateString()}`,
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
        <ModalHeader>Add Tip for {date?.toLocaleDateString()}</ModalHeader>
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