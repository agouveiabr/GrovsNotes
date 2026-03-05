import { useItems } from '@/hooks/use-items';
import { useDevLogs } from '@/hooks/use-dev-logs';
import { ItemCard } from '@/components/items/item-card';
import { useNavigate } from 'react-router-dom';
import { GitCommit } from 'lucide-react';

export function TimelineView() {
  const { data: itemsResponse, isLoading: itemsLoading } = useItems({ limit: 100 });
  const { data: devLogsResponse, isLoading: logsLoading } = useDevLogs({ limit: 100 });
  const navigate = useNavigate();

  if (itemsLoading || logsLoading) return <div className="p-4 text-center text-muted-foreground">Loading...</div>;

  const items = itemsResponse?.data || [];
  const logs = devLogsResponse?.data || [];

  const combined = [
    ...items.map(item => ({ type: 'item' as const, date: item.createdAt, data: item })),
    ...logs.map(log => ({ type: 'log' as const, date: log.createdAt, data: log }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const groupedTasks: Record<string, typeof combined> = {};
  for (const entry of combined) {
    const dateStr = new Date(entry.date).toLocaleDateString();
    if (!groupedTasks[dateStr]) groupedTasks[dateStr] = [];
    groupedTasks[dateStr].push(entry);
  }

  return (
    <div className="flex flex-col p-4 h-full bg-background overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-6">Timeline</h2>

      <div className="space-y-8 pb-12">
        {Object.entries(groupedTasks).map(([date, entries]) => (
          <div key={date} className="space-y-4">
            <h3 className="text-sm font-semibold tracking-tight text-muted-foreground border-b pb-1 flex justify-between">
              {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              <span className="font-normal opacity-60 text-xs mt-0.5">{entries.length} entries</span>
            </h3>
            
            <div className="space-y-4 pl-1">
              {entries.map((entry) => {
                if (entry.type === 'item') {
                  const item = entry.data as typeof items[0];
                  // Using inline styles to conditionally hide the visual timeline cues. In a real app we'd map over it to know if it's the last element.
                  return (
                    <div key={`item-${item.id}`} className="relative pl-6">
                      <ItemCard item={item} onClick={() => navigate(`/items/${item.id}`)} />
                    </div>
                  );
                } else {
                  const log = entry.data as typeof logs[0];
                  return (
                    <div key={`log-${log.id}`} className="relative pl-6 flex items-start gap-3 py-2">
                      <div className="mt-1 bg-muted rounded-full p-1 mb-auto flex-shrink-0 opacity-70">
                        <GitCommit className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0 bg-card/50 border rounded-lg p-3">
                        <p className="text-sm font-medium leading-snug break-words">{log.message}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-semibold">{log.commitHash.substring(0, 7)}</code>
                          <span className="max-w-[120px] truncate">{log.repo}</span>
                          <span className="text-muted-foreground/50">•</span>
                          <span className="max-w-[100px] truncate">{log.branch}</span>
                          <span className="ml-auto text-muted-foreground/60">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        ))}

        {combined.length === 0 && (
          <p className="text-center text-muted-foreground py-16 border rounded-xl border-dashed">
            No activity found.
          </p>
        )}
      </div>
    </div>
  );
}
