// Global TypeScript definitions for IntelliScope Dashboard

export interface GrowthPercentage {
  timespan: string; // "SIX_MONTHS" | "YEAR" | "TWO_YEAR"
  percentage: number;
}

export interface RevenueDetail {
  amount: number;
  unit: string; // "THOUSAND" | "MILLION" | "BILLION"
  currencyCode: string;
}

export interface RevenueRange {
  estimatedMinRevenue?: RevenueDetail;
  estimatedMaxRevenue?: RevenueDetail;
}

export interface LogoUrls {
  "100x100"?: string;
  "200x200"?: string;
  "400x400"?: string;
}

export interface Headquarters {
  country?: string;
  city?: string;
}

export interface Company {
  name: string;
  description: string;
  linkedin_company_url: string;
  linkedin_company_id?: string;
  website: string;
  industry: string;
  company_type?: string;
  founded_year?: number;
  location?: string;
  headquarters?: Headquarters;
  employee_count: number;
  employee_count_range?: string;
  employee_growth_percentages: GrowthPercentage[];
  specialties?: string[];
  revenue_range?: RevenueRange;
  decision_makers_count?: string;
  logo_urls?: LogoUrls;
  
  // Custom helper properties for frontend UI display
  total_funding_usd?: number; // In millions
  hiring_status?: "active" | "paused" | "no";
  recent_signals?: string[];
  technologies?: string[];
}

export interface SavedSearch {
  id: number;
  name: string;
  filters: {
    query?: string;
    industry?: string;
    min_headcount?: number;
    min_funding?: number;
    [key: string]: any;
  };
  created_at: string;
  last_run_at: string | null;
}

export interface WatchlistItem {
  id: number;
  company_domain: string;
  company_name: string;
  snapshot: Company | null;
  added_at: string;
}

export interface Alert {
  id: number;
  company_domain: string;
  company_name: string;
  alert_type: string; // "headcount_growth" | "funding" | "hiring"
  threshold: {
    value?: number;
    [key: string]: any;
  } | null;
  status: string; // "ACTIVE" | "PAUSED"
  last_triggered_at: string | null;
  created_at: string;
  notify_email?: string | null;
  notify_webhook?: string | null;
}

export interface QuickStats {
  totalCompanies: number;
  watchlisted: number;
  growthOpportunities: number;
  activeAlerts: number;
}
