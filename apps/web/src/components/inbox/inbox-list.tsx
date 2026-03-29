import { useItems } from '@/hooks/use-items-convex';
import { ItemCard } from '@/components/items/item-card';
import { useNavigate } from 'react-router-dom';
import { useListNavigation } from '@/hooks/use-list-navigation';

export function InboxList() {
  const items = useItems({ status: 'inbox' });
  const navigate = useNavigate();

  const { activeIndex } = useListNavigation({
    itemCount: items?.length ?? 0,
    onSelect: (index) => {
      const item = items?.[index];
      if (item) navigate(`/items/${item.id}`);
    },
  });

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
      {items.map((item: any, index: number) => (
        <ItemCard
          key={item.id}
          item={item}
          active={index === activeIndex}
          onClick={(clickedItem) => navigate(`/items/${clickedItem.id}`)}
        />
      ))}
    </div>
  );
}
