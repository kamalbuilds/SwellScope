import { useState, useEffect, useCallback } from 'react';
import { PortfolioData, Position, Strategy, Recommendation, ApiResponse } from '../types';

interface UsePortfolioManagementReturn {
  portfolioData: PortfolioData | null;
  isLoading: boolean;
  isRebalancing: boolean;
  error: string | null;
  rebalancePortfolio: (strategyId?: string) => Promise<boolean>;
  executeRecommendation: (recommendationId: string) => Promise<boolean>;
  updateStrategy: (strategyId: string, updates: Partial<Strategy>) => Promise<boolean>;
  refreshPortfolio: () => void;
}

export function usePortfolioManagement(address?: string): UsePortfolioManagementReturn {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchPortfolioData = useCallback(async () => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/api/v1/portfolio/${address}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('swellscope_token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<PortfolioData> = await response.json();

      if (result.success && result.data) {
        setPortfolioData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch portfolio data');
      }
    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data');
    } finally {
      setIsLoading(false);
    }
  }, [address, apiUrl]);

  const rebalancePortfolio = useCallback(async (strategyId?: string): Promise<boolean> => {
    if (!address) return false;

    try {
      setIsRebalancing(true);
      setError(null);

      const response = await fetch(`${apiUrl}/api/v1/portfolio/${address}/rebalance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('swellscope_token') || ''}`,
        },
        body: JSON.stringify({ strategyId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ transactionHash: string; newAllocation: any }> = await response.json();

      if (result.success) {
        // Refresh portfolio data after successful rebalancing
        await fetchPortfolioData();
        return true;
      } else {
        throw new Error(result.error || 'Failed to rebalance portfolio');
      }
    } catch (err) {
      console.error('Error rebalancing portfolio:', err);
      setError(err instanceof Error ? err.message : 'Failed to rebalance portfolio');
      return false;
    } finally {
      setIsRebalancing(false);
    }
  }, [address, apiUrl, fetchPortfolioData]);

  const executeRecommendation = useCallback(async (recommendationId: string): Promise<boolean> => {
    if (!address) return false;

    try {
      const response = await fetch(`${apiUrl}/api/v1/portfolio/${address}/recommendations/${recommendationId}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('swellscope_token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ success: boolean }> = await response.json();

      if (result.success) {
        // Refresh portfolio data after executing recommendation
        await fetchPortfolioData();
        return true;
      } else {
        throw new Error(result.error || 'Failed to execute recommendation');
      }
    } catch (err) {
      console.error('Error executing recommendation:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute recommendation');
      return false;
    }
  }, [address, apiUrl, fetchPortfolioData]);

  const updateStrategy = useCallback(async (strategyId: string, updates: Partial<Strategy>): Promise<boolean> => {
    if (!address) return false;

    try {
      const response = await fetch(`${apiUrl}/api/v1/portfolio/${address}/strategies/${strategyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('swellscope_token') || ''}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<Strategy> = await response.json();

      if (result.success && result.data) {
        // Update the strategy in the portfolio data
        setPortfolioData(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            strategies: prev.strategies.map(strategy =>
              strategy.id === strategyId 
                ? { ...strategy, ...result.data }
                : strategy
            ),
          };
        });
        return true;
      } else {
        throw new Error(result.error || 'Failed to update strategy');
      }
    } catch (err) {
      console.error('Error updating strategy:', err);
      setError(err instanceof Error ? err.message : 'Failed to update strategy');
      return false;
    }
  }, [address, apiUrl]);

  const refreshPortfolio = useCallback(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  // Initial data fetch
  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  // Set up periodic refresh every 60 seconds
  useEffect(() => {
    if (!address) return;

    const interval = setInterval(() => {
      fetchPortfolioData();
    }, 60000);

    return () => clearInterval(interval);
  }, [address, fetchPortfolioData]);

  return {
    portfolioData,
    isLoading,
    isRebalancing,
    error,
    rebalancePortfolio,
    executeRecommendation,
    updateStrategy,
    refreshPortfolio,
  };
} 