import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => api.search(query),
    enabled: query.trim().length > 0,
  });
}
