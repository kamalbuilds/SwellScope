import React, { useState } from 'react';
import { AnalyticsData, ComponentProps, TimeRange } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface AnalyticsOverviewProps extends ComponentProps {
  data: AnalyticsData | null;
  isLoading: boolean;
  onRefresh: () => void;
}

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  data,
  isLoading,
  onRefresh,
  className = '',
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('24h');

  const formatCurrency = (amount: number) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
    return `$${amount.toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const timeRanges: TimeRange[] = ['1h', '24h', '7d', '30d', '90d', '1y'];

  if (isLoading) {
    return (
      <div className={`bg-gray-800/50 rounded-xl p-8 border border-gray-700 ${className}`}>
        <LoadingSpinner size="large" text="Loading analytics data..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`bg-gray-800/50 rounded-xl p-8 border border-gray-700 text-center ${className}`}>
        <p className="text-gray-400">No analytics data available</p>
        <button
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Overview</h2>
          <p className="text-gray-400">Swellchain restaking ecosystem metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <div className="flex bg-gray-800/50 rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm transition-all ${
                  selectedTimeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          
          <button
            onClick={onRefresh}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Refresh data"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Total TVL</h3>
            <div className="text-2xl">💰</div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">
              {formatCurrency(data.totalTVL)}
            </p>
            <p className={`text-sm ${data.tvlChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercentage(data.tvlChange24h)} 24h
            </p>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Active Users</h3>
            <div className="text-2xl">👥</div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">
              {data.totalUsers.toLocaleString()}
            </p>
            <p className={`text-sm ${data.usersChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercentage(data.usersChange24h)} 24h
            </p>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Average Yield</h3>
            <div className="text-2xl">📈</div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">
              {data.averageYield.toFixed(2)}%
            </p>
            <p className={`text-sm ${data.yieldChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercentage(data.yieldChange24h)} 24h
            </p>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Protocols</h3>
            <div className="text-2xl">🏗️</div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">
              {data.totalProtocols}
            </p>
            <p className={`text-sm ${data.protocolsChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercentage(data.protocolsChange24h)} 24h
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TVL Chart */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">TVL Over Time</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-2">📊</div>
              <p>Chart visualization would be rendered here</p>
              <p className="text-sm">Using Recharts or similar library</p>
            </div>
          </div>
        </div>

        {/* Yield Chart */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Yield Trends</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-2">📈</div>
              <p>Yield chart would be rendered here</p>
              <p className="text-sm">Real-time yield tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Protocols */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Top Protocols</h3>
        <div className="space-y-3">
          {data.topProtocols.map((protocol, index) => (
            <div key={protocol.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-white">{protocol.name}</h4>
                  <p className="text-sm text-gray-400 capitalize">{protocol.category}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-white">{formatCurrency(protocol.tvl)}</p>
                <p className="text-sm text-green-400">{protocol.yield.toFixed(2)}% APY</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {data.recentTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  tx.status === 'confirmed' ? 'bg-green-400' :
                  tx.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
                <div>
                  <h4 className="font-medium text-white capitalize">{tx.type}</h4>
                  <p className="text-sm text-gray-400 font-mono">
                    {`${tx.hash.slice(0, 10)}...${tx.hash.slice(-6)}`}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-white">
                  {tx.amount.toFixed(4)} {tx.token}
                </p>
                <p className="text-sm text-gray-400">
                  {new Date(tx.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview; 