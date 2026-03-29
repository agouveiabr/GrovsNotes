import { DndContext, DragOverlay } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useState } from 'react';
import type { ItemStatus, ItemWithTags } from '@grovsnotes/shared';
import { useProjects } from '@/hooks/use-projects-convex';
import { useBoardItems, useUpdateItem } from '@/hooks/use-items-convex';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { toast } from 'sonner';

interface BoardViewProps {
  projectId?: string;
}

export function BoardView({ projectId }: BoardViewProps) {
  const projects = useProjects();
  const allItems = useBoardItems(projectId);
  const updateItem = useUpdateItem();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || 'all');
  const [activeId, setActiveId] = useState<string | null>(null);

  const statuses: ItemStatus[] = ['inbox', 'todo', 'doing', 'done'];

  // Group items by status
  const itemsByStatus = statuses.reduce(
    (acc: Record<ItemStatus, ItemWithTags[]>, status) => {
      acc[status] = (allItems || []).filter((item: ItemWithTags) => item.status === status);
      return acc;
    },
    {} as Record<ItemStatus, ItemWithTags[]>
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const targetStatus = over.id as ItemStatus;
    const item = (allItems || []).find((i: ItemWithTags) => i.id === active.id);

    if (!item || item.status === targetStatus) return;

    try {
      await updateItem({ id: item.id, status: targetStatus });
    } catch (err) {
      toast.error('Failed to update item status');
    }
  };

  const handleProjectChange = (value: string) => {
    setSelectedProjectId(value);
  };

  const activeItem = activeId ? (allItems || []).find((i: ItemWithTags) => i.id === activeId) : null;

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      {/* Header with project filter */}
      <div className="flex items-center gap-2 px-4 shrink-0">
        <span className="text-sm font-medium text-muted-foreground">Filter:</span>
        <Select value={selectedProjectId} onValueChange={handleProjectChange}>
          <SelectTrigger className="w-[200px] h-8 text-xs">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              All Projects
            </SelectItem>
            {(projects || []).map((project: any) => (
              <SelectItem key={project.id} value={project.id} className="text-xs">
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Board columns */}
      <DndContext onDragStart={({ active }) => setActiveId(active.id as string)} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4 px-4 h-full snap-x snap-mandatory scroll-smooth">
          {statuses.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              items={itemsByStatus[status]}
            />
          ))}
        </div>

        <DragOverlay>
          {activeItem ? <KanbanCard item={activeItem} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
