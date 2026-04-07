import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import { BottomNav } from './bottom-nav';
import { CommandMenu } from './command-menu';

export function AppShell() {
  const [open, setOpen] = React.useState(false);

  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    setOpen((prev) => !prev);
  }, { enableOnFormTags: true });

  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="h-[calc(100dvh-4rem)] overflow-hidden">
        <Outlet />
      </main>
      <BottomNav />
      <CommandMenu open={open} setOpen={setOpen} />
    </div>
  );
}
