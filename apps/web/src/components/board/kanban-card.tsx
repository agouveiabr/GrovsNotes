import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import type { ItemWithTags } from '@grovsnotes/shared';
import { Lightbulb, CheckSquare, FileText, Bug, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDueDate, isOverdue } from '@/lib/dates';
import { useProjects } from '@/hooks/use-projects-convex';

const typeIcons = {
  idea: Lightbulb,
  task: CheckSquare,
  note: FileText,
  bug: Bug,
  research: FlaskConical,
  'to-do': CheckSquare,
  log: FileText,
} as const;

interface KanbanCardProps {
  item: ItemWithTags;
}

export function KanbanCard({ item }: KanbanCardProps) {
  const navigate = useNavigate();
  const projects = useProjects();
  const Icon = typeIcons[item.type] || FileText;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => navigate(`/items/${item.id}`)}
      className="p-3 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.title}</p>
          <div className="flex gap-1 mt-2 flex-wrap items-center">
            {item.projectId && projects && (
              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider py-0 px-1.5 border-primary/20 bg-primary/5 text-primary/80">
                {projects.find((p: any) => p.id === item.projectId || p._id === item.projectId)?.alias || 'PROJ'}
              </Badge>
            )}
            {item.dueAt && (
              <>
                {isOverdue(item.dueAt) ? (
                  <Badge variant="destructive" className="text-xs">
                    Overdue
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    {formatDueDate(item.dueAt)}
                  </Badge>
                )}
              </>
            )}
            {item.tags?.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
