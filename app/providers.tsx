'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/theme-utils';
import { ReactNode } from 'react';

// Define the theme
const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: '#1a1a1a',
        color: '#e0e0e0',
      },
    },
  },
  colors: {
    brand: {
      50: '#e6ffee',
      100: '#aaffaa',
      500: '#4CAF50',
      600: '#45a049',
      700: '#3a4d3a',
      800: '#2a2a2a',
      900: '#1a1a1a',
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
} 