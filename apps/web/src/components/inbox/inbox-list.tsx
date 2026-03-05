import { useItems } from '@/hooks/use-items';
import { ItemCard } from '@/components/items/item-card';
import { useNavigate } from 'react-router-dom';

export function InboxList() {
  const { data, isLoading, error } = useItems({ status: 'inbox' });
  const navigate = useNavigate();

  if (isLoading) return <p className="text-muted-foreground text-center py-12">Loading...</p>;
  if (error) return <p className="text-destructive text-center py-12">Error loading inbox</p>;

  const items = data?.data || [];

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">
        Inbox is empty. Capture something!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onClick={(clickedItem) => navigate(`/items/${clickedItem.id}`)}
        />
      ))}
    </div>
  );
}
