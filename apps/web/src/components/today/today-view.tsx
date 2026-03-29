import { useItemsDue, useOldInbox } from '@/hooks/use-items-convex';
import { tomorrowMidnightLocal, isOverdue, isDueToday } from '@/lib/dates';
import { TodaySection } from './today-section';
import { useListNavigation } from '@/hooks/use-list-navigation';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

export function TodayView() {
  const navigate = useNavigate();
  // Query boundaries for filtering
  const endOfToday = tomorrowMidnightLocal() - 1;
  const oneDayAgo = Date.now() - 86_400_000;

  // Fetch data
  const dueItems = useItemsDue(endOfToday);
  const oldInboxItems = useOldInbox(oneDayAgo);

  // Split due items into overdue and due today
  const overdue = useMemo(() => (dueItems || []).filter((item: any) => isOverdue(item.dueAt!)), [dueItems]);
  const dueToday = useMemo(() => (dueItems || []).filter((item: any) => isDueToday(item.dueAt!)), [dueItems]);
  const oldInbox = useMemo(() => oldInboxItems || [], [oldInboxItems]);

  const allItems = useMemo(() => [...overdue, ...dueToday, ...oldInbox], [overdue, dueToday, oldInbox]);

  const { activeIndex } = useListNavigation({
    itemCount: allItems.length,
    onSelect: (index) => {
      const item = allItems[index];
      if (item) navigate(`/items/${item.id}`);
    },
  });

  return (
    <div className="space-y-6">
      <TodaySection
        title="Overdue"
        items={overdue}
        emptyMessage="No overdue items. Great!"
        variant="overdue"
        activeIndex={activeIndex}
        startIndex={0}
      />

      <TodaySection
        title="Due Today"
        items={dueToday}
        emptyMessage="Nothing due today."
        variant="default"
        activeIndex={activeIndex}
        startIndex={overdue.length}
      />

      <TodaySection
        title="Old Inbox"
        items={oldInbox}
        emptyMessage="Your inbox is fresh!"
        variant="default"
        activeIndex={activeIndex}
        startIndex={overdue.length + dueToday.length}
      />
    </div>
  );
}
