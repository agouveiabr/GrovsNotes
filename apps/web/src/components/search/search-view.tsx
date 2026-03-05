import { useState, useEffect } from 'react';
import { useSearch } from '@/hooks/use-search';
import { ItemCard } from '@/components/items/item-card';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function SearchView() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { data: searchResults, isLoading } = useSearch(debouncedQuery);
  const navigate = useNavigate();

  const items = searchResults?.items || [];

  return (
    <div className="flex flex-col h-full bg-background p-4 gap-4 overflow-y-auto">
      <h2 className="text-2xl font-semibold">Search</h2>
      
      <div className="space-y-2 sticky top-0 bg-background pt-2 pb-4 z-10 border-b">
        <Input 
          autoFocus
          placeholder="Search items..." 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          className="text-lg bg-muted/50"
        />
        <p className="text-xs text-muted-foreground pl-1">
          Try: <code className="bg-muted px-1 py-0.5 rounded font-mono">type:idea</code>, <code className="bg-muted px-1 py-0.5 rounded font-mono">status:todo</code> or full text
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {isLoading && debouncedQuery && <p className="text-sm text-center py-12 text-muted-foreground">Searching...</p>}
        {!isLoading && items.length === 0 && debouncedQuery && (
          <p className="text-sm text-center py-12 text-muted-foreground">No results found for "{debouncedQuery}"</p>
        )}
        {!isLoading && items.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase mt-1 mb-2 tracking-wider">Matches ({items.length})</h3>
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={(clickedItem) => navigate(`/items/${clickedItem.id}`)}
              />
            ))}
          </div>
        )}
        {!debouncedQuery && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-sm opacity-60">
            <span className="text-4xl mb-4">🔍</span>
            <p>Enter a search term above</p>
          </div>
        )}
      </div>
    </div>
  );
}
