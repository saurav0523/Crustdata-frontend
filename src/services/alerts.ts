import apiClient from './api';
import { Alert } from '@/types';

export interface AlertInput {
  company_domain: string;
  company_name: string;
  alert_type: string; // "headcount_growth" | "funding" | "hiring"
  threshold?: Record<string, any> | null;
  notify_email?: string | null;
  notify_webhook?: string | null;
}

export async function listAlerts(): Promise<Alert[]> {
  const resp = await apiClient.get<Alert[]>('/alerts/');
  return resp.data;
}

export async function createAlert(input: AlertInput): Promise<Alert> {
  const resp = await apiClient.post<Alert>('/alerts/', input);
  return resp.data;
}

export async function pauseAlert(alertId: number): Promise<Alert> {
  const resp = await apiClient.patch<Alert>(`/alerts/${alertId}/pause`);
  return resp.data;
}

export async function resumeAlert(alertId: number): Promise<Alert> {
  const resp = await apiClient.patch<Alert>(`/alerts/${alertId}/resume`);
  return resp.data;
}

export async function deleteAlert(alertId: number): Promise<void> {
  await apiClient.delete(`/alerts/${alertId}`);
}
