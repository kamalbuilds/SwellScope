import { useState, useEffect, useCallback } from 'react';
import { AnalyticsData, ApiResponse } from '../types';

interface UseSwellScopeDataReturn {
  analyticsData: AnalyticsData | null;
  isLoadingAnalytics: boolean;
  error: string | null;
  refreshAnalytics: () => void;
  lastUpdate: number | null;
}

export function useSwellScopeData(address?: string): UseSwellScopeDataReturn {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchAnalytics = useCallback(async () => {
    if (!address) {
      setIsLoadingAnalytics(false);
      return;
    }

    try {
      setIsLoadingAnalytics(true);
      setError(null);

      const response = await fetch(`${apiUrl}/api/v1/analytics/overview`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('swellscope_token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<AnalyticsData> = await response.json();

      if (result.success && result.data) {
        setAnalyticsData(result.data);
        setLastUpdate(Date.now());
      } else {
        throw new Error(result.error || 'Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [address, apiUrl]);

  const refreshAnalytics = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Initial data fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Set up periodic refresh every 30 seconds
  useEffect(() => {
    if (!address) return;

    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, [address, fetchAnalytics]);

  // Real-time updates via WebSocket would be handled in parent component
  // This hook focuses on HTTP API data fetching

  return {
    analyticsData,
    isLoadingAnalytics,
    error,
    refreshAnalytics,
    lastUpdate,
  };
} 