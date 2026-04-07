import { useState } from 'react';

interface UseListNavigationProps {
  itemCount: number;
  onSelect: (index: number) => void;
  enabled?: boolean;
}

export function useListNavigation({
  itemCount: _itemCount,
  onSelect: _onSelect,
  enabled: _enabled = true,
}: UseListNavigationProps) {
  const [activeIndex, setActiveIndex] = useState(-1);

  return { activeIndex, setActiveIndex };
}
