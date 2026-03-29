import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

interface UseListNavigationProps {
  itemCount: number;
  onSelect: (index: number) => void;
  enabled?: boolean;
}

export function useListNavigation({ itemCount, onSelect, enabled = true }: UseListNavigationProps) {
  const [activeIndex, setActiveIndex] = useState(-1);

  useHotkeys('j', () => {
    setActiveIndex((prev) => {
      if (prev < itemCount - 1) return prev + 1;
      if (prev === -1 && itemCount > 0) return 0;
      return prev;
    });
  }, { 
    enabled: enabled && itemCount > 0,
    enableOnFormTags: false,
    preventDefault: true
  }, [itemCount, enabled]);

  useHotkeys('k', () => {
    setActiveIndex((prev) => {
      if (prev > 0) return prev - 1;
      return 0;
    });
  }, { 
    enabled: enabled && itemCount > 0,
    enableOnFormTags: false,
    preventDefault: true
  }, [itemCount, enabled]);

  useHotkeys('enter', (e) => {
    if (activeIndex !== -1) {
      e.preventDefault();
      onSelect(activeIndex);
    }
  }, { 
    enabled: enabled && activeIndex !== -1,
    enableOnFormTags: false 
  }, [activeIndex, enabled, onSelect]);

  return { activeIndex, setActiveIndex };
}
