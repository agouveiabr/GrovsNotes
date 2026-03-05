import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { CapturePage } from '@/routes/capture-page';
import { InboxPage } from '@/routes/inbox-page';
import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 30, retry: 1 },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<CapturePage />} />
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/projects" element={<div>Projects</div>} />
            <Route path="/search" element={<div>Search</div>} />
            <Route path="/timeline" element={<div>Timeline</div>} />
            <Route path="/items/:id" element={<div>Item Detail</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
