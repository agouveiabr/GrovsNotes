import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  original: { title: string; content?: string };
  suggested: { title: string; content: string } | null;
  isLoading: boolean;
}

export function AIPreviewDialog({
  isOpen,
  onClose,
  onConfirm,
  original,
  suggested,
  isLoading,
}: AIPreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Refinement Preview
          </DialogTitle>
          <DialogDescription>
            Review the suggested changes before applying them to your note.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Running magic on your note...</p>
            </div>
          ) : suggested ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {/* Original */}
              <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-muted/30">
                <div className="p-2 border-b bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Original
                </div>
                <div className="p-4 flex-1 overflow-auto prose prose-sm dark:prose-invert max-w-none">
                  <h3 className="text-lg font-bold mb-2">{original.title}</h3>
                  {original.content ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{original.content}</ReactMarkdown>
                  ) : (
                    <p className="italic text-muted-foreground">No content</p>
                  )}
                </div>
              </div>

              {/* Suggested */}
              <div className="flex flex-col h-full border-2 border-primary/20 rounded-lg overflow-hidden bg-background shadow-sm">
                <div className="p-2 border-b bg-primary/5 text-xs font-semibold uppercase tracking-wider text-primary flex items-center justify-between">
                  AI Suggestion
                  <Sparkles className="h-3 w-3" />
                </div>
                <div className="p-4 flex-1 overflow-auto prose prose-sm dark:prose-invert max-w-none">
                  <h3 className="text-lg font-bold mb-2 text-primary">{suggested.title}</h3>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{suggested.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-destructive">
              Failed to generate suggestion. Please try again.
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center sm:justify-between w-full border-t pt-4">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isLoading || !suggested}
            className="bg-primary hover:bg-primary/90"
          >
            Apply Changes
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
