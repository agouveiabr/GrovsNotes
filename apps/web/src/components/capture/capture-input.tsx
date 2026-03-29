import { useState, useRef, useEffect, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCreateItem } from '@/hooks/use-items-convex';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { addToOfflineQueue, getOfflineQueue, syncOfflineQueue } from '@/sw/offline-queue';
import { Send, Calendar, Folder, Tag, Info } from 'lucide-react';
import { parseItem } from '@/convex/lib/parser';

export function CaptureInput() {
  const [value, setValue] = useState('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const createItem = useCreateItem();

  const parsed = useMemo(() => {
    if (!value.trim()) return null;
    const lines = value.split('\n');
    const title = lines[0];
    return parseItem(title, {
      now: Date.now(),
      timezoneOffset: new Date().getTimezoneOffset()
    });
  }, [value]);

  useEffect(() => {
    inputRef.current?.focus();

    setPendingCount(getOfflineQueue().length);

    const setOnline = async () => {
      setIsOffline(false);
      const queue = getOfflineQueue();
      if (queue.length > 0) {
        toast.info(`Syncing ${queue.length} offline items...`);
        await syncOfflineQueue(async (item) => {
          await createItem({
            ...item,
            now: Date.now(),
            timezoneOffset: new Date().getTimezoneOffset()
          });
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
      now: Date.now(),
      timezoneOffset: new Date().getTimezoneOffset(),
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
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight">GrovsNotes</h1>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
      {pendingCount > 0 && (
        <Badge variant="secondary" className="absolute top-4 right-4">
          {pendingCount} Pending Sync
        </Badge>
      )}
      <div className="w-full max-w-md space-y-4">
        <form onSubmit={handleSubmit} className="relative group">
          <Textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isOffline ? "Offline mode - items will queue" : "Type - Project - Title - Date (Cmd+Enter)"}
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
              <span className="ml-1.5 text-[10px] opacity-50 font-mono hidden sm:inline-block tracking-tighter">⌘↵</span>
            </Button>
          </div>
        </form>

        <AnimatePresence>
          {parsed && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="bg-muted/50 rounded-lg p-3 border border-border flex flex-wrap gap-3 items-center"
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <Tag className="h-3.5 w-3.5" />
                {parsed.type}
              </div>
              
              {parsed.project && (
                <div className="flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  <Folder className="h-3.5 w-3.5" />
                  {parsed.project}
                </div>
              )}

              <div className="flex-1 text-sm font-medium truncate">
                {parsed.cleanTitle || "No title"}
              </div>

              {parsed.dueAt && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(parsed.dueAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!value && (
          <div className="text-xs text-muted-foreground flex items-start gap-2 px-1">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>Use the format <b>Type - Project - Title - Date</b> for fast capture. 
            Example: <i>todo - grov - Fix header - tomorrow</i></p>
          </div>
        )}
      </div>

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
