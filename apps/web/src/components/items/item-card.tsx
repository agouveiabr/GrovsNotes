import { Badge } from '@/components/ui/badge';
import type { ItemWithTags } from '@grovsnotes/shared';
import { Lightbulb, CheckSquare, FileText, Bug, FlaskConical } from 'lucide-react';

const typeIcons = {
  idea: Lightbulb,
  task: CheckSquare,
  note: FileText,
  bug: Bug,
  research: FlaskConical,
} as const;

interface ItemCardProps {
  item: ItemWithTags;
  onClick?: (item: ItemWithTags) => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const Icon = typeIcons[item.type] || FileText;

  return (
    <button
      onClick={() => onClick?.(item)}
      className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{item.title}</p>
          {(item.tags?.length ?? 0) > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {item.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </button>
  );
}
