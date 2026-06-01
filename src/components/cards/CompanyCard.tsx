import { motion } from 'framer-motion';
import { Star, ArrowUpRight, TrendingUp, Users, DollarSign, Building } from 'lucide-react';
import { Company } from '@/types';
import { formatCompactNumber, formatCurrency } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

interface CompanyCardProps {
  company: Company & { domain: string };
  isWatchlisted: boolean;
  onWatchlistToggle: () => void;
  isLoadingWatchlist?: boolean;
}

export function CompanyCard({
  company,
  isWatchlisted,
  onWatchlistToggle,
  isLoadingWatchlist = false
}: CompanyCardProps) {
  const { openDetailsDrawer } = useUIStore();

  // Find the annual growth percentage (YEAR timespan)
  const annualGrowth = company.employee_growth_percentages?.find(
    (g) => g.timespan === 'YEAR'
  )?.percentage ?? 0;

  const isGrowthPositive = annualGrowth >= 0;

  // Format funding readout
  const fundingText = company.total_funding_usd
    ? formatCurrency(company.total_funding_usd * 1_000_000)
    : company.founded_year
    ? 'Bootstrapped'
    : 'N/A';

  // Get initial letters for logo placeholder
  const initials = company.name ? company.name.slice(0, 2).toUpperCase() : 'CO';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="glass-panel hover:glass-panel-elevated glow-border rounded-2xl p-5 flex flex-col justify-between h-[250px] relative overflow-hidden group shadow-lg cursor-pointer"
      onClick={() => openDetailsDrawer(company.domain)}
    >
      {/* Glow highlight inside */}
      <div className="absolute inset-0 bg-gradient-to-tr from-accent/0 via-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Card Header (Logo + Name + Actions) */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Logo container */}
          <div className="w-12 h-12 rounded-xl bg-white/4 border border-white/6 flex items-center justify-center font-bold text-[15px] shrink-0 overflow-hidden text-accent">
            {company.logo_urls?.['200x200'] ? (
              <img
                src={company.logo_urls['200x200']}
                alt={`${company.name} logo`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              initials
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-[14.5px] font-bold text-white group-hover:text-accent transition truncate leading-snug">
              {company.name}
            </h3>
            <span className="text-[11.5px] text-text-secondary truncate">{company.domain}</span>
          </div>
        </div>

        {/* Watchlist Toggle Button */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Avoid triggering openDetailsDrawer
            onWatchlistToggle();
          }}
          disabled={isLoadingWatchlist}
          className={cn(
            "p-2 rounded-xl border transition cursor-pointer",
            isWatchlisted
              ? "bg-accent/15 border-accent/30 text-accent hover:bg-accent/25"
              : "bg-white/3 border-white/6 text-text-secondary hover:text-white hover:bg-white/5"
          )}
        >
          <Star className={cn("w-4 h-4", isWatchlisted && "fill-accent")} />
        </button>
      </div>

      {/* Card Body (Industry tag) */}
      <div className="flex items-center gap-1.5 mt-3 relative z-10">
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/4 border border-white/6 text-[10.5px] font-medium text-text-secondary">
          <Building className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate max-w-[150px]">{company.industry}</span>
        </div>

        {/* Growth pill */}
        {annualGrowth !== 0 && (
          <div
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold border",
              isGrowthPositive
                ? "bg-success/8 border-success/15 text-success"
                : "bg-error/8 border-error/15 text-error"
            )}
          >
            <TrendingUp className={cn("w-3.5 h-3.5 shrink-0", !isGrowthPositive && "transform rotate-180")} />
            <span>{isGrowthPositive ? '+' : ''}{annualGrowth}% YoY</span>
          </div>
        )}
      </div>

      {/* Card Footer (Key Stats Grid) */}
      <div className="grid grid-cols-2 gap-4 border-t border-white/6 pt-4.5 mt-4 relative z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-text-secondary mb-1">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Headcount</span>
          </div>
          <span className="text-[13px] font-bold text-white font-mono leading-none">
            {formatCompactNumber(company.employee_count)}
          </span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-text-secondary mb-1">
            <DollarSign className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Total Funding</span>
          </div>
          <span className="text-[13px] font-bold text-white font-mono leading-none">
            {fundingText}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
export default CompanyCard;
