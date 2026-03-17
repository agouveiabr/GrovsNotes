import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useSearch(q: string) {
  return useQuery(api.search.search, q ? { q } : "skip");
}
