import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCreateItem } from '@/hooks/use-items';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { addToOfflineQueue, getOfflineQueue, syncOfflineQueue } from '@/sw/offline-queue';

export function CaptureInput() {
  const [value, setValue] = useState('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const createItem = useCreateItem();

  useEffect(() => {
    inputRef.current?.focus();
    
    // Initial fetch of pending count
    setPendingCount(getOfflineQueue().length);
    
    const setOnline = async () => {
      setIsOffline(false);
      const queue = getOfflineQueue();
      if (queue.length > 0) {
        toast.info(`Syncing ${queue.length} offline items...`);
        await syncOfflineQueue(async (item) => {
          await createItem.mutateAsync(item);
        });
        setPendingCount(0);
        toast.success('Offline items synced!');
      }
    };
    
    const setOffline = () => setIsOffline(true);
    
    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOffline);
    
    // Automatically try to sync if we are online on mount
    if (navigator.onLine) {
      setOnline();
    }
    
    return () => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOffline);
    };
  }, [createItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    if (isOffline) {
      addToOfflineQueue({ title: trimmed });
      setPendingCount(prev => prev + 1);
      setLastSaved(`${trimmed} (Saved to queue)`);
      setValue('');
      setTimeout(() => setLastSaved(null), 2000);
      toast.success('Saved to offline queue');
      return;
    }

    try {
      await createItem.mutateAsync({ title: trimmed });
      setLastSaved(trimmed);
      setValue('');
      setTimeout(() => setLastSaved(null), 2000);
    } catch {
      toast.error('Failed to save item');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 relative">
      <h1 className="text-2xl font-bold tracking-tight">GrovsNotes</h1>
      {pendingCount > 0 && (
        <Badge variant="secondary" className="absolute top-4 right-4">
          {pendingCount} Pending Sync
        </Badge>
      )}
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={isOffline ? "Offline mode - items will queue" : "What's on your mind? #tags work too"}
          className={`text-lg h-12 ${isOffline ? 'border-amber-500/50' : ''}`}
          disabled={createItem.isPending && !isOffline}
        />
      </form>
      <AnimatePresence>
        {lastSaved && (
          <motion.p
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="text-sm text-muted-foreground"
          >
            Saved: {lastSaved}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
