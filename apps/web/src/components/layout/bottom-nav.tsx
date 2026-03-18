import { NavLink } from 'react-router-dom';
import { Plus, LayoutGrid, FolderOpen, Search, CalendarCheck, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme/theme-provider';

const navItems = [
  { to: '/', label: 'Capture', icon: Plus },
  { to: '/board', label: 'Board', icon: LayoutGrid },
  { to: '/projects', label: 'Projects', icon: FolderOpen },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/today', label: 'Today', icon: CalendarCheck },
];

export function BottomNav() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-lg z-50">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
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
            <span>{item.label}</span>
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
