import { InboxList } from '@/components/inbox/inbox-list';

export function InboxPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 overflow-y-auto h-full">
      <h2 className="text-xl font-semibold mb-4">Inbox</h2>
      <InboxList />
    </div>
  );
}
