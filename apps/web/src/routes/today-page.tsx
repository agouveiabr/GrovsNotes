import { TodayView } from '@/components/today/today-view';

export function TodayPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-3 shrink-0">
        <h1 className="text-2xl font-bold">Today</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-2xl">
          <TodayView />
        </div>
      </div>
    </div>
  );
}
