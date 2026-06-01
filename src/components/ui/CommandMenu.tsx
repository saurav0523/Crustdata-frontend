import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Search, Terminal, Star, Bell, BarChart2, Sparkles, Compass, X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { listWatchlist } from '@/services/watchlist';
import { cn } from '@/lib/utils';

export function CommandMenu() {
  const {
    searchModalOpen,
    setSearchModalOpen,
    setActivePage,
    openDetailsDrawer
  } = useUIStore();

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 1. Fetch real, database-backed watchlisted companies for search lookup
  const { data: watchlist } = useQuery({
    queryKey: ['watchlist'],
    queryFn: listWatchlist,
    enabled: searchModalOpen, // Only fetch when menu is opened
  });

  // Toggle search modal with keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(!searchModalOpen);
      } else if (e.key === 'Escape') {
        setSearchModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen, setSearchModalOpen]);

  // Focus input on open
  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [searchModalOpen]);

  // Action definition list for navigation
  const navigationActions = [
    { id: 'nav-disc', title: 'Discover Companies', icon: Compass, action: () => setActivePage('discover'), category: 'Navigation' },
    { id: 'nav-watch', title: 'Watchlist', icon: Star, action: () => setActivePage('watchlist'), category: 'Navigation' },
    { id: 'nav-alert', title: 'Alerts & Signals', icon: Bell, action: () => setActivePage('alerts'), category: 'Navigation' },
    { id: 'nav-analy', title: 'Analytics Insights', icon: BarChart2, action: () => setActivePage('analytics'), category: 'Navigation' },
  ];

  // Dynamically filter actual watchlisted companies as they type
  const watchlistedResults = search.trim() && watchlist
    ? watchlist.filter(
        (w) =>
          w.company_name.toLowerCase().includes(search.toLowerCase()) ||
          w.company_domain.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 4)
    : [];

  const filteredCompanyActions = watchlistedResults.map((w) => ({
    id: `co-${w.company_domain}`,
    title: `Enrich ${w.company_name} (${w.company_domain})`,
    icon: Sparkles,
    action: () => openDetailsDrawer(w.company_domain),
    category: 'Watchlisted Companies'
  }));

  const allActions = [...filteredCompanyActions, ...navigationActions];

  // Handle arrow key and Enter press navigation
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (!searchModalOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % allActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allActions.length) % allActions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allActions[selectedIndex]) {
          allActions[selectedIndex].action();
          setSearchModalOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [searchModalOpen, selectedIndex, allActions]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedElement = listRef.current.querySelector('[data-selected="true"]');
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchModalOpen(false)}
            className="absolute inset-0 bg-[#000000]/60 backdrop-blur-md"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-xl mx-4 overflow-hidden rounded-xl border border-white/8 bg-[#111214]/90 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)]"
          >
            {/* Header / Search Input */}
            <div className="flex items-center px-4 border-b border-white/6 py-3">
              <Search className="w-5 h-5 text-text-secondary mr-3" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or lookup watchlisted companies..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                className="w-full bg-transparent text-white border-0 outline-none placeholder:text-text-secondary text-[15px] focus:ring-0"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded-md hover:bg-white/5 text-text-secondary hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content List */}
            <div ref={listRef} className="max-h-[380px] overflow-y-auto p-2 scrollbar-thin">
              {allActions.length === 0 ? (
                <div className="py-12 text-center text-text-secondary flex flex-col items-center justify-center">
                  <Terminal className="w-8 h-8 opacity-40 mb-3 text-accent" />
                  <p className="text-[14px]">No commands or saved matches found for "{search}"</p>
                </div>
              ) : (
                <>
                  {/* Render Sections */}
                  {['Watchlisted Companies', 'Navigation'].map((category) => {
                    const categoryActions = allActions.filter((a) => a.category === category);
                    if (categoryActions.length === 0) return null;

                    return (
                      <div key={category} className="mb-2">
                        <div className="px-3 py-1.5 text-[11px] font-semibold text-text-secondary tracking-wider uppercase">
                          {category}
                        </div>
                        {categoryActions.map((action) => {
                          const globalIndex = allActions.findIndex((a) => a.id === action.id);
                          const isSelected = globalIndex === selectedIndex;

                          const Icon = action.icon;

                          return (
                            <div
                              key={action.id}
                              data-selected={isSelected}
                              onClick={() => {
                                action.action();
                                setSearchModalOpen(false);
                              }}
                              className={cn(
                                "flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150",
                                isSelected
                                  ? "bg-accent/15 text-white border border-accent/20"
                                  : "text-text-secondary hover:bg-white/4 hover:text-white border border-transparent"
                              )}
                            >
                              <div className="flex items-center min-w-0">
                                <Icon className={cn("w-4 h-4 mr-3 shrink-0", isSelected ? "text-accent" : "text-text-secondary")} />
                                <span className="text-[13.5px] font-medium truncate">{action.title}</span>
                              </div>
                              
                              {isSelected && (
                                <span className="text-[10px] text-accent font-semibold bg-accent/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  Select
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#0A0A0B]/60 border-t border-white/6 text-[11px] text-text-secondary">
              <div className="flex items-center gap-1">
                <span>Use arrows</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-[9px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-[9px]">↓</kbd>
                <span>and</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-[9px]">Enter</kbd>
              </div>
              <div className="flex items-center gap-1">
                <span>Close with</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-[9px]">ESC</kbd>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
export default CommandMenu;
