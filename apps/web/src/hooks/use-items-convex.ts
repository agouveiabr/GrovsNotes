import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { type ItemType, type ItemStatus } from "@grovsnotes/shared";

export function useItems(params?: {
  status?: ItemStatus;
  type?: ItemType;
  projectId?: string;
  tag?: string;
  limit?: number;
}) {
  return useQuery(api.items.listItems, (params as any) || {});
}

export function useItem(id: string) {
  return useQuery(api.items.getItem, { id: id as any });
}

export function useCreateItem() {
  return useMutation(api.items.createItem);
}

export function useUpdateItem() {
  return useMutation(api.items.updateItem);
}

export function useDeleteItem() {
  return useMutation(api.items.deleteItem);
}

export function useRefineItem() {
  return useAction(api.ai.refineNote);
}

export function useItemsDue(beforeTimestamp: number) {
  return useQuery(api.items.listItemsDue, { beforeTimestamp });
}

export function useBoardItems(projectId?: string) {
  return useQuery(api.items.listBoardItems, projectId ? { projectId: projectId as any } : {});
}

export function useOldInbox(olderThanTimestamp: number) {
  return useQuery(api.items.listOldInbox, { olderThanTimestamp });
}
