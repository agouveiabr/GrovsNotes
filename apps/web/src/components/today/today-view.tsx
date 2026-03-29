import { useItemsDue, useOldInbox } from '@/hooks/use-items-convex';
import { tomorrowMidnightLocal, isOverdue, isDueToday } from '@/lib/dates';
import { TodaySection } from './today-section';

export function TodayView() {
  // Query boundaries for filtering
  const endOfToday = tomorrowMidnightLocal() - 1;
  const oneDayAgo = Date.now() - 86_400_000;

  // Fetch data
  const dueItems = useItemsDue(endOfToday);
  const oldInboxItems = useOldInbox(oneDayAgo);

  // Split due items into overdue and due today
  const overdue = (dueItems || []).filter((item: any) => isOverdue(item.dueAt!));
  const dueToday = (dueItems || []).filter((item: any) => isDueToday(item.dueAt!));

  return (
    <div className="space-y-6">
      <TodaySection
        title="Overdue"
        items={overdue}
        emptyMessage="No overdue items. Great!"
        variant="overdue"
      />

      <TodaySection
        title="Due Today"
        items={dueToday}
        emptyMessage="Nothing due today."
        variant="default"
      />

      <TodaySection
        title="Old Inbox"
        items={oldInboxItems || []}
        emptyMessage="Your inbox is fresh!"
        variant="default"
      />
    </div>
  );
}
