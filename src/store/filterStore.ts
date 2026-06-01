import { create } from 'zustand';

export interface FilterState {
  query: string;
  selectedIndustries: string[];
  minFunding: number; // in Millions USD
  maxFunding: number;
  minHeadcount: number;
  maxHeadcount: number;
  minGrowth: number; // in %
  hiringStatus: 'all' | 'active' | 'paused' | 'no';
  ycOnly: boolean;
  
  setQuery: (query: string) => void;
  toggleIndustry: (industry: string) => void;
  setSelectedIndustries: (industries: string[]) => void;
  setFundingRange: (min: number, max: number) => void;
  setHeadcountRange: (min: number, max: number) => void;
  setMinGrowth: (growth: number) => void;
  setHiringStatus: (status: 'all' | 'active' | 'paused' | 'no') => void;
  setYcOnly: (ycOnly: boolean) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  query: '',
  selectedIndustries: [],
  minFunding: 0,
  maxFunding: 5000, // 5B
  minHeadcount: 0,
  maxHeadcount: 10000, // 10k
  minGrowth: -50,
  hiringStatus: 'all',
  ycOnly: false,
  
  setQuery: (query) => set({ query }),
  toggleIndustry: (industry) => set((state) => ({
    selectedIndustries: state.selectedIndustries.includes(industry)
      ? state.selectedIndustries.filter((i) => i !== industry)
      : [...state.selectedIndustries, industry]
  })),
  setSelectedIndustries: (selectedIndustries) => set({ selectedIndustries }),
  setFundingRange: (minFunding, maxFunding) => set({ minFunding, maxFunding }),
  setHeadcountRange: (minHeadcount, maxHeadcount) => set({ minHeadcount, maxHeadcount }),
  setMinGrowth: (minGrowth) => set({ minGrowth }),
  setHiringStatus: (hiringStatus) => set({ hiringStatus }),
  setYcOnly: (ycOnly) => set({ ycOnly }),
  resetFilters: () => set({
    query: '',
    selectedIndustries: [],
    minFunding: 0,
    maxFunding: 5000,
    minHeadcount: 0,
    maxHeadcount: 10000,
    minGrowth: -50,
    hiringStatus: 'all',
    ycOnly: false,
  })
}));
