import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function useSendToObsidian() {
  return useAction(api.obsidian.sendToObsidian);
}
