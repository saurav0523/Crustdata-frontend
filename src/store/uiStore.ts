import { create } from 'zustand';

type PageType = 'discover' | 'watchlist' | 'alerts' | 'analytics' | 'settings';

interface UIState {
  sidebarCollapsed: boolean;
  searchModalOpen: boolean;
  detailsDrawerOpen: boolean;
  selectedCompanyDomain: string | null;
  activePage: PageType;
  
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSearchModalOpen: (open: boolean) => void;
  openDetailsDrawer: (domain: string) => void;
  closeDetailsDrawer: () => void;
  setActivePage: (page: PageType) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  searchModalOpen: false,
  detailsDrawerOpen: false,
  selectedCompanyDomain: null,
  activePage: 'discover',
  
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setSearchModalOpen: (open) => set({ searchModalOpen: open }),
  openDetailsDrawer: (domain) => set({
    selectedCompanyDomain: domain,
    detailsDrawerOpen: true
  }),
  closeDetailsDrawer: () => set({
    detailsDrawerOpen: false,
    selectedCompanyDomain: null
  }),
  setActivePage: (page) => set({ activePage: page })
}));
