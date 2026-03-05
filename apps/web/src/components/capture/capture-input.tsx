import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useCreateItem } from '@/hooks/use-items';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export function CaptureInput() {
  const [value, setValue] = useState('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const createItem = useCreateItem();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <h1 className="text-2xl font-bold tracking-tight">GrovsNotes</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="What's on your mind? #tags work too"
          className="text-lg h-12"
          disabled={createItem.isPending}
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
