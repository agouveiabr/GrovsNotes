import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useDevLogs(params?: { repo?: string; branch?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ['devLogs', params],
    queryFn: () => api.devLogs.list(params),
  });
}
