import { useState, useEffect } from 'react';
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
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Sync state when data loads
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setContent(item.content || '');
    }
  }, [item]);

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

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Select value={item.type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {ITEM_TYPES.map(type => (
                <SelectItem key={type} value={type} className="text-xs capitalize">{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={item.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {ITEM_STATUSES.map(status => (
                <SelectItem key={status} value={status} className="text-xs capitalize">{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={item.projectId || 'none'} onValueChange={handleProjectChange}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
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

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
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

      <div className="p-4 flex flex-col flex-1 overflow-hidden space-y-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => handleBlur('title', title)}
          className="text-xl font-semibold border-0 px-0 shadow-none focus-visible:ring-0"
          placeholder="Item title..."
        />
        
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={() => handleBlur('content', content)}
          className="flex-1 resize-none border-0 px-0 shadow-none focus-visible:ring-0 text-base"
          placeholder="Add details, notes, or content here..."
        />
      </div>
    </div>
  );
}
