import { useState, useEffect, useCallback } from 'react';
import { RiskMetrics, RiskAlert, RiskProfile, ApiResponse } from '../types';

interface UseRiskAssessmentReturn {
  riskMetrics: RiskMetrics | null;
  riskAlerts: RiskAlert[];
  riskProfile: RiskProfile | null;
  isLoadingRisk: boolean;
  error: string | null;
  updateRiskProfile: (profile: Partial<RiskProfile>) => Promise<boolean>;
  markAlertAsRead: (alertId: string) => void;
  refreshRiskData: () => void;
}

export function useRiskAssessment(address?: string): UseRiskAssessmentReturn {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
  const [isLoadingRisk, setIsLoadingRisk] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchRiskData = useCallback(async () => {
    if (!address) {
      setIsLoadingRisk(false);
      return;
    }

    try {
      setIsLoadingRisk(true);
      setError(null);

      // Parallel fetch of risk data
      const [metricsResponse, alertsResponse, profileResponse] = await Promise.all([
        fetch(`${apiUrl}/api/v1/risk/metrics/${address}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('swellscope_token') || ''}`,
          },
        }),
        fetch(`${apiUrl}/api/v1/risk/alerts/${address}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('swellscope_token') || ''}`,
          },
        }),
        fetch(`${apiUrl}/api/v1/risk/profile/${address}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('swellscope_token') || ''}`,
          },
        }),
      ]);

      // Process risk metrics
      if (metricsResponse.ok) {
        const metricsResult: ApiResponse<RiskMetrics> = await metricsResponse.json();
        if (metricsResult.success && metricsResult.data) {
          setRiskMetrics(metricsResult.data);
        }
      }

      // Process risk alerts
      if (alertsResponse.ok) {
        const alertsResult: ApiResponse<RiskAlert[]> = await alertsResponse.json();
        if (alertsResult.success && alertsResult.data) {
          setRiskAlerts(alertsResult.data);
        }
      }

      // Process risk profile
      if (profileResponse.ok) {
        const profileResult: ApiResponse<RiskProfile> = await profileResponse.json();
        if (profileResult.success && profileResult.data) {
          setRiskProfile(profileResult.data);
        }
      }

    } catch (err) {
      console.error('Error fetching risk data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch risk data');
    } finally {
      setIsLoadingRisk(false);
    }
  }, [address, apiUrl]);

  const updateRiskProfile = useCallback(async (profileUpdates: Partial<RiskProfile>): Promise<boolean> => {
    if (!address) return false;

    try {
      const response = await fetch(`${apiUrl}/api/v1/risk/profile/${address}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('swellscope_token') || ''}`,
        },
        body: JSON.stringify(profileUpdates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<RiskProfile> = await response.json();

      if (result.success && result.data) {
        setRiskProfile(result.data);
        return true;
      } else {
        throw new Error(result.error || 'Failed to update risk profile');
      }
    } catch (err) {
      console.error('Error updating risk profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update risk profile');
      return false;
    }
  }, [address, apiUrl]);

  const markAlertAsRead = useCallback((alertId: string) => {
    setRiskAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, isRead: true }
          : alert
      )
    );

    // Also update on server
    fetch(`${apiUrl}/api/v1/risk/alerts/${alertId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('swellscope_token') || ''}`,
      },
    }).catch(err => console.error('Error marking alert as read:', err));
  }, [apiUrl]);

  const refreshRiskData = useCallback(() => {
    fetchRiskData();
  }, [fetchRiskData]);

  // Initial data fetch
  useEffect(() => {
    fetchRiskData();
  }, [fetchRiskData]);

  // Set up more frequent refresh for risk data (every 10 seconds)
  useEffect(() => {
    if (!address) return;

    const interval = setInterval(() => {
      fetchRiskData();
    }, 10000);

    return () => clearInterval(interval);
  }, [address, fetchRiskData]);

  return {
    riskMetrics,
    riskAlerts,
    riskProfile,
    isLoadingRisk,
    error,
    updateRiskProfile,
    markAlertAsRead,
    refreshRiskData,
  };
} 