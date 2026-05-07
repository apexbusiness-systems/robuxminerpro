import { QueryClient } from '@tanstack/react-query';
import { get } from './api';

export const PREFETCH_STALE_TIME = 1000 * 60 * 5; // 5 minutes

export const prefetchRouteData = (queryClient: QueryClient, path: string) => {
  if (path === '/dashboard') {
    queryClient.prefetchQuery({
      queryKey: ['earnings', 'session', 'active'],
      queryFn: () => get('/earnings/session/active'),
      staleTime: PREFETCH_STALE_TIME
    });
    queryClient.prefetchQuery({
      queryKey: ['earnings', 'streak'],
      queryFn: () => get('/earnings/streak'),
      staleTime: PREFETCH_STALE_TIME
    });
  } else if (path === '/learn') {
    queryClient.prefetchQuery({
      queryKey: ['learning-paths'],
      queryFn: () => get('/learning-paths'),
      staleTime: PREFETCH_STALE_TIME
    });
  } else if (path === '/mentor') {
    // maybe prefetch agent profiles if needed
  }
};
