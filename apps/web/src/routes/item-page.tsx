import { useParams } from 'react-router-dom';
import { ItemDetail } from '@/components/items/item-detail';

export function ItemPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div className="p-8 text-center text-muted-foreground">Item not found</div>;
  }

  return (
    <div className="h-full max-w-3xl mx-auto border-x bg-background">
      <ItemDetail id={id} />
    </div>
  );
}
