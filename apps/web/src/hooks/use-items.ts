import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useItems(params?: Parameters<typeof api.items.list>[0]) {
  return useQuery({
    queryKey: ['items', params],
    queryFn: () => api.items.list(params),
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: ['items', id],
    queryFn: () => api.items.get(id),
    enabled: !!id,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.items.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['items'] }); },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof api.items.update>[1]) =>
      api.items.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['items'] }); },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.items.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['items'] }); },
  });
}

export function useRefineItem() {
  return useMutation({
    mutationFn: api.items.refine,
  });
}
