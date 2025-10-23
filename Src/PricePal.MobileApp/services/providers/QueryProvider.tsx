// providers/QueryProvider.tsx
import NetInfo from '@react-native-community/netinfo';
import { QueryClient, QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import React from 'react';

import { AppState } from 'react-native';

// Configure online manager for React Native
onlineManager.setEventListener(setOnline => {
  return NetInfo.addEventListener(state => {
    setOnline(!!state.isConnected);
  });
});

// Configure focus manager for React Native
focusManager.setEventListener(handleFocus => {
  const subscription = AppState.addEventListener('change', state => {
    handleFocus(state === 'active');
  });

  return () => {
    subscription.remove();
  };
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Cache configuration
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      
      // Refetch configuration
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      
      // Network mode
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Export for manual cache management
export { queryClient };
