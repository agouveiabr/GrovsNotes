import { Outlet } from 'react-router-dom';
import { BottomNav } from './bottom-nav';

export function AppShell() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="max-w-lg mx-auto px-4 py-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
