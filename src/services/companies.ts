import apiClient from './api';
import { Company, SavedSearch } from '@/types';

export interface SearchFilters {
  query?: string;
  industry?: string;
  min_headcount?: number;
  min_funding?: number; // In millions USD
  hiring_status?: string;
  yc_only?: boolean;
  offset?: number;
  count?: number;
}

export interface SearchResponse {
  results: Company[];
  count: number;
}

/**
 * Enrich a single company by domain using the live API.
 */
export async function enrichCompany(domain: string): Promise<Company> {
  const resp = await apiClient.get<Company>('/companies/enrich', {
    params: { domain },
  });
  return resp.data;
}

/**
 * Search companies with filters using the live API.
 */
export async function searchCompanies(filters: SearchFilters): Promise<SearchResponse> {
  const resp = await apiClient.post<{ results: any[]; count: number }>(
    '/companies/search',
    {
      query: filters.query || '',
      industry: filters.industry || '',
      min_headcount: filters.min_headcount || 0,
      min_funding: filters.min_funding || 0,
      hiring_status: filters.hiring_status || 'all',
      yc_only: filters.yc_only || false,
      offset: filters.offset || 0,
      count: filters.count,
    }
  );
  
  if (resp.data && Array.isArray(resp.data.results)) {
    return {
      results: resp.data.results,
      count: resp.data.count,
    };
  }
  throw new Error('Invalid response structure from backend');
}

/**
 * Saved Searches CRUD
 */
export async function listSavedSearches(): Promise<SavedSearch[]> {
  const resp = await apiClient.get<SavedSearch[]>('/companies/saved-searches');
  return resp.data;
}

export async function createSavedSearch(name: string, filters: any): Promise<SavedSearch> {
  const resp = await apiClient.post<SavedSearch>('/companies/saved-searches', {
    name,
    filters,
  });
  return resp.data;
}

export async function runSavedSearch(id: number): Promise<SearchResponse> {
  const resp = await apiClient.post<any>(`/companies/saved-searches/${id}/run`);
  return {
    results: resp.data.results,
    count: resp.data.count,
  };
}

export async function deleteSavedSearch(id: number): Promise<void> {
  await apiClient.delete(`/companies/saved-searches/${id}`);
}
