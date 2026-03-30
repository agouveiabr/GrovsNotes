import { useItems } from '@/hooks/use-items-convex';
import { useProjects } from '@/hooks/use-projects-convex';
import { ItemCard } from '@/components/items/item-card';
import { useNavigate } from 'react-router-dom';
import { useListNavigation } from '@/hooks/use-list-navigation';
import { useState, useEffect } from 'react';
import { useDeleteProject, useUpdateProject } from '@/hooks/use-projects-convex';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, PencilLine, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProjectItemsProps {
  projectId: string;
}

export function ProjectItems({ projectId }: ProjectItemsProps) {
  const items = useItems({ projectId });
  const projects = useProjects();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAlias, setEditAlias] = useState('');
  const [editColor, setEditColor] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { activeIndex } = useListNavigation({
    itemCount: items?.length ?? 0,
    onSelect: (index) => {
      const item = items?.[index];
      if (item) navigate(`/items/${item.id}`);
    },
  });

  const project = projects?.find((p: any) => p.id === projectId);

  useEffect(() => {
    if (project) {
      setEditName(project.name);
      setEditAlias(project.alias || '');
      setEditColor(project.color || 'var(--primary)');
    }
  }, [project]);

  if (items === undefined || projects === undefined) return <div className="p-4 text-center text-muted-foreground">Loading...</div>;

  if (!project) return <div className="p-4 text-center text-destructive">Project not found</div>;

  const PRESET_COLORS = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Slate', value: '#64748b' },
  ];

  const handleUpdate = async () => {
    if (!editName.trim()) {
      setEditName(project.name);
      setIsEditing(false);
      return;
    }
    
    try {
      await updateProject({
        id: projectId as any,
        name: editName.trim(),
        alias: editAlias.trim() || undefined,
        color: editColor
      });
      setIsEditing(false);
      toast.success('Project updated');
    } catch {
      toast.error('Failed to update project');
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteProject({ id: projectId as any });
      toast.success('Project deleted');
      navigate('/projects');
    } catch {
      toast.error('Failed to delete project');
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setEditName(project.name);
    setEditAlias(project.alias || '');
    setEditColor(project.color || 'var(--primary)');
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4 h-full bg-background overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div 
            className="w-6 h-6 rounded-full shadow-sm flex-shrink-0" 
            style={{ backgroundColor: project.color || 'var(--primary)' }}
          />
          {isEditing ? (
            <div className="flex flex-col flex-1 gap-4">
              <div className="flex flex-1 items-center gap-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-lg font-semibold h-9 py-1 px-2"
                  placeholder="Name"
                  autoFocus
                />
                <Input
                  value={editAlias}
                  onChange={(e) => setEditAlias(e.target.value)}
                  className="text-sm h-9 py-1 px-2 w-24 uppercase font-bold tracking-tight"
                  placeholder="Alias"
                />
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleUpdate}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">Color:</span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setEditColor(c.value)}
                      className={cn(
                        "w-5 h-5 rounded-full border shadow-sm transition-transform hover:scale-110",
                        editColor === c.value && "ring-2 ring-primary ring-offset-1"
                      )}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 truncate group">
              <h2 className="text-2xl font-semibold leading-none truncate">{project.name}</h2>
              {project.alias && (
                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                  {project.alias}
                </span>
              )}
              <div className="flex items-center gap-0.5 ml-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" 
                  onClick={() => setIsEditing(true)}
                  title="Edit project"
                >
                  <PencilLine className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" 
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Delete project"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item: any, index: number) => (
          <ItemCard
            key={item.id}
            item={item}
            active={index === activeIndex}
            onClick={(clickedItem) => navigate(`/items/${clickedItem.id}`)}
          />
        ))}
        {items.length === 0 && (
          <p className="text-muted-foreground py-12 text-center border rounded-xl border-dashed">
            No items in this project.
          </p>
        )}
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">"{project.name}"</span>? 
              This will remove the project association from all items. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
