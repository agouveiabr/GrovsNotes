import { Outlet } from 'react-router-dom';
import { BottomNav } from './bottom-nav';

export function AppShell() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="h-[calc(100dvh-4rem)] overflow-hidden">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
