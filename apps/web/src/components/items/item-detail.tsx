import { useState, useEffect, useRef } from 'react';
import { useItem, useUpdateItem, useDeleteItem } from '@/hooks/use-items';
import { useProjects } from '@/hooks/use-projects';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ITEM_TYPES, ITEM_STATUSES, type ItemType, type ItemStatus } from '@grovsnotes/shared';
import { useNavigate } from 'react-router-dom';
import { Trash2, PencilLine, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRefineItem } from '@/hooks/use-items';
import { AIPreviewDialog } from './ai-preview-dialog';

interface ItemDetailProps {
  id: string;
}

export function ItemDetail({ id }: ItemDetailProps) {
  const { data: item, isLoading, error } = useItem(id);
  const { data: projects } = useProjects();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showAIPreview, setShowAIPreview] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ title: string; content: string } | null>(null);
  
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const refineItem = useRefineItem();

  // Sync state when data loads
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setContent(item.content || '');
    }
  }, [item]);

  // Focus textarea when entering edit mode if it's not empty
  useEffect(() => {
    if (isEditing && contentTextareaRef.current) {
      contentTextareaRef.current.focus();
    }
  }, [isEditing]);

  if (isLoading) return <div className="p-4 text-center text-muted-foreground">Loading...</div>;
  if (error || !item) return <div className="p-4 text-center text-destructive">Error loading item</div>;

  const projectList = projects || [];

  const handleBlur = (field: 'title' | 'content', value: string) => {
    if (item[field] !== value) {
      // Don't save empty titles
      if (field === 'title' && !value.trim()) {
        setTitle(item.title);
        return;
      }
      updateItem.mutate({ id, [field]: value });
    }
  };

  const handleTypeChange = (value: string) => {
    updateItem.mutate({ id, type: value as ItemType });
  };

  const handleStatusChange = (value: string) => {
    updateItem.mutate({ id, status: value as ItemStatus });
  };

  const handleProjectChange = (value: string) => {
    updateItem.mutate({ id, projectId: value === 'none' ? null : value });
  };

  const handleDelete = () => {
    deleteItem.mutate(id, {
      onSuccess: () => {
        toast.success('Item deleted');
        navigate('/inbox');
      },
      onError: () => {
        toast.error('Failed to delete item');
      }
    });
  };

  const toggleEditMode = () => {
    if (isEditing) {
      handleBlur('title', title);
      handleBlur('content', content);
    }
    setIsEditing(!isEditing);
  };

  const handleAIRefine = async () => {
    setShowAIPreview(true);
    setAiSuggestion(null);
    try {
      const result = await refineItem.mutateAsync(id);
      setAiSuggestion(result);
    } catch (err) {
      toast.error('AI refinement failed');
      setShowAIPreview(false);
    }
  };

  const handleAIConfirm = async () => {
    if (!aiSuggestion) return;
    try {
      await updateItem.mutateAsync({
        id,
        title: aiSuggestion.title,
        content: aiSuggestion.content
      });
      setTitle(aiSuggestion.title);
      setContent(aiSuggestion.content);
      toast.success('Note refined!');
      setShowAIPreview(false);
    } catch (err) {
      toast.error('Failed to update note');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background pb-8">
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center space-x-2">
          <Select value={item.type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {ITEM_TYPES.map(type => (
                <SelectItem key={type} value={type} className="text-xs capitalize">{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={item.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[110px] h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {ITEM_STATUSES.map(status => (
                <SelectItem key={status} value={status} className="text-xs capitalize">{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={item.projectId || 'none'} onValueChange={handleProjectChange}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-xs">No Project</SelectItem>
              {projectList.map(project => (
                <SelectItem key={project.id} value={project.id} className="text-xs">{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 ${isEditing ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={toggleEditMode}
            title={isEditing ? 'Done editing' : 'Edit note'}
          >
            {isEditing ? <Check className="h-4 w-4" /> : <PencilLine className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={handleAIRefine}
            disabled={refineItem.isPending}
            title="Refine with AI"
          >
            <Sparkles className={`h-4 w-4 ${refineItem.isPending ? 'animate-pulse text-primary' : ''}`} />
          </Button>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Item</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this item? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 overflow-auto relative">
        {isEditing ? (
          <div className="flex flex-col h-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleBlur('title', title)}
              className="text-xl font-semibold border-0 px-0 shadow-none focus-visible:ring-0"
              placeholder="Item title..."
            />
            
            <Textarea
              ref={contentTextareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={() => handleBlur('content', content)}
              className="flex-1 resize-none border-0 px-0 shadow-none focus-visible:ring-0 text-base"
              placeholder="Add details, notes, or markdown content here..."
            />
          </div>
        ) : (
          <div 
            className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200 cursor-text"
            onClick={() => setIsEditing(true)}
          >
            <h1 className="text-2xl font-bold mb-4 text-foreground">{title}</h1>
            {content ? (
              <div className="prose prose-zinc dark:prose-invert prose-sm sm:prose-base max-w-none prose-p:leading-relaxed prose-pre:bg-muted prose-pre:text-muted-foreground">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-muted-foreground italic mt-2">No content. Click to add details...</p>
            )}
          </div>
        )}
      </div>

      <AIPreviewDialog
        isOpen={showAIPreview}
        onClose={() => setShowAIPreview(false)}
        onConfirm={handleAIConfirm}
        original={{ title: item.title, content: item.content ?? undefined }}
        suggested={aiSuggestion}
        isLoading={refineItem.isPending}
      />
    </div>
  );
}
