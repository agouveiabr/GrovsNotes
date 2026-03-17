import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { CapturePage } from '@/routes/capture-page';
import { InboxPage } from '@/routes/inbox-page';
import { ItemPage } from '@/routes/item-page';
import { ProjectsPage } from '@/routes/projects-page';
import { ProjectDetailPage } from '@/routes/project-detail-page';
import { SearchPage } from '@/routes/search-page';
import { TimelinePage } from '@/routes/timeline-page';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

function App() {
  return (
    <ThemeProvider>
      <ConvexProvider client={convex}>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<CapturePage />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/items/:id" element={<ItemPage />} />
              <Route path="*" element={<Navigate to="/inbox" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ConvexProvider>
    </ThemeProvider>
  );
}

export default App;
