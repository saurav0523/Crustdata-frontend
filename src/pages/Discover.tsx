import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFilterStore } from '@/store/filterStore';
import { searchCompanies, listSavedSearches, deleteSavedSearch } from '@/services/companies';
import { listWatchlist, addToWatchlist, removeFromWatchlist } from '@/services/watchlist';
import { listAlerts } from '@/services/alerts';
import { CompanyCard } from '@/components/cards/CompanyCard';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { useState, useEffect } from 'react';
import {
  Sparkles,
  Star,
  Bell,
  TrendingUp,
  FolderHeart,
  Globe,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

const PAGE_SIZE = 15;

// ─── Pagination Bar ────────────────────────────────────────────────────────────
function PaginationBar({
  currentPage,
  totalPages,
  isLoading,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Build visible page numbers with ellipsis logic
  const buildPages = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 4) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 3) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 select-none">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-semibold
          bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
          text-text-secondary hover:text-white transition-all duration-150
          disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Prev
      </button>

      {/* Page numbers */}
      {buildPages().map((p, idx) =>
        p === '...' ? (
          <span key={`ellipsis-${idx}`} className="w-9 text-center text-text-secondary text-[12px]">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            disabled={isLoading}
            className={`w-9 h-9 rounded-lg text-[12px] font-bold transition-all duration-150 border
              ${currentPage === p
                ? 'bg-accent text-white border-accent shadow-lg shadow-accent/25'
                : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-text-secondary hover:text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading && currentPage === p ? (
              <Loader2 className="w-3 h-3 animate-spin mx-auto" />
            ) : (
              p
            )}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-semibold
          bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
          text-text-secondary hover:text-white transition-all duration-150
          disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Next
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function Discover() {
  const queryClient = useQueryClient();

  // Pagination state (1-indexed for display)
  const [currentPage, setCurrentPage] = useState(1);
  // We track an estimated total so we can show page count
  const [estimatedTotal, setEstimatedTotal] = useState(0);

  // Zustand filter store
  const {
    query,
    selectedIndustries,
    minFunding,
    maxFunding,
    minHeadcount,
    maxHeadcount,
    hiringStatus,
    ycOnly,
    setQuery,
    setSelectedIndustries,
    setFundingRange,
    setHeadcountRange,
  } = useFilterStore();

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
    setEstimatedTotal(0);
  }, [query, selectedIndustries, minFunding, maxFunding, minHeadcount, maxHeadcount, hiringStatus, ycOnly]);

  // Derive offset from current page
  const offset = (currentPage - 1) * PAGE_SIZE;

  // 1. Fetch current page of companies
  const {
    data: searchData,
    isLoading: isLoadingCompanies,
    isFetching,
    error: searchError,
    refetch: refetchCompanies,
  } = useQuery({
    queryKey: ['companiesSearch', query, selectedIndustries, minFunding, maxFunding, minHeadcount, maxHeadcount, hiringStatus, ycOnly, currentPage],
    queryFn: () =>
      searchCompanies({
        query,
        industry: selectedIndustries.join(','),
        min_funding: minFunding,
        min_headcount: minHeadcount,
        hiring_status: hiringStatus,
        yc_only: ycOnly,
        offset,
        count: PAGE_SIZE,
      }),
    retry: false,
    staleTime: 5 * 60 * 1000, // React Query won't refetch for 5 min (Redis handles backend cache)
  });

  // Update estimated total: if we got a full page, assume there's at least one more
  useEffect(() => {
    if (searchData) {
      const returnedCount = searchData.results.length;
      if (returnedCount === PAGE_SIZE) {
        // Got a full page – there might be more; estimate conservatively
        setEstimatedTotal(prev => Math.max(prev, offset + returnedCount + 1));
      } else {
        // Last page – we now know exact total
        setEstimatedTotal(offset + returnedCount);
      }
    }
  }, [searchData, offset]);

  const totalPages = Math.ceil(estimatedTotal / PAGE_SIZE);
  const companies = searchData?.results ?? [];

  // 2. Watchlist
  const { data: watchlist } = useQuery({ queryKey: ['watchlist'], queryFn: listWatchlist });

  // 3. Alerts
  const { data: alerts } = useQuery({ queryKey: ['alerts'], queryFn: listAlerts });

  // 4. Saved Searches
  const { data: savedSearches } = useQuery({ queryKey: ['savedSearches'], queryFn: listSavedSearches });

  // Watchlist mutations
  const addWatchlistMutation = useMutation({
    mutationFn: (co: { domain: string; name: string }) => addToWatchlist(co.domain, co.name),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success(`Added ${variables.name} to Watchlist`);
    },
  });

  const removeWatchlistMutation = useMutation({
    mutationFn: (id: number) => removeFromWatchlist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Removed from Watchlist');
    },
  });

  const handleWatchlistToggle = (domain: string, name: string) => {
    const existing = watchlist?.find((w) => w.company_domain === domain);
    if (existing) removeWatchlistMutation.mutate(existing.id);
    else addWatchlistMutation.mutate({ domain, name });
  };

  // Delete saved search
  const deleteSavedSearchMutation = useMutation({
    mutationFn: (id: number) => deleteSavedSearch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] });
      toast.success('Saved search removed');
    },
  });

  // Apply saved search filters
  const handleApplySavedSearch = (searchItem: any) => {
    const f = searchItem.filters || {};
    setQuery(f.query || '');
    setSelectedIndustries(f.industry ? f.industry.split(',') : []);
    setHeadcountRange(f.min_headcount || 0, 10000);
    setFundingRange(f.min_funding || 0, 5000);
    toast.success(`Applied filters: "${searchItem.name}"`);
  };

  // Stats
  const watchlistedCount = watchlist?.length ?? 0;
  const activeAlertsCount = alerts?.filter((a) => a.status === 'ACTIVE').length ?? 0;
  const growthOpportunitiesCount = companies.filter((c: any) => {
    const growth = c.employee_growth_percentages?.find((g: any) => g.timespan === 'YEAR')?.percentage ?? 0;
    return growth >= 20;
  }).length;

  const stats = [
    { label: 'Results This Page', value: searchError ? '—' : companies.length, icon: Globe, color: 'text-accent bg-accent/10 border-accent/20' },
    { label: 'Watchlisted', value: watchlistedCount, icon: Star, color: 'text-warning bg-warning/10 border-warning/20' },
    { label: 'High Growth Assets', value: searchError ? '—' : growthOpportunitiesCount, icon: TrendingUp, color: 'text-success bg-success/10 border-success/20' },
    { label: 'Active Signal Alerts', value: activeAlertsCount, icon: Bell, color: 'text-error bg-error/10 border-error/20' },
  ];

  // Page range label: "Showing 16 – 30"
  const rangeStart = estimatedTotal === 0 ? 0 : offset + 1;
  const rangeEnd = offset + companies.length;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* HERO */}
      <div className="text-left max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[11px] font-bold text-accent tracking-wider uppercase mb-3 shadow-[0_2px_10px_rgba(124,92,252,0.15)] animate-float">
          <Sparkles className="w-3.5 h-3.5" />
          <span>IntelliScope Discover v2.6</span>
        </div>
        <h1 className="text-[26px] md:text-[32px] font-black tracking-tight leading-tight text-white">
          Company Intelligence Engine
        </h1>
        <p className="text-[13.5px] text-text-secondary mt-2 leading-relaxed">
          Monitor headcount growth rates, funding triggers, hiring velocities, and recent organizational alerts.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.label}
              className="glass-panel rounded-2xl p-4 md:p-5 flex items-center justify-between shadow-md hover:border-white/10 transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">
                  {st.label}
                </span>
                <span className="text-[20px] md:text-[24px] font-black text-white font-mono mt-1 leading-none">
                  {st.value}
                </span>
              </div>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${st.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* FILTERS */}
      <FilterPanel />

      {/* SAVED SEARCHES */}
      {savedSearches && savedSearches.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-white text-[12px] font-bold bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-lg">
            <FolderHeart className="w-4 h-4 text-accent" />
            <span>Saved Searches:</span>
          </div>
          {savedSearches.map((searchItem: any) => (
            <div
              key={searchItem.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/4 hover:bg-white/6 border border-white/8 transition group"
            >
              <button
                onClick={() => handleApplySavedSearch(searchItem)}
                className="text-[12px] font-semibold text-text-secondary hover:text-white transition"
              >
                {searchItem.name}
              </button>
              <button
                onClick={() => deleteSavedSearchMutation.mutate(searchItem.id)}
                className="text-text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition"
                title="Delete Search"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* RESULTS */}
      <div className="flex flex-col gap-6">

        {/* Header row: title + pagination summary */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-[14px] font-extrabold text-white flex items-center gap-2">
            Search Results
            {isFetching && !isLoadingCompanies && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
            )}
          </h3>

          {!searchError && estimatedTotal > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-[11.5px] text-text-secondary font-medium">
                Showing <span className="text-white font-bold">{rangeStart}–{rangeEnd}</span>
                {' '}· Page <span className="text-white font-bold">{currentPage}</span>
                {totalPages > 1 && <> of <span className="text-white font-bold">{totalPages}</span></>}
                {' '}· <span className="text-white font-bold">{PAGE_SIZE}</span> per page
              </span>
            </div>
          )}
        </div>

        {/* Skeleton loading */}
        {isLoadingCompanies ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
              <div key={idx} className="glass-panel rounded-2xl p-5 h-[250px] flex flex-col justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl skeleton-shimmer shrink-0" />
                  <div className="flex flex-col gap-2 grow">
                    <div className="w-24 h-4 rounded skeleton-shimmer" />
                    <div className="w-32 h-3 rounded skeleton-shimmer" />
                  </div>
                </div>
                <div className="w-full h-4 rounded skeleton-shimmer mt-4" />
                <div className="grid grid-cols-2 gap-4 border-t border-white/6 pt-4 mt-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="w-12 h-3 rounded skeleton-shimmer" />
                    <div className="w-8 h-4 rounded skeleton-shimmer" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="w-12 h-3 rounded skeleton-shimmer" />
                    <div className="w-8 h-4 rounded skeleton-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchError ? (
          /* Error state */
          <div className="py-16 text-center flex flex-col items-center justify-center bg-error/4 border border-dashed border-error/15 rounded-2xl p-8 shadow-xl max-w-xl mx-auto">
            <AlertCircle className="w-11 h-11 text-error mb-4 animate-pulse" />
            <h4 className="text-[15px] font-black text-white mb-2 tracking-wide uppercase">
              Backend API Connection Failed
            </h4>
            <p className="text-[12px] max-w-md leading-relaxed mb-6 text-text-secondary">
              We encountered an error querying the company search endpoint. Check that the backend server is running and your API key is valid.
            </p>
            <div className="w-full p-3 rounded-lg bg-surface border border-white/6 text-left font-mono text-[11px] text-error mb-6 overflow-x-auto">
              <span className="font-bold text-text-secondary mr-2">Error:</span>
              {(searchError as any).message || 'HTTP 500 Internal Server Error'}
            </div>
            <button
              onClick={() => { toast.loading('Re-attempting connection...'); refetchCompanies(); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-[12.5px] font-bold cursor-pointer transition shadow-lg shadow-accent/15"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </button>
          </div>
        ) : companies.length > 0 ? (
          <>
            {/* Company grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((company: any) => (
                <CompanyCard
                  key={company.domain}
                  company={company}
                  isWatchlisted={watchlist?.some((w) => w.company_domain === company.domain) ?? false}
                  onWatchlistToggle={() => handleWatchlistToggle(company.domain, company.name)}
                />
              ))}
            </div>

            {/* ── Pagination Bar ── */}
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              isLoading={isFetching}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        ) : (
          /* Empty state */
          <div className="py-24 text-center flex flex-col items-center justify-center glass-panel rounded-2xl p-8 border-dashed border-white/10">
            <FolderHeart className="w-10 h-10 opacity-30 text-accent mb-4" />
            <h4 className="text-[14px] font-bold text-white mb-1.5">No Matching Companies Found</h4>
            <p className="text-[12px] max-w-sm leading-relaxed px-4 text-text-secondary">
              Try widening your funding boundaries, headcount thresholds, or search queries.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Discover;
