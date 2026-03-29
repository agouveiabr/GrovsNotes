import * as React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import { BottomNav } from './bottom-nav';
import { CommandMenu } from './command-menu';
import { ShortcutCheatSheet } from './shortcut-cheat-sheet';

export function AppShell() {
  const [open, setOpen] = React.useState(false);
  const [showCheatSheet, setShowCheatSheet] = React.useState(false);
  const navigate = useNavigate();

  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    setOpen((prev) => !prev);
  }, { enableOnFormTags: true });

  useHotkeys('?', (e) => {
    e.preventDefault();
    setShowCheatSheet((prev) => !prev);
  }, { enableOnFormTags: true });

  // G-chord navigation
  useHotkeys('g i', () => navigate('/inbox'));
  useHotkeys('g t', () => navigate('/today'));
  useHotkeys('g p', () => navigate('/projects'));
  useHotkeys('g b', () => navigate('/board'));
  useHotkeys('g s', () => navigate('/search'));
  useHotkeys('g c', () => navigate('/'));

  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="h-[calc(100dvh-4rem)] overflow-hidden">
        <Outlet />
      </main>
      <BottomNav />
      <CommandMenu open={open} setOpen={setOpen} />
      <ShortcutCheatSheet open={showCheatSheet} onOpenChange={setShowCheatSheet} />
    </div>
  );
}
