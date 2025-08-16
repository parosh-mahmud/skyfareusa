// src/app/providers.jsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // How long a query's data will stay in the cache before being garbage collected
            staleTime: 1000 * 60 * 5, // 5 minutes
            // The number of times a failed query will be retried
            retry: 2,
            // Don't refetch queries on window focus, which can be noisy
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
