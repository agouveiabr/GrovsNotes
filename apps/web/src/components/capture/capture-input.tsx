import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCreateItem } from '@/hooks/use-items-convex';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { addToOfflineQueue, getOfflineQueue, syncOfflineQueue } from '@/sw/offline-queue';
import { Send } from 'lucide-react';

export function CaptureInput() {
  const [value, setValue] = useState('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const createItem = useCreateItem();

  useEffect(() => {
    inputRef.current?.focus();

    setPendingCount(getOfflineQueue().length);

    const setOnline = async () => {
      setIsOffline(false);
      const queue = getOfflineQueue();
      if (queue.length > 0) {
        toast.info(`Syncing ${queue.length} offline items...`);
        await syncOfflineQueue(async (item) => {
          await createItem(item);
        });
        setPendingCount(0);
        toast.success('Offline items synced!');
      }
    };

    const setOffline = () => setIsOffline(true);

    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOffline);

    if (navigator.onLine) {
      setOnline();
    }

    return () => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOffline);
    };
  }, [createItem]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    // Split text into title and content.
    // The first non-empty line becomes the title, the rest is content.
    const lines = trimmed.split('\n');
    const originalTitle = lines[0].trim();
    const contentLines = lines.slice(1).join('\n').trim();

    // For the UI notification we'll show just the title
    let displayTitle = originalTitle;
    if (displayTitle.length > 40) displayTitle = displayTitle.slice(0, 40) + '...';

    const itemPayload = {
      title: originalTitle,
      content: contentLines ? contentLines : undefined,
    };

    if (isOffline) {
      addToOfflineQueue(itemPayload);
      setPendingCount((prev) => prev + 1);
      setLastSaved(`${displayTitle} (Saved to queue)`);
      setValue('');
      setTimeout(() => setLastSaved(null), 2000);
      toast.success('Saved to offline queue');
      return;
    }

    try {
      setIsSaving(true);
      await createItem(itemPayload);
      setLastSaved(displayTitle);
      setValue('');
      setTimeout(() => setLastSaved(null), 2000);
    } catch {
      toast.error('Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
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
      <form onSubmit={handleSubmit} className="w-full max-w-md relative group">
        <Textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isOffline ? "Offline mode - items will queue" : "Write a note... (First line is title. Cmd+Enter to save)"}
          className={`text-base min-h-[120px] resize-none pr-12 pb-12 ${isOffline ? 'border-amber-500/50' : 'border-2'} focus-visible:ring-primary shadow-sm`}
          disabled={isSaving && !isOffline}
        />
        <div className="absolute bottom-3 right-3 flex items-center justify-end">
          <Button
            type="submit"
            size="sm"
            className="h-8 rounded-md transition-opacity"
            disabled={!value.trim() || (isSaving && !isOffline)}
          >
            <Send className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </form>
      <AnimatePresence>
        {lastSaved && (
           <motion.p
             initial={{ opacity: 1, y: 0 }}
             animate={{ opacity: 0, y: -20 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 1.5 }}
             className="text-sm text-muted-foreground absolute -bottom-8"
           >
             Saved: {lastSaved}
           </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
