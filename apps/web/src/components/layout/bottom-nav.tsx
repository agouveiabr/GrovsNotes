import { NavLink } from 'react-router-dom';
import { Plus, Inbox, FolderOpen, Search, Clock } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Capture', icon: Plus },
  { to: '/inbox', label: 'Inbox', icon: Inbox },
  { to: '/projects', label: 'Projects', icon: FolderOpen },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/timeline', label: 'Timeline', icon: Clock },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background z-50">
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
      </div>
    </nav>
  );
}
