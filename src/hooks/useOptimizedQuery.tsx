
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

interface OptimizedQueryOptions<TData, TError = Error> extends UseQueryOptions<TData, TError> {
  enableBackground?: boolean;
  cacheDuration?: number;
}

export function useOptimizedQuery<TData, TError = Error>(
  options: OptimizedQueryOptions<TData, TError>
) {
  const {
    enableBackground = true,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    ...queryOptions
  } = options;

  return useQuery({
    ...queryOptions,
    staleTime: cacheDuration,
    gcTime: cacheDuration * 2, // Keep in cache for twice the stale time
    refetchOnWindowFocus: enableBackground,
    refetchOnReconnect: enableBackground,
    refetchOnMount: false, // Don't refetch on mount if data is fresh
  });
}
