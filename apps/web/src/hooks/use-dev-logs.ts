import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useDevLogs(params?: Parameters<typeof api.devLogs.list>[0]) {
  return useQuery({
    queryKey: ['devLogs', params],
    queryFn: () => api.devLogs.list(params),
  });
}
