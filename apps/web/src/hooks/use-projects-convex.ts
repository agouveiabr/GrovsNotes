import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useProjects() {
  return useQuery(api.projects.listProjects, {});
}

export function useProject(id: string) {
  return useQuery(api.projects.getProject, { id: id as any });
}

export function useCreateProject() {
  return useMutation(api.projects.createProject);
}

export function useUpdateProject() {
  return useMutation(api.projects.updateProject);
}

export function useDeleteProject() {
  return useMutation(api.projects.deleteProject);
}
