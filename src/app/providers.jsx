// src/app/providers.jsx
'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// You can add your Theme and Search contexts here in the future

export default function Providers({ children }) {
  // Sets up the React Query client
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    // This QueryClientProvider is essential for your flight search to work
    <QueryClientProvider client={queryClient}>
        {/* You can wrap other providers like ThemeProvider here later */}
        {children}
    </QueryClientProvider>
  );
}