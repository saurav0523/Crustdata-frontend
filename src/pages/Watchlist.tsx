import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listWatchlist, removeFromWatchlist, refreshWatchlistItem } from '@/services/watchlist';
import { CompanyCard } from '@/components/cards/CompanyCard';
import {
  Star,
  Loader2,
  Trash2,
  RefreshCw,
  LayoutGrid,
  ListFilter,
  ArrowRight,
  TrendingUp,
  Scale,
  DollarSign,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatCompactNumber, formatCurrency } from '@/lib/utils';

export function Watchlist() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'grid' | 'compare'>('grid');
  
  // Selection array for comparison matrix
  const [compareDomains, setCompareDomains] = useState<string[]>([]);

  // 1. Query Watchlist
  const { data: watchlist, isLoading, error } = useQuery({
    queryKey: ['watchlist'],
    queryFn: listWatchlist,
  });

  // 2. Remove from watchlist mutation
  const removeMutation = useMutation({
    mutationFn: (id: number) => removeFromWatchlist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Removed company from watchlist');
    },
  });

  // 3. Refresh snapshot mutation
  const refreshMutation = useMutation({
    mutationFn: (id: number) => refreshWatchlistItem(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success(`Refreshed data for ${data.company_name}`);
    },
  });

  const handleToggleCompare = (domain: string) => {
    if (compareDomains.includes(domain)) {
      setCompareDomains(compareDomains.filter((d) => d !== domain));
    } else {
      if (compareDomains.length >= 3) {
        toast.warning('You can compare a maximum of 3 companies at a time.');
        return;
      }
      setCompareDomains([...compareDomains, domain]);
    }
  };

  const handleRemove = (id: number, name: string) => {
    removeMutation.mutate(id);
    // Remove from comparison array if present
    const item = watchlist?.find((w) => w.id === id);
    if (item) {
      setCompareDomains(compareDomains.filter((d) => d !== item.company_domain));
    }
  };

  const activeCompareList = watchlist?.filter((w) => compareDomains.includes(w.company_domain)) ?? [];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] md:text-[32px] font-black tracking-tight leading-none text-white">
            Watchlist Panel
          </h1>
          <p className="text-[13.5px] text-text-secondary mt-2">
            Track specific startup assets, refresh dynamic snapshots, and execute comparative matrices.
          </p>
        </div>

        {/* View Mode controls */}
        {watchlist && watchlist.length > 0 && (
          <div className="flex items-center bg-[#16181D]/80 border border-white/6 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold transition cursor-pointer outline-none",
                viewMode === 'grid' ? "bg-white/5 border border-white/8 text-white" : "text-text-secondary hover:text-white"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => {
                setViewMode('compare');
                // Auto-populate comparison with first two items if empty
                if (compareDomains.length === 0 && watchlist.length > 0) {
                  setCompareDomains(watchlist.slice(0, 2).map((w) => w.company_domain));
                }
              }}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold transition cursor-pointer outline-none",
                viewMode === 'compare' ? "bg-white/5 border border-white/8 text-white" : "text-text-secondary hover:text-white"
              )}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare Matrix</span>
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : error ? (
        <div className="py-24 text-center text-[14px] text-error font-medium">
          Failed to retrieve watchlist data items.
        </div>
      ) : !watchlist || watchlist.length === 0 ? (
        /* Empty State */
        <div className="py-24 text-center text-text-secondary flex flex-col items-center justify-center bg-[#111214]/50 border border-dashed border-white/8 rounded-2xl p-8 max-w-xl mx-auto shadow-md">
          <Star className="w-10 h-10 opacity-30 text-accent mb-4" />
          <h4 className="text-[14px] font-bold text-white mb-1.5">Your Watchlist is Empty</h4>
          <p className="text-[12px] max-w-xs leading-relaxed">
            Discover startup assets on the Discover tab, and tap the star icon on any card to track them.
          </p>
        </div>
      ) : (
        <>
          {/* --- VIEW MODE 1: STANDARD CARD GRID --- */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {watchlist.map((item) => {
                const enrichedCompany = item.snapshot;
                if (!enrichedCompany) return null;

                return (
                  <div key={item.id} className="relative group">
                    <CompanyCard
                      company={{ domain: item.company_domain, ...enrichedCompany }}
                      isWatchlisted={true}
                      onWatchlistToggle={() => handleRemove(item.id, item.company_name)}
                    />

                    {/* Snapshot Refresh Button Overlay */}
                    <div className="absolute right-15 bottom-5 z-25 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => refreshMutation.mutate(item.id)}
                        disabled={refreshMutation.isPending && refreshMutation.variables === item.id}
                        className="p-2 rounded-xl bg-white/4 border border-white/6 hover:bg-white/8 hover:border-white/12 text-text-secondary hover:text-white transition shadow-lg cursor-pointer"
                        title="Sync live enrichment data"
                      >
                        {refreshMutation.isPending && refreshMutation.variables === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-accent" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* --- VIEW MODE 2: COMPARATIVE MATRIX --- */}
          {viewMode === 'compare' && (
            <div className="flex flex-col gap-6">
              {/* Companies Selector Panel */}
              <div className="glass-panel rounded-2xl p-4.5 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 pr-3 border-r border-white/6 shrink-0">
                  <ListFilter className="w-4.5 h-4.5 text-accent" />
                  <span className="text-[12.5px] font-bold">Select (Max 3)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {watchlist.map((w) => {
                    const isSelected = compareDomains.includes(w.company_domain);
                    return (
                      <button
                        key={w.id}
                        onClick={() => handleToggleCompare(w.company_domain)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[11.5px] font-semibold border transition cursor-pointer outline-none",
                          isSelected
                            ? "bg-accent/15 border-accent/25 text-white"
                            : "bg-white/2 border-white/4 text-text-secondary hover:text-white hover:bg-white/4"
                        )}
                      >
                        {w.company_name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comparison Sheet Matrix Table */}
              {activeCompareList.length === 0 ? (
                <div className="py-20 text-center text-text-secondary bg-[#111214]/30 border border-white/6 rounded-2xl">
                  Please select at least one company from the selector above to compare.
                </div>
              ) : (
                <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/8">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-white/8 bg-[#16181D]/60 backdrop-blur">
                          <th className="p-4 md:p-5 text-[11.5px] font-extrabold uppercase tracking-wider text-text-secondary w-1/4">
                            Specifications
                          </th>
                          {activeCompareList.map((item) => (
                            <th key={item.id} className="p-4 md:p-5 w-1/4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/4 border border-white/6 flex items-center justify-center font-bold text-[12px] text-accent shrink-0 overflow-hidden">
                                  {item.snapshot?.logo_urls?.['200x200'] ? (
                                    <img
                                      src={item.snapshot.logo_urls['200x200']}
                                      alt={`${item.company_name} logo`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    item.company_name.slice(0, 2).toUpperCase()
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[13.5px] font-bold text-white truncate leading-snug">
                                    {item.company_name}
                                  </span>
                                  <span className="text-[10px] text-text-secondary truncate leading-none mt-0.5">
                                    {item.company_domain}
                                  </span>
                                </div>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/6 text-[12.5px] text-text-secondary">
                        {/* Domain / Website */}
                        <tr>
                          <td className="p-4 md:p-5 font-bold text-white bg-white/1">Website</td>
                          {activeCompareList.map((item) => (
                            <td key={item.id} className="p-4 md:p-5 font-mono text-[11px]">
                              <a
                                href={item.snapshot?.website}
                                target="_blank"
                                rel="noreferrer"
                                className="text-accent hover:underline flex items-center gap-1 leading-none"
                              >
                                <span>{item.snapshot?.website || 'N/A'}</span>
                              </a>
                            </td>
                          ))}
                        </tr>

                        {/* Industry */}
                        <tr>
                          <td className="p-4 md:p-5 font-bold text-white bg-white/1">Industry Sector</td>
                          {activeCompareList.map((item) => (
                            <td key={item.id} className="p-4 md:p-5">
                              {item.snapshot?.industry || 'N/A'}
                            </td>
                          ))}
                        </tr>

                        {/* Employee count */}
                        <tr>
                          <td className="p-4 md:p-5 font-bold text-white bg-white/1">Headcount</td>
                          {activeCompareList.map((item) => (
                            <td key={item.id} className="p-4 md:p-5 font-bold text-white font-mono">
                              <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-accent" />
                                <span>{formatCompactNumber(item.snapshot?.employee_count ?? 0)}</span>
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Annual Growth */}
                        <tr>
                          <td className="p-4 md:p-5 font-bold text-white bg-white/1">YoY Growth</td>
                          {activeCompareList.map((item) => {
                            const val =
                              item.snapshot?.employee_growth_percentages?.find((g) => g.timespan === 'YEAR')
                                ?.percentage ?? 0;
                            const isPositive = val >= 0;
                            return (
                              <td
                                key={item.id}
                                className={cn(
                                  "p-4 md:p-5 font-bold font-mono",
                                  val === 0
                                    ? "text-text-secondary"
                                    : isPositive
                                    ? "text-success"
                                    : "text-error"
                                )}
                              >
                                <div className="flex items-center gap-1">
                                  <TrendingUp className={cn("w-3.5 h-3.5", !isPositive && "transform rotate-180")} />
                                  <span>{isPositive ? '+' : ''}{val}%</span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>

                        {/* Total Funding */}
                        <tr>
                          <td className="p-4 md:p-5 font-bold text-white bg-white/1">Total Funding</td>
                          {activeCompareList.map((item) => {
                            const val = item.snapshot?.total_funding_usd;
                            return (
                              <td key={item.id} className="p-4 md:p-5 font-bold text-white font-mono">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3.5 h-3.5 text-accent" />
                                  <span>{val ? `$${val}M` : item.snapshot?.founded_year ? 'Bootstrapped' : 'N/A'}</span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>

                        {/* Hiring status */}
                        <tr>
                          <td className="p-4 md:p-5 font-bold text-white bg-white/1">Hiring Speed</td>
                          {activeCompareList.map((item) => {
                            const status = item.snapshot?.hiring_status;
                            return (
                              <td
                                key={item.id}
                                className={cn(
                                  "p-4 md:p-5 font-bold capitalize",
                                  status === 'active'
                                    ? 'text-success'
                                    : status === 'paused'
                                    ? 'text-warning'
                                    : 'text-text-secondary'
                                )}
                              >
                                {status === 'active' ? 'Active hiring' : status === 'paused' ? 'Paused' : 'No'}
                              </td>
                            );
                          })}
                        </tr>

                        {/* Founded Year */}
                        <tr>
                          <td className="p-4 md:p-5 font-bold text-white bg-white/1">Founded Year</td>
                          {activeCompareList.map((item) => (
                            <td key={item.id} className="p-4 md:p-5 font-mono">
                              {item.snapshot?.founded_year || 'N/A'}
                            </td>
                          ))}
                        </tr>

                        {/* HQ location */}
                        <tr>
                          <td className="p-4 md:p-5 font-bold text-white bg-white/1">Headquarters</td>
                          {activeCompareList.map((item) => (
                            <td key={item.id} className="p-4 md:p-5">
                              {item.snapshot?.location || 'N/A'}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
export default Watchlist;
