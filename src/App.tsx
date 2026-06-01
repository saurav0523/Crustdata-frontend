import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useUIStore } from '@/store/uiStore';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Discover } from '@/pages/Discover';
import { Watchlist } from '@/pages/Watchlist';
import { Alerts } from '@/pages/Alerts';
import { Analytics } from '@/pages/Analytics';
import { Settings } from '@/pages/Settings';
import { CommandMenu } from '@/components/ui/CommandMenu';
import { CompanyDetailsDrawer } from '@/components/drawers/CompanyDetailsDrawer';

// Create a high-performance Query Client for caching & fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes cache validity
    },
  },
});

export function App() {
  const { activePage } = useUIStore();

  // Simple, extremely fast state-driven routing
  const renderActivePage = () => {
    switch (activePage) {
      case 'discover':
        return <Discover />;
      case 'watchlist':
        return <Watchlist />;
      case 'alerts':
        return <Alerts />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Discover />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      {/* Premium Toast alerts styled for dark theme */}
      <Toaster
        theme="dark"
        position="top-right"
        closeButton
        toastOptions={{
          style: {
            background: '#16181D',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          },
        }}
      />

      {/* Global Command Menu Dialog (CMD+K) */}
      <CommandMenu />

      {/* Main Core Layout & Page views */}
      <DashboardLayout>
        {renderActivePage()}
      </DashboardLayout>

      {/* Right side animated Drawer for company enrichment profiles */}
      <CompanyDetailsDrawer />
    </QueryClientProvider>
  );
}
export default App;
