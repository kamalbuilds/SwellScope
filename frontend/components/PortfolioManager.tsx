import React, { useState } from 'react';
import { PortfolioData, Position, Strategy, ComponentProps } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface PortfolioManagerProps extends ComponentProps {
  portfolioData: PortfolioData | null;
  onRebalance: (strategyId?: string) => Promise<boolean>;
  isRebalancing: boolean;
}

const PortfolioManager: React.FC<PortfolioManagerProps> = ({
  portfolioData,
  onRebalance,
  isRebalancing,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'strategies' | 'performance'>('positions');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');

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

  const handleRebalance = async () => {
    await onRebalance(selectedStrategy || undefined);
  };

  if (!portfolioData) {
    return (
      <div className={`bg-gray-800/50 rounded-xl p-8 border border-gray-700 text-center ${className}`}>
        <p className="text-gray-400">Connect your wallet to view portfolio</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Portfolio Header */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Total Value</h3>
            <p className="text-2xl font-bold text-white">{formatCurrency(portfolioData.totalValue)}</p>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Total Staked</h3>
            <p className="text-2xl font-bold text-white">{formatCurrency(portfolioData.totalStaked)}</p>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Total Earnings</h3>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(portfolioData.totalEarnings)}</p>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Average Yield</h3>
            <p className="text-2xl font-bold text-blue-400">{portfolioData.averageYield.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-800/30 rounded-lg p-1">
        {[
          { id: 'positions', label: 'Positions', icon: '💼' },
          { id: 'strategies', label: 'Strategies', icon: '🎯' },
          { id: 'performance', label: 'Performance', icon: '📊' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Positions Tab */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
          {portfolioData.positions.map((position) => (
            <div key={position.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">{position.token.slice(0, 2)}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{position.protocolName}</h3>
                    <p className="text-gray-400">{position.token} • {position.allocation.toFixed(1)}% allocation</p>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  position.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {position.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Amount</p>
                  <p className="text-white font-semibold">{position.amount.toFixed(4)} {position.token}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Value</p>
                  <p className="text-white font-semibold">{formatCurrency(position.value)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">APY</p>
                  <p className="text-green-400 font-semibold">{position.apy.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Earnings (24h)</p>
                  <p className={`font-semibold ${position.earningsChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercentage(position.earningsChange24h)}
                  </p>
                </div>
              </div>

              {position.lockupPeriod && (
                <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <p className="text-yellow-400 text-sm">
                    🔒 Locked for {position.lockupPeriod} days
                    {position.unlockDate && ` • Unlocks ${new Date(position.unlockDate).toLocaleDateString()}`}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Strategies Tab */}
      {activeTab === 'strategies' && (
        <div className="space-y-6">
          {/* Rebalance Section */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Portfolio Rebalancing</h3>
            <div className="flex items-center space-x-4">
              <select
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Auto-optimize allocation</option>
                {portfolioData.strategies.map((strategy) => (
                  <option key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleRebalance}
                disabled={isRebalancing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isRebalancing && <LoadingSpinner size="small" />}
                <span>{isRebalancing ? 'Rebalancing...' : 'Rebalance Portfolio'}</span>
              </button>
            </div>
            
            <p className="text-gray-400 text-sm mt-2">
              Last rebalance: {new Date(portfolioData.lastRebalance).toLocaleDateString()}
            </p>
          </div>

          {/* Active Strategies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolioData.strategies.map((strategy) => (
              <div key={strategy.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{strategy.name}</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    strategy.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {strategy.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-4">{strategy.description}</p>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk Score</span>
                    <span className="text-white">{strategy.riskScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expected Yield</span>
                    <span className="text-green-400">{strategy.expectedYield.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Allocation</span>
                    <span className="text-white">{strategy.allocation.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Management Fee</span>
                    <span className="text-white">{strategy.fees.managementFee.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
              <h3 className="text-gray-400 text-sm mb-2">Total Return</h3>
              <p className={`text-2xl font-bold ${portfolioData.performance.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercentage(portfolioData.performance.totalReturn)}
              </p>
              <p className="text-gray-400 text-sm">{formatCurrency(portfolioData.performance.totalReturnUSD)}</p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
              <h3 className="text-gray-400 text-sm mb-2">Annualized Return</h3>
              <p className={`text-2xl font-bold ${portfolioData.performance.annualizedReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercentage(portfolioData.performance.annualizedReturn)}
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
              <h3 className="text-gray-400 text-sm mb-2">Sharpe Ratio</h3>
              <p className="text-2xl font-bold text-white">
                {portfolioData.performance.sharpeRatio.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Performance Chart Placeholder */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Portfolio Performance</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-2">📈</div>
                <p>Performance chart would be rendered here</p>
                <p className="text-sm">Real-time portfolio value tracking</p>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Risk Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Drawdown</span>
                  <span className="text-red-400">{formatPercentage(portfolioData.performance.maxDrawdown)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Volatility</span>
                  <span className="text-white">{formatPercentage(portfolioData.performance.volatility)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Portfolio Risk Score</span>
                  <span className="text-yellow-400">{portfolioData.riskScore}/100</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Trading Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-green-400">{formatPercentage(portfolioData.performance.winRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Profit Factor</span>
                  <span className="text-white">{portfolioData.performance.profitFactor.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Best Day</span>
                  <span className="text-green-400">{formatPercentage(portfolioData.performance.bestDay)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Worst Day</span>
                  <span className="text-red-400">{formatPercentage(portfolioData.performance.worstDay)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {portfolioData.recommendations.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Optimization Recommendations</h3>
          <div className="space-y-3">
            {portfolioData.recommendations.map((rec) => (
              <div key={rec.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-white">{rec.title}</h4>
                  <p className="text-sm text-gray-400">{rec.description}</p>
                  <p className="text-xs text-green-400 mt-1">
                    Est. gain: {formatPercentage(rec.estimatedGain)} • Risk: {rec.estimatedRisk}/100
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded text-xs ${
                    rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {rec.priority} priority
                  </div>
                  
                  {rec.autoExecutable && (
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
                      Execute
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager; 