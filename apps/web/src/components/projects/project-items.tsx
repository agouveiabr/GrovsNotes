import { useItems } from '@/hooks/use-items';
import { useProjects } from '@/hooks/use-projects';
import { ItemCard } from '@/components/items/item-card';
import { useNavigate } from 'react-router-dom';

interface ProjectItemsProps {
  projectId: string;
}

export function ProjectItems({ projectId }: ProjectItemsProps) {
  const { data: itemsPaginated, isLoading: itemsLoading } = useItems({ project: projectId });
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const navigate = useNavigate();

  if (itemsLoading || projectsLoading) return <div className="p-4 text-center text-muted-foreground">Loading...</div>;

  const project = projects?.find(p => p.id === projectId);
  const items = itemsPaginated?.data || [];

  if (!project) return <div className="p-4 text-center text-destructive">Project not found</div>;

  return (
    <div className="flex flex-col gap-4 p-4 h-full bg-background overflow-y-auto">
      <div className="flex items-center gap-3 mb-2">
        <div 
          className="w-6 h-6 rounded-full shadow-sm flex-shrink-0" 
          style={{ backgroundColor: project.color || 'var(--primary)' }}
        />
        <h2 className="text-2xl font-semibold leading-none truncate">{project.name}</h2>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
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
