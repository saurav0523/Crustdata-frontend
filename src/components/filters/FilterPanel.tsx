import { useState } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { DoubleSlider } from '@/components/ui/DoubleSlider';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { createSavedSearch } from '@/services/companies';
import { Search, RotateCcw, Save, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export function FilterPanel() {
  const queryClient = useQueryClient();
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
    toggleIndustry,
    setSelectedIndustries,
    setFundingRange,
    setHeadcountRange,
    setHiringStatus,
    setYcOnly,
    resetFilters
  } = useFilterStore();

  const [saveNameOpen, setSaveNameOpen] = useState(false);
  const [searchSaveName, setSearchSaveName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Available industry choices in the system
  const industryOptions = [
    'Software Development',
    'Financial Services',
    'Design Services',
    'Artificial Intelligence',
    'Education'
  ];

  // Sliders formats
  const formatFunding = (v: number) => {
    if (v === 0) return '$0';
    if (v >= 1000) return `$${(v / 1000).toFixed(1).replace(/\.0$/, '')}B`;
    return `$${v}M`;
  };

  const formatHeadcount = (v: number) => {
    if (v === 0) return '0';
    if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    return v.toString();
  };

  // Connect filters saving to the backend
  const handleSaveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchSaveName.trim()) return;

    setIsSaving(true);
    try {
      const activeFilters = {
        query,
        industry: selectedIndustries.join(','),
        min_headcount: minHeadcount,
        min_funding: minFunding
      };

      await createSavedSearch(searchSaveName, activeFilters);
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] });
      toast.success(`Filters saved as "${searchSaveName}"`);
      setSearchSaveName('');
      setSaveNameOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const hiringStatusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Hiring' },
    { value: 'paused', label: 'Paused' },
    { value: 'no', label: 'Closed' }
  ] as const;

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-6 w-full shadow-md">
      {/* Top Filter Header (Title + Actions) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/6">
        <div>
          <h3 className="text-[14px] font-extrabold text-white">Search Filters</h3>
          <p className="text-[10.5px] text-text-secondary mt-0.5">Filter 95+ data signals instantly</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/6 hover:border-white/10 bg-white/2 hover:bg-white/4 text-text-secondary hover:text-white transition text-[11.5px] font-semibold cursor-pointer outline-none"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {/* Save Search Toggle */}
          <button
            onClick={() => setSaveNameOpen(!saveNameOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 border border-accent/25 hover:bg-accent/20 text-accent transition text-[11.5px] font-semibold cursor-pointer outline-none"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Search</span>
          </button>
        </div>
      </div>

      {/* Save Search Modal overlay mini form */}
      {saveNameOpen && (
        <form onSubmit={handleSaveSearch} className="p-4 rounded-xl bg-white/2 border border-white/6 flex flex-col sm:flex-row items-end gap-3.5 animate-in fade-in duration-200">
          <div className="flex flex-col gap-1.5 grow w-full">
            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Saved Search Label Name
            </label>
            <input
              type="text"
              placeholder="e.g. High Growth SaaS, AI Seed Round"
              value={searchSaveName}
              onChange={(e) => setSearchSaveName(e.target.value)}
              className="w-full bg-[#16181D] border border-white/6 rounded-lg p-2.5 text-[12.5px] outline-none focus:border-accent text-white"
              required
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="submit"
              disabled={isSaving}
              className="py-2.5 px-4 bg-accent hover:bg-accent/90 disabled:bg-accent/40 text-white rounded-lg text-[12px] font-bold flex items-center justify-center gap-1.5 grow cursor-pointer shadow-lg shadow-accent/10"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={() => setSaveNameOpen(false)}
              className="py-2.5 px-3 bg-white/2 border border-white/6 hover:bg-white/4 text-text-secondary hover:text-white rounded-lg text-[12px] font-bold grow"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filters Core Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
        {/* Keyword Search */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-[12px] font-bold text-text-secondary">Text Query</label>
          <div className="flex items-center px-3.5 rounded-xl border border-white/6 bg-surface/50 h-[42px] transition focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/35">
            <Search className="w-4 h-4 text-text-secondary mr-2.5 shrink-0" />
            <input
              type="text"
              placeholder="Search domain, name, founder..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-0 outline-none text-[13px] placeholder:text-text-secondary focus:ring-0 p-0 text-white"
            />
          </div>
        </div>

        {/* Industry Multi-select */}
        <MultiSelect
          label="Industries"
          options={industryOptions}
          selected={selectedIndustries}
          onChange={setSelectedIndustries}
          placeholder="Filter sectors..."
        />

        {/* Headcount DoubleSlider */}
        <DoubleSlider
          label="Headcount (Employees)"
          min={0}
          max={10000}
          step={100}
          value={[minHeadcount, maxHeadcount]}
          onChange={([min, max]) => setHeadcountRange(min, max)}
          formatValue={formatHeadcount}
        />

        {/* Funding DoubleSlider */}
        <DoubleSlider
          label="Funding Received"
          min={0}
          max={5000}
          step={50}
          value={[minFunding, maxFunding]}
          onChange={([min, max]) => setFundingRange(min, max)}
          formatValue={formatFunding}
        />
      </div>

      {/* Bottom Row - Hiring Status + YC Toggle */}
      <div className="flex flex-col gap-4 border-t border-white/6 pt-4.5 mt-2">
        {/* Hiring Status */}
        <div className="flex flex-col gap-2">
          <label className="text-[11.5px] font-bold text-text-secondary uppercase tracking-wider">
            Hiring Signal Status
          </label>
          <div className="flex flex-wrap gap-1.5">
            {hiringStatusOptions.map((opt) => {
              const isActive = hiringStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setHiringStatus(opt.value)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[12px] font-semibold transition border cursor-pointer outline-none",
                    isActive
                      ? "bg-accent/15 border-accent/25 text-white"
                      : "bg-white/2 border-white/4 text-text-secondary hover:text-white hover:bg-white/4"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}

            {/* YC toggle inline with hiring status pills */}
            <button
              onClick={() => setYcOnly(!ycOnly)}
              className={cn(
                "px-4 py-2 rounded-xl text-[12px] font-semibold transition border cursor-pointer outline-none flex items-center gap-1.5",
                ycOnly
                  ? "bg-orange-500/15 border-orange-500/30 text-orange-400"
                  : "bg-white/2 border-white/4 text-text-secondary hover:text-white hover:bg-white/4"
              )}
            >
              <span>🧡</span>
              <span>YC / Startups Only</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default FilterPanel;
