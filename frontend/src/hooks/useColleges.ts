import { useQuery } from '@tanstack/react-query';
import { searchColleges } from '@/services/registration.service';
import { College } from '@/types/registration';

export function useColleges(query: string) {
  const trimmed = query.trim();

  const queryResult = useQuery<College[]>({
    queryKey: ['colleges', trimmed],
    queryFn: () => searchColleges(trimmed),
    enabled: trimmed.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  return {
    colleges: queryResult.data || [],
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    error: queryResult.error,
  };
}
