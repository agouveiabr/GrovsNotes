import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { ItemWithTags, ItemStatus } from '@grovsnotes/shared';
import { Check, Lightbulb, CheckSquare, FileText, Bug, FlaskConical } from 'lucide-react';
import { useUpdateItem } from '@/hooks/use-items-convex';
import { formatDueDate } from '@/lib/dates';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const typeIcons = {
  idea: Lightbulb,
  task: CheckSquare,
  note: FileText,
  bug: Bug,
  research: FlaskConical,
} as const;

const ITEM_STATUSES: ItemStatus[] = ['inbox', 'todo', 'doing', 'done', 'archived'];

interface TodaySectionProps {
  title: string;
  items: ItemWithTags[];
  emptyMessage: string;
  variant?: 'default' | 'overdue';
  activeIndex?: number;
  startIndex?: number;
}

export function TodaySection({
  title,
  items,
  emptyMessage,
  variant = 'default',
  activeIndex,
  startIndex = 0,
}: TodaySectionProps) {
  const updateItem = useUpdateItem();
  const navigate = useNavigate();

  const handleMarkDone = async (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    try {
      await updateItem({ id: itemId, status: 'done' });
      toast.success('Item marked done');
    } catch (err) {
      toast.error('Failed to update item');
    }
  };

  const handleStatusChange = async (itemId: string, status: string) => {
    try {
      await updateItem({ id: itemId, status: status as ItemStatus });
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="mb-6">
      <div
        className={cn(
          "flex items-center justify-between mb-3 pb-2 border-b",
          variant === 'overdue' ? 'border-destructive/30' : ''
        )}
      >
        <h2
          className={cn(
            "text-lg font-semibold",
            variant === 'overdue' ? 'text-destructive' : 'text-foreground'
          )}
        >
          {title}
        </h2>
        <span className="text-xs text-muted-foreground">{items.length} items</span>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground italic py-4">{emptyMessage}</div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => {
            const Icon = typeIcons[item.type] || FileText;
            const isActive = activeIndex === startIndex + index;
            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/items/${item.id}`)}
                className={cn(
                  "flex items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors cursor-pointer focus-visible:outline-none",
                  isActive && "ring-2 ring-primary border-primary bg-accent/50",
                  !isActive && "focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {item.dueAt && (
                        <Badge variant="outline" className="text-xs">
                          {formatDueDate(item.dueAt)}
                        </Badge>
                      )}
                      {item.tags?.map((tag) => (
                        <Badge key={tag.id} variant="secondary" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-green-600"
                    onClick={(e) => handleMarkDone(e, item.id)}
                    title="Mark as done"
                  >
                    <Check className="h-4 w-4" />
                  </Button>

                  <Select
                    value={item.status}
                    onValueChange={(value) => handleStatusChange(item.id, value)}
                  >
                    <SelectTrigger 
                      className="w-[80px] h-7 text-xs" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEM_STATUSES.map((status) => (
                        <SelectItem key={status} value={status} className="text-xs capitalize">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
