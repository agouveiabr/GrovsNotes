import { Badge } from '@/components/ui/badge';
import type { ItemWithTags } from '@grovsnotes/shared';
import { Lightbulb, CheckSquare, FileText, Bug, FlaskConical, Sparkles, Loader2 } from 'lucide-react';
import { useRefineItem, useUpdateItem } from '@/hooks/use-items-convex';
import { useState } from 'react';
import { AIPreviewDialog } from './ai-preview-dialog';
import { toast } from 'sonner';

const typeIcons = {
  idea: Lightbulb,
  task: CheckSquare,
  note: FileText,
  bug: Bug,
  research: FlaskConical,
} as const;

interface ItemCardProps {
  item: ItemWithTags;
  onClick?: (item: ItemWithTags) => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const Icon = typeIcons[item.type] || FileText;
  const refine = useRefineItem();
  const update = useUpdateItem();
  const [showPreview, setShowPreview] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [suggestion, setSuggestion] = useState<{ title: string; content: string } | null>(null);

  const handleRefine = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPreview(true);
    setSuggestion(null);
    setIsRefining(true);
    try {
      const result = await refine({ title: item.title, content: item.content ?? '' });
      setSuggestion(result);
    } catch (err) {
      console.error(err);
      toast.error('AI refinement failed');
      setShowPreview(false);
    } finally {
      setIsRefining(false);
    }
  };

  const handleConfirm = async () => {
    if (!suggestion) return;
    try {
      await update({ id: item.id, title: suggestion.title, content: suggestion.content });
      toast.success('Note refined!');
      setShowPreview(false);
    } catch (err) {
      toast.error('Failed to update note');
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onClick?.(item)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.(item);
          }
        }}
        className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors relative group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="flex items-start gap-2">
          <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate pr-14">{item.title}</p>
            {(item.tags?.length ?? 0) > 0 && (
              <div className="flex gap-1 mt-1 flex-wrap">
                {item.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <button
              onClick={handleRefine}
              disabled={isRefining}
              className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-primary/10 hover:text-primary transition-all text-muted-foreground"
              title="Refine with AI"
            >
              {isRefining ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AIPreviewDialog
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleConfirm}
        original={{ title: item.title, content: item.content ?? undefined }}
        suggested={suggestion}
        isLoading={isRefining}
      />
    </>
  );
}
