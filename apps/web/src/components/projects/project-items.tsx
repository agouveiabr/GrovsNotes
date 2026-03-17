import { useItems } from '@/hooks/use-items-convex';
import { useProjects } from '@/hooks/use-projects-convex';
import { ItemCard } from '@/components/items/item-card';
import { useNavigate } from 'react-router-dom';

interface ProjectItemsProps {
  projectId: string;
}

export function ProjectItems({ projectId }: ProjectItemsProps) {
  const items = useItems({ projectId });
  const projects = useProjects();
  const navigate = useNavigate();

  if (items === undefined || projects === undefined) return <div className="p-4 text-center text-muted-foreground">Loading...</div>;

  const project = projects.find((p: any) => p.id === projectId);

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
        {items.map((item: any) => (
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
