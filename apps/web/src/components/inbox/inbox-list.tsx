import { useItems } from '@/hooks/use-items-convex';
import { ItemCard } from '@/components/items/item-card';
import { useNavigate } from 'react-router-dom';

export function InboxList() {
  const items = useItems({ status: 'inbox' });
  const navigate = useNavigate();

  if (items === undefined) return <p className="text-muted-foreground text-center py-12">Loading...</p>;

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">
        Inbox is empty. Capture something!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item: any) => (
        <ItemCard
          key={item.id}
          item={item}
          onClick={(clickedItem) => navigate(`/items/${clickedItem.id}`)}
        />
      ))}
    </div>
  );
}
