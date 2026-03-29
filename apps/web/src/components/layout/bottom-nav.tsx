import { NavLink } from 'react-router-dom';
import { Plus, LayoutGrid, FolderOpen, Search, CalendarCheck, Sun, Moon, Inbox } from 'lucide-react';
import { useTheme } from '@/components/theme/theme-provider';

const navItems = [
  { to: '/', label: 'Capture', icon: Plus, shortcut: 'G+C' },
  { to: '/inbox', label: 'Inbox', icon: Inbox, shortcut: 'G+I' },
  { to: '/board', label: 'Board', icon: LayoutGrid, shortcut: 'G+B' },
  { to: '/projects', label: 'Projects', icon: FolderOpen, shortcut: 'G+P' },
  { to: '/search', label: 'Search', icon: Search, shortcut: 'G+S' },
  { to: '/today', label: 'Today', icon: CalendarCheck, shortcut: 'G+T' },
];

export function BottomNav() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-lg z-50">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <div className="flex flex-col items-center">
              <span>{item.label}</span>
              {item.shortcut && (
                <span className="text-[8px] opacity-40 font-mono -mt-0.5">
                  {item.shortcut}
                </span>
              )}
            </div>
          </NavLink>
        ))}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </nav>
  );
}
