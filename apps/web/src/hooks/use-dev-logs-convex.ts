import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useDevLogs(params?: {
  repo?: string;
  limit?: number;
}) {
  return useQuery(api.devLogs.listDevLogs, params || {});
}
