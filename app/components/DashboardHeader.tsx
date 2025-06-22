import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { AnalyticsData, RiskMetrics, ComponentProps } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface DashboardHeaderProps extends ComponentProps {
  address?: string;
  activeTab: 'overview' | 'risk' | 'portfolio' | 'avs' | 'bridge';
  setActiveTab: (tab: 'overview' | 'risk' | 'portfolio' | 'avs' | 'bridge') => void;
  analyticsData: AnalyticsData | null;
  riskMetrics: RiskMetrics | null;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  address,
  activeTab,
  setActiveTab,
  analyticsData,
  riskMetrics,
  className = '',
}) => {
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

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-green-400';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'risk', label: 'Risk Monitor', icon: '⚠️' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'avs', label: 'AVS Performance', icon: '🛡️' },
    { id: 'bridge', label: 'Cross-Chain', icon: '🌉' },
  ] as const;

  return (
    <header className={`bg-gray-900/90 backdrop-blur-md border-b border-gray-800 ${className}`}>
      <div className="container mx-auto px-4 py-4">
        {/* Top Row - Logo and Wallet Connection */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">SwellScope</h1>
                <p className="text-gray-400 text-sm">Restaking Analytics Platform</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {address && (
              <div className="text-right">
                <p className="text-gray-400 text-sm">Connected as</p>
                <p className="text-white font-mono text-sm">
                  {`${address.slice(0, 6)}...${address.slice(-4)}`}
                </p>
              </div>
            )}
            <ConnectButton />
          </div>
        </div>

        {/* Key Metrics Row */}
        {analyticsData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total TVL</p>
                  <p className="text-white text-xl font-bold">
                    {formatCurrency(analyticsData.totalTVL)}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-sm ${analyticsData.tvlChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercentage(analyticsData.tvlChange24h)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Average Yield</p>
                  <p className="text-white text-xl font-bold">
                    {analyticsData.averageYield.toFixed(2)}%
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-sm ${analyticsData.yieldChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercentage(analyticsData.yieldChange24h)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Users</p>
                  <p className="text-white text-xl font-bold">
                    {analyticsData.totalUsers.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-sm ${analyticsData.usersChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercentage(analyticsData.usersChange24h)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Risk Score</p>
                  <p className={`text-xl font-bold ${riskMetrics ? getRiskColor(riskMetrics.compositeRisk) : 'text-gray-400'}`}>
                    {riskMetrics ? `${riskMetrics.compositeRisk}/100` : '--'}
                  </p>
                </div>
                <div className="text-right">
                  {riskMetrics && (
                    <div className={`w-2 h-2 rounded-full ${
                      riskMetrics.trend === 'increasing' ? 'bg-red-400' :
                      riskMetrics.trend === 'decreasing' ? 'bg-green-400' :
                      'bg-yellow-400'
                    }`} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 bg-gray-800/30 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Network Status Indicator */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-400">Swellchain Mainnet</span>
            </div>
            <div className="text-gray-500">|</div>
            <div className="text-gray-400">
              Block: {Math.floor(Math.random() * 1000000) + 5000000}
            </div>
            <div className="text-gray-500">|</div>
            <div className="text-gray-400">
              Gas: {(Math.random() * 20 + 10).toFixed(1)} gwei
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Last updated:</span>
            <span className="text-gray-300">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader; 