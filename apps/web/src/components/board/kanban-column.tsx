import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { ItemWithTags, ItemStatus } from '@grovsnotes/shared';
import { KanbanCard } from './kanban-card';

interface KanbanColumnProps {
  status: ItemStatus;
  items: ItemWithTags[];
}

const statusConfig = {
  inbox: { label: 'Inbox', color: 'text-muted-foreground' },
  todo: { label: 'To Do', color: 'text-muted-foreground' },
  doing: { label: 'Doing', color: 'text-blue-500' },
  done: { label: 'Done', color: 'text-green-500' },
  archived: { label: 'Archived', color: 'text-gray-400' },
} as const;

export function KanbanColumn({ status, items }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });
  const config = statusConfig[status];
  const itemIds = items.map((item) => item.id);

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col min-w-[220px] w-[220px] bg-muted/30 rounded-lg p-3 border border-muted gap-3 h-fit"
    >
      <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b">
        <h3 className={`text-sm font-semibold ${config.color} capitalize`}>{config.label}</h3>
        <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
          {items.length}
        </span>
      </div>

      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {items.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-8 italic">
              No items
            </div>
          ) : (
            items.map((item) => <KanbanCard key={item.id} item={item} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}
