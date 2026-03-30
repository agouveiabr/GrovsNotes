import { useItems } from '@/hooks/use-items-convex';
import { useProjects } from '@/hooks/use-projects-convex';
import { ItemCard } from '@/components/items/item-card';
import { useNavigate } from 'react-router-dom';
import { useListNavigation } from '@/hooks/use-list-navigation';
import { useState, useEffect } from 'react';
import { useUpdateProject } from '@/hooks/use-projects-convex';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, PencilLine, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectItemsProps {
  projectId: string;
}

export function ProjectItems({ projectId }: ProjectItemsProps) {
  const items = useItems({ projectId });
  const projects = useProjects();
  const updateProject = useUpdateProject();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAlias, setEditAlias] = useState('');

  const { activeIndex } = useListNavigation({
    itemCount: items?.length ?? 0,
    onSelect: (index) => {
      const item = items?.[index];
      if (item) navigate(`/items/${item.id}`);
    },
  });

  if (items === undefined || projects === undefined) return <div className="p-4 text-center text-muted-foreground">Loading...</div>;

  const project = projects.find((p: any) => p.id === projectId);

  useEffect(() => {
    if (project) {
      setEditName(project.name);
      setEditAlias(project.alias || '');
    }
  }, [project]);

  if (!project) return <div className="p-4 text-center text-destructive">Project not found</div>;

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
        alias: editAlias.trim() || undefined
      });
      setIsEditing(false);
      toast.success('Project updated');
    } catch {
      toast.error('Failed to update project');
    }
  };

  const handleCancel = () => {
    setEditName(project.name);
    setEditAlias(project.alias || '');
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
          ) : (
            <div className="flex items-center gap-2 truncate">
              <h2 className="text-2xl font-semibold leading-none truncate">{project.name}</h2>
              {project.alias && (
                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                  {project.alias}
                </span>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" 
                onClick={() => setIsEditing(true)}
              >
                <PencilLine className="h-4 w-4" />
              </Button>
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
    </div>
  );
}
