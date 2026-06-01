import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  ExternalLink,
  Users,
  DollarSign,
  TrendingUp,
  MapPin,
  Calendar,
  Sparkles,
  Cpu,
  Star,
  Bell,
  Check,
  Loader2
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { enrichCompany } from '@/services/companies';
import { listWatchlist, addToWatchlist, removeFromWatchlist } from '@/services/watchlist';
import { createAlert, listAlerts } from '@/services/alerts';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer
} from 'recharts';
import { formatCompactNumber, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function CompanyDetailsDrawer() {
  const { detailsDrawerOpen, selectedCompanyDomain, closeDetailsDrawer } = useUIStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'signals' | 'alerts'>('overview');

  // Alert form states
  const [alertType, setAlertType] = useState('headcount_growth');
  const [thresholdVal, setThresholdVal] = useState('15');
  const [emailInput, setEmailInput] = useState('demo@intelliscope.ai');
  const [isSubmittingAlert, setIsSubmittingAlert] = useState(false);

  // 1. Fetch full company details
  const { data: company, isLoading, error } = useQuery({
    queryKey: ['company', selectedCompanyDomain],
    queryFn: () => enrichCompany(selectedCompanyDomain ?? ''),
    enabled: !!selectedCompanyDomain && detailsDrawerOpen,
  });

  // 2. Fetch watchlist state
  const { data: watchlist } = useQuery({
    queryKey: ['watchlist'],
    queryFn: listWatchlist,
    enabled: detailsDrawerOpen,
  });

  const isWatchlisted = watchlist?.some((w) => w.company_domain === selectedCompanyDomain) ?? false;
  const watchlistItemId = watchlist?.find((w) => w.company_domain === selectedCompanyDomain)?.id;

  // 3. Watchlist mutations
  const addMutation = useMutation({
    mutationFn: () => addToWatchlist(selectedCompanyDomain ?? '', company?.name ?? ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success(`Added ${company?.name} to watchlist`);
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => removeFromWatchlist(watchlistItemId ?? 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success(`Removed ${company?.name} from watchlist`);
    },
  });

  const handleWatchlistToggle = () => {
    if (isWatchlisted) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  };

  // 4. Create Alert mutation
  const handleAlertCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !selectedCompanyDomain) return;

    setIsSubmittingAlert(true);
    try {
      await createAlert({
        company_domain: selectedCompanyDomain,
        company_name: company.name,
        alert_type: alertType,
        threshold: { value: Number(thresholdVal) },
        notify_email: emailInput || null,
        notify_webhook: null,
      });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success(`Created ${alertType.replace('_', ' ')} alert for ${company.name}`);
      setActiveTab('overview'); // switch back
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingAlert(false);
    }
  };

  // Reconstruct headcount history points for Recharts area plotting
  const getGrowthChartData = () => {
    if (!company) return [];

    const C = company.employee_count;
    const g6m = company.employee_growth_percentages?.find((g) => g.timespan === 'SIX_MONTHS')?.percentage ?? 0;
    const g1y = company.employee_growth_percentages?.find((g) => g.timespan === 'YEAR')?.percentage ?? 0;
    const g2y = company.employee_growth_percentages?.find((g) => g.timespan === 'TWO_YEAR')?.percentage ?? 0;

    // historical counts calculations
    const c6m = Math.round(C / (1 + g6m / 100));
    const c1y = Math.round(C / (1 + g1y / 100));
    const c2y = Math.round(C / (1 + g2y / 100));

    return [
      { name: '2 Yrs Ago', Headcount: c2y },
      { name: '1 Yr Ago', Headcount: c1y },
      { name: '6 Mos Ago', Headcount: c6m },
      { name: 'Present', Headcount: C },
    ];
  };

  const chartData = getGrowthChartData();

  // Revenue display helpers
  const getRevenueText = () => {
    if (!company?.revenue_range) return 'N/A';
    const min = company.revenue_range.estimatedMinRevenue;
    const max = company.revenue_range.estimatedMaxRevenue;
    if (!min || !max) return 'N/A';
    return `$${min.amount}${min.unit === 'MILLION' ? 'M' : 'B'} - $${max.amount}${max.unit === 'MILLION' ? 'M' : 'B'}`;
  };

  return (
    <AnimatePresence>
      {detailsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Drawer Blur Underlay Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetailsDrawer}
            className="absolute inset-0 bg-[#000000]/50 backdrop-blur-sm"
          />

          {/* Drawer Sliding Body Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full md:w-[45%] max-w-[650px] h-full bg-[#111214] border-l border-white/8 shadow-2xl flex flex-col z-10 overflow-hidden"
          >
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-text-secondary gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
                <span className="text-[13px] font-medium tracking-wide">Retrieving profile metadata...</span>
              </div>
            ) : error || !company ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-text-secondary gap-4">
                <span className="text-[14px] text-error">Failed to enrich company data profiles.</span>
                <button
                  onClick={closeDetailsDrawer}
                  className="px-4 py-2 bg-white/5 hover:bg-white/8 rounded-xl border border-white/6 text-white text-[13px]"
                >
                  Close Panel
                </button>
              </div>
            ) : (
              <>
                {/* --- DRAWER HEADER --- */}
                <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/6 bg-[#16181D]/60 backdrop-blur">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-white/4 border border-white/6 flex items-center justify-center font-bold text-[14px] text-accent shrink-0 overflow-hidden">
                      {company.logo_urls?.['200x200'] ? (
                        <img
                          src={company.logo_urls['200x200']}
                          alt={`${company.name} logo`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        company.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h2 className="text-[16px] font-extrabold text-white truncate leading-snug">{company.name}</h2>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11.5px] text-text-secondary hover:text-accent font-medium leading-none mt-1"
                      >
                        <span>{selectedCompanyDomain}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={closeDetailsDrawer}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-white transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* --- COMPACT STATE SIDEBAR / QUICK ACTIONS ROW --- */}
                <div className="flex items-center gap-3 px-6 py-3 bg-[#0A0A0B]/40 border-b border-white/6">
                  {/* Watchlist Toggle */}
                  <button
                    onClick={handleWatchlistToggle}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition cursor-pointer grow justify-center",
                      isWatchlisted
                        ? "bg-accent/15 border-accent/25 text-accent hover:bg-accent/20"
                        : "bg-white/3 border-white/6 text-text-secondary hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Star className={cn("w-3.5 h-3.5", isWatchlisted && "fill-accent")} />
                    <span>{isWatchlisted ? 'Watchlisted' : 'Add Watchlist'}</span>
                  </button>

                  {/* Create Alert Quick Access */}
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition cursor-pointer grow justify-center",
                      activeTab === 'alerts'
                        ? "bg-white/10 border-white/12 text-white"
                        : "bg-white/3 border-white/6 text-text-secondary hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Create Alert</span>
                  </button>
                </div>

                {/* --- NAVIGATION TABS --- */}
                <div className="flex items-center border-b border-white/6 px-6">
                  {(['overview', 'signals', 'alerts'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-4 py-3 text-[12.5px] font-semibold capitalize relative tracking-wide cursor-pointer",
                        activeTab === tab ? "text-white" : "text-text-secondary hover:text-white"
                      )}
                    >
                      {activeTab === tab && (
                        <motion.div
                          layoutId="drawer-tab-indicator"
                          className="absolute bottom-0 left-0 w-full h-[2px] bg-accent"
                        />
                      )}
                      {tab}
                    </button>
                  ))}
                </div>

                {/* --- TAB CONTENT BODY --- */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin flex flex-col gap-6">
                  {/* --- TAB 1: OVERVIEW --- */}
                  {activeTab === 'overview' && (
                    <>
                      {/* Description */}
                      <div className="flex flex-col gap-2">
                        <h4 className="text-[12px] font-extrabold uppercase tracking-wider text-text-secondary">
                          Company Description
                        </h4>
                        <p className="text-[13.5px] text-text-secondary leading-relaxed bg-[#16181D]/40 border border-white/4 p-4 rounded-xl">
                          {company.description}
                        </p>
                      </div>

                      {/* Growth Trend Headcount Recharts Area Chart */}
                      <div className="flex flex-col gap-3">
                        <h4 className="text-[12px] font-extrabold uppercase tracking-wider text-text-secondary">
                          Headcount History
                        </h4>
                        <div className="w-full h-[180px] bg-[#16181D]/30 border border-white/4 rounded-xl p-3.5 flex flex-col justify-between">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorHeadcount" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.25} />
                                  <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0.0} />
                                </linearGradient>
                              </defs>
                              <XAxis
                                dataKey="name"
                                stroke="#B0B7C3"
                                fontSize={9.5}
                                tickLine={false}
                                axisLine={false}
                              />
                              <YAxis
                                stroke="#B0B7C3"
                                fontSize={9.5}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) => formatCompactNumber(v)}
                              />
                              <ChartTooltip
                                contentStyle={{
                                  backgroundColor: '#16181D',
                                  borderColor: 'rgba(255, 255, 255, 0.08)',
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="Headcount"
                                stroke="#7C5CFC"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorHeadcount)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Numerical Stats Grid */}
                      <div className="grid grid-cols-2 gap-4.5">
                        <div className="flex flex-col p-3 rounded-xl bg-[#16181D]/30 border border-white/4">
                          <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold mb-1">
                            Hiring Status
                          </span>
                          <span
                            className={cn(
                              "text-[13px] font-bold capitalize",
                              company.hiring_status === 'active'
                                ? 'text-success'
                                : company.hiring_status === 'paused'
                                ? 'text-warning'
                                : 'text-text-secondary'
                            )}
                          >
                            {company.hiring_status === 'active' ? 'Active hiring' : company.hiring_status === 'paused' ? 'Paused' : 'Not hiring'}
                          </span>
                        </div>

                        <div className="flex flex-col p-3 rounded-xl bg-[#16181D]/30 border border-white/4">
                          <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold mb-1">
                            Revenue Range
                          </span>
                          <span className="text-[13px] font-bold text-white font-mono">{getRevenueText()}</span>
                        </div>

                        <div className="flex flex-col p-3 rounded-xl bg-[#16181D]/30 border border-white/4">
                          <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold mb-1">
                            Founded Year
                          </span>
                          <span className="text-[13px] font-bold text-white font-mono">
                            {company.founded_year || 'N/A'}
                          </span>
                        </div>

                        <div className="flex flex-col p-3 rounded-xl bg-[#16181D]/30 border border-white/4">
                          <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold mb-1">
                            HQ Headquarters
                          </span>
                          <span className="text-[13px] font-bold text-white truncate">
                            {company.location || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Tech Stack */}
                      {company.technologies && company.technologies.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <h4 className="text-[12px] font-extrabold uppercase tracking-wider text-text-secondary">
                            Technology Stack
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {company.technologies.map((t) => (
                              <span
                                key={t}
                                className="flex items-center gap-1 bg-white/3 border border-white/6 px-2.5 py-1 rounded-lg text-[11px] text-text-secondary font-medium"
                              >
                                <Cpu className="w-3 h-3 text-accent" />
                                <span>{t}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* --- TAB 2: SIGNALS & INSIGHTS --- */}
                  {activeTab === 'signals' && (
                    <div className="flex flex-col gap-4">
                      <h4 className="text-[12px] font-extrabold uppercase tracking-wider text-text-secondary">
                        Recent Signals & Announcements
                      </h4>
                      {company.recent_signals && company.recent_signals.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          {company.recent_signals.map((s, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3.5 p-4 rounded-xl bg-[#16181D]/40 border border-white/4"
                            >
                              <div className="w-6 h-6 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 mt-0.5">
                                <Sparkles className="w-3.5 h-3.5" />
                              </div>
                              <p className="text-[13px] text-white leading-relaxed">{s}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-text-secondary">
                          No recent signals captured for this domain
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- TAB 3: CREATE ALERTS --- */}
                  {activeTab === 'alerts' && (
                    <form onSubmit={handleAlertCreate} className="flex flex-col gap-5">
                      <div className="flex flex-col gap-1">
                        <h4 className="text-[13px] font-bold text-white">Create Signal Alert</h4>
                        <p className="text-[11px] text-text-secondary">
                          We will actively poll LinkedIn and Crustdata models to notify you on matches.
                        </p>
                      </div>

                      {/* Alert Type */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[11.5px] font-bold text-text-secondary uppercase tracking-wider">
                          Signal Category
                        </label>
                        <select
                          value={alertType}
                          onChange={(e) => setAlertType(e.target.value)}
                          className="w-full bg-[#16181D] border border-white/6 rounded-xl p-3.5 text-[13px] outline-none focus:border-accent"
                        >
                          <option value="headcount_growth">Headcount Growth Rate</option>
                          <option value="funding">Funding Milestones</option>
                          <option value="hiring">Hiring Announcements</option>
                        </select>
                      </div>

                      {/* Threshold */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[11.5px] font-bold text-text-secondary uppercase tracking-wider">
                          Threshold Percentage / Limit
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 10"
                          value={thresholdVal}
                          onChange={(e) => setThresholdVal(e.target.value)}
                          className="w-full bg-[#16181D] border border-white/6 rounded-xl p-3.5 text-[13px] outline-none focus:border-accent text-white font-mono"
                          required
                        />
                      </div>

                      {/* Notify Email */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[11.5px] font-bold text-text-secondary uppercase tracking-wider">
                          Notification Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="demo@intelliscope.ai"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full bg-[#16181D] border border-white/6 rounded-xl p-3.5 text-[13px] outline-none focus:border-accent text-white"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingAlert}
                        className="w-full mt-2 py-3 bg-accent hover:bg-accent/90 disabled:bg-accent/40 text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-accent/20"
                      >
                        {isSubmittingAlert ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span>Save Alert Rule</span>
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
export default CompanyDetailsDrawer;
