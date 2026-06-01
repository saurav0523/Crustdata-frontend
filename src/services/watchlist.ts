import apiClient from './api';
import { WatchlistItem } from '@/types';

export async function listWatchlist(): Promise<WatchlistItem[]> {
  const resp = await apiClient.get<WatchlistItem[]>('/watchlist/');
  return resp.data;
}

export async function addToWatchlist(
  company_domain: string,
  company_name: string
): Promise<WatchlistItem> {
  const resp = await apiClient.post<WatchlistItem>('/watchlist/', {
    company_domain,
    company_name,
  });
  return resp.data;
}

export async function refreshWatchlistItem(itemId: number): Promise<WatchlistItem> {
  const resp = await apiClient.get<WatchlistItem>(`/watchlist/${itemId}/refresh`);
  return resp.data;
}

export async function removeFromWatchlist(itemId: number): Promise<void> {
  await apiClient.delete(`/watchlist/${itemId}`);
}
