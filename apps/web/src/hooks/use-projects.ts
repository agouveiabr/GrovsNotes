import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: api.projects.list });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.projects.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof api.projects.update>[1]) =>
      api.projects.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.projects.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); },
  });
}
