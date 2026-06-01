import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  Star,
  Bell,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Command,
  HelpCircle,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

interface NavItem {
  id: 'discover' | 'watchlist' | 'alerts' | 'analytics' | 'settings';
  label: string;
  icon: React.ComponentType<any>;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const {
    sidebarCollapsed,
    toggleSidebar,
    activePage,
    setActivePage,
    setSearchModalOpen
  } = useUIStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navigationItems: NavItem[] = [
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'watchlist', label: 'Watchlist', icon: Star },
    { id: 'alerts', label: 'Alerts & Signals', icon: Bell },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Notifications list in state
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Headcount surge at OpenAI', desc: 'OpenAI headcount grew by 14% in the last 30 days.', time: '10m ago', unread: true },
    { id: 2, title: 'Funding Alert: Supabase', desc: 'Supabase closed a $80M Series B funding round.', time: '2h ago', unread: true },
    { id: 3, title: 'New hiring signals at Vercel', desc: 'Vercel opened 5 new Senior Frontend Engineer roles.', time: '1d ago', unread: false },
  ]);

  return (
    <div className="min-h-screen bg-background text-white flex flex-col md:flex-row relative">
      {/* --- MOBILE NAVIGATION HEADER --- */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-white/6 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent to-accent-secondary flex items-center justify-center font-bold text-[14px]">
            IS
          </div>
          <span className="font-extrabold text-[15px] tracking-wide text-gradient-purple-cyan">IntelliScope</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="p-2 rounded-lg bg-white/4 text-text-secondary hover:text-white"
          >
            <Search className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/4 text-text-secondary hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#000000]/70 backdrop-blur-md pt-[60px]">
          <div className="w-[80vw] max-w-[280px] h-full bg-[#111214] border-r border-white/8 p-4 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivePage(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition text-[14px] font-medium w-full text-left",
                      isActive
                        ? "bg-accent/15 text-white border border-accent/20"
                        : "text-text-secondary hover:bg-white/4 hover:text-white"
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-auto border-t border-white/6 pt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">
                SU
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold">Saurav Gupta</span>
                <span className="text-[10px] text-text-secondary">demo@intelliscope.ai</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- DESKTOP COLLAPSIBLE SIDEBAR --- */}
      <aside
        className={cn(
          "hidden md:flex flex-col shrink-0 bg-surface border-r border-white/6 transition-all duration-300 relative select-none",
          sidebarCollapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {/* Brand Header */}
        <div className={cn("flex items-center gap-3 py-6 px-5", sidebarCollapsed ? "justify-center" : "justify-between")}>
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent to-accent-secondary flex items-center justify-center font-extrabold text-[16px] text-white shadow-[0_4px_12px_rgba(124,92,252,0.3)]">
                IS
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[15px] tracking-wide text-gradient-purple-cyan leading-none">
                  IntelliScope
                </span>
                <span className="text-[9px] text-text-secondary font-medium mt-1">COMPANY INTEL v2026</span>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent to-accent-secondary flex items-center justify-center font-extrabold text-[16px] text-white shadow-[0_4px_12px_rgba(124,92,252,0.3)]">
              IS
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <div className="flex flex-col gap-1.5 px-3 py-4 grow">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={cn(
                  "relative flex items-center gap-3 px-3.5 py-3 rounded-xl transition text-[13.5px] font-medium w-full text-left outline-none group border border-transparent",
                  isActive
                    ? "text-white"
                    : "text-text-secondary hover:text-white"
                )}
              >
                {/* Active Backdrop Pill */}
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-xl bg-white/5 border border-white/6 z-0"
                  />
                )}

                <Icon className={cn("w-4.5 h-4.5 shrink-0 z-10 transition-colors", isActive ? "text-accent" : "text-text-secondary group-hover:text-white")} />
                {!sidebarCollapsed && <span className="z-10">{item.label}</span>}

                {/* Collapsed Tooltip */}
                {sidebarCollapsed && (
                  <div className="absolute left-[85px] px-2.5 py-1.5 rounded-lg bg-surface-elevated text-[11px] text-white border border-white/8 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 whitespace-nowrap font-medium shadow-xl">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Collapse Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-[12px] top-[26px] z-20 w-[24px] h-[24px] rounded-full bg-[#16181D] border border-white/8 text-text-secondary hover:text-white flex items-center justify-center cursor-pointer shadow-md transition"
        >
          {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-white/6 flex flex-col gap-2">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/2 border border-white/4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center font-bold text-accent shrink-0">
                  SG
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[12px] font-semibold text-white truncate">Saurav Gupta</span>
                  <span className="text-[9.5px] text-text-secondary truncate">demo@intelliscope.ai</span>
                </div>
              </div>
              <HelpCircle className="w-4 h-4 text-text-secondary hover:text-white cursor-pointer shrink-0 transition" />
            </div>
          ) : (
            <div className="flex justify-center py-2">
              <div className="w-9 h-9 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center font-bold text-accent cursor-pointer group relative">
                SG
                {/* Collapsed profile status indicator */}
                <div className="absolute left-[52px] p-2 rounded-lg bg-surface-elevated text-[11px] text-white border border-white/8 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 whitespace-nowrap font-medium shadow-xl">
                  Saurav Gupta (demo@intelliscope.ai)
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* --- MAIN PAGE PANEL CONTAINER --- */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-surface/40 backdrop-blur-md border-b border-white/6 sticky top-0 z-20">
          {/* CMD+K trigger */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-3.5 px-4 py-2 rounded-xl bg-white/3 border border-white/6 hover:bg-white/5 hover:border-white/10 text-text-secondary hover:text-white transition w-full max-w-[280px] outline-none group text-left cursor-pointer"
          >
            <Search className="w-4 h-4 text-text-secondary group-hover:text-white transition-colors" />
            <span className="text-[12.5px] font-medium grow">Search or command...</span>
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/6 border border-white/8 text-[9px] font-bold text-text-secondary group-hover:text-white transition-colors">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </button>

          {/* Quick Actions (Notifications, Theme indicator, profile) */}
          <div className="flex items-center gap-4 relative">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2.5 rounded-xl bg-white/3 border border-white/6 hover:bg-white/5 text-text-secondary hover:text-white relative transition outline-none"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-3 w-80 rounded-xl bg-[#16181D] border border-white/8 p-3 shadow-2xl z-30 flex flex-col gap-2">
                    <div className="flex items-center justify-between border-b border-white/6 pb-2 mb-1">
                      <span className="text-[12px] font-bold">Recent Signals</span>
                      <span 
                        onClick={() => setNotifications((prev) => prev.map(n => ({ ...n, unread: false })))}
                        className="text-[9.5px] text-accent font-semibold hover:underline cursor-pointer"
                      >
                        Mark all read
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={cn(
                            "p-2.5 rounded-lg border text-left transition",
                            n.unread
                              ? "bg-accent/5 border-accent/15"
                              : "bg-white/2 border-white/4 hover:bg-white/3"
                          )}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[11.5px] font-bold text-white leading-tight">{n.title}</span>
                            <span className="text-[9px] text-text-secondary shrink-0">{n.time}</span>
                          </div>
                          <p className="text-[10px] text-text-secondary leading-normal">{n.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick API status indicator */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-success/8 border border-success/15 text-[11px] font-semibold text-success shadow-[0_2px_10px_rgba(0,230,118,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span>API SYNCED</span>
            </div>
          </div>
        </header>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin">
          {children}
        </div>
      </main>
    </div>
  );
}
export default DashboardLayout;
