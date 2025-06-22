import React, { useState } from 'react';
import { AVSMetrics, ComponentProps } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface AVSPerformanceProps extends ComponentProps {
  avsData: AVSMetrics | null;
  isLoading: boolean;
}

const AVSPerformance: React.FC<AVSPerformanceProps> = ({
  avsData,
  isLoading,
  className = '',
}) => {
  const [selectedService, setSelectedService] = useState<'all' | 'mach' | 'vital' | 'squad'>('all');

  const formatCurrency = (amount: number) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
    return `$${amount.toFixed(2)}`;
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-400/10';
    if (score >= 70) return 'text-yellow-400 bg-yellow-400/10';
    return 'text-red-400 bg-red-400/10';
  };

  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case 'mach': return '⚡';
      case 'vital': return '💓';
      case 'squad': return '🛡️';
      default: return '🔧';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-gray-800/50 rounded-xl p-8 border border-gray-700 ${className}`}>
        <LoadingSpinner size="large" text="Loading AVS performance data..." />
      </div>
    );
  }

  if (!avsData) {
    return (
      <div className={`bg-gray-800/50 rounded-xl p-8 border border-gray-700 text-center ${className}`}>
        <p className="text-gray-400">AVS performance data not available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">AVS Performance</h2>
          <p className="text-gray-400">Swellchain Actively Validated Services monitoring</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value as any)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="all">All Services</option>
            <option value="mach">MACH</option>
            <option value="vital">VITAL</option>
            <option value="squad">SQUAD</option>
          </select>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Total Operators</h3>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-2xl font-bold text-white">{avsData.operatorCount}</p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Total Stake</h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(avsData.totalStaked)}</p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Performance Score</h3>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{avsData.performanceScore}/100</p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-400 text-sm font-medium">Uptime</h3>
            <span className="text-2xl">💚</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{avsData.uptime.toFixed(1)}%</p>
        </div>
      </div>

      {/* AVS Services Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {avsData.services
          .filter(service => selectedService === 'all' || service.name.toLowerCase() === selectedService)
          .map((service, index) => (
            <div key={`${service.name}-${index}`} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{getServiceIcon(service.name)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                    <p className="text-gray-400 text-sm">{service.description}</p>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  service.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {service.isActive ? 'active' : 'inactive'}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Response Time</span>
                  <span className="text-white">{service.performanceMetrics.responseTime}ms</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Accuracy</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          service.performanceMetrics.accuracy >= 95 ? 'bg-green-400' :
                          service.performanceMetrics.accuracy >= 90 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${service.performanceMetrics.accuracy}%` }}
                      />
                    </div>
                    <span className="text-white font-semibold">{service.performanceMetrics.accuracy.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Availability</span>
                  <span className="text-green-400">{service.performanceMetrics.availability.toFixed(2)}%</span>
                </div>
              </div>

              {/* Service-specific metrics */}
              {service.name === 'MACH' && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Fast Finality Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Block Time</span>
                      <span className="text-white">2.1s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Finality Time</span>
                      <span className="text-white">6.3s</span>
                    </div>
                  </div>
                </div>
              )}

              {service.name === 'VITAL' && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Data Availability</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">DA Score</span>
                      <span className="text-white">99.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Redundancy</span>
                      <span className="text-white">3x</span>
                    </div>
                  </div>
                </div>
              )}

              {service.name === 'SQUAD' && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Decentralized Sequencing</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sequencer Nodes</span>
                      <span className="text-white">47</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Throughput</span>
                      <span className="text-white">2,847 TPS</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Operator Performance */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Top Performing Operators</h3>
        <div className="space-y-3">
          {avsData.operators.slice(0, 5).map((operator, index) => (
            <div key={operator.address} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-white">{operator.name || 'Anonymous'}</h4>
                  <p className="text-sm text-gray-400 font-mono">
                    {operator.address.slice(0, 10)}...{operator.address.slice(-6)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-white font-semibold">{formatCurrency(operator.stake)}</p>
                  <p className="text-gray-400 text-sm">Stake</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">{operator.performanceScore}/100</p>
                  <p className="text-gray-400 text-sm">Performance</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-400 font-semibold">{operator.services.length}</p>
                  <p className="text-gray-400 text-sm">Services</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slashing Events */}
      {avsData.slashingEvents > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Slashing Risk Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <h4 className="font-medium text-white">Total Slashing Events</h4>
                  <p className="text-red-400 font-bold text-xl">{avsData.slashingEvents}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">📊</div>
                <div>
                  <h4 className="font-medium text-white">Slashing Risk Score</h4>
                  <p className="text-orange-400 font-bold text-xl">{avsData.slashingRisk}/100</p>
                </div>
              </div>
            </div>
          </div>
          
          {avsData.lastSlashing && (
            <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
              <p className="text-gray-400 text-sm">
                Last slashing event: {new Date(avsData.lastSlashing).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Network Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Rewards Distributed</span>
              <span className="text-green-400">{formatCurrency(avsData.rewards.totalRewards)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Your Rewards</span>
              <span className="text-white">{formatCurrency(avsData.rewards.userRewards)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Commission</span>
              <span className="text-white">{avsData.averageCommission.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Reward Rate</span>
              <span className="text-blue-400">{avsData.rewards.rewardRate.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Claimable Rewards</h3>
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400 mb-2">
                {formatCurrency(avsData.rewards.claimableRewards)}
              </p>
              <p className="text-gray-400 text-sm">Available to claim</p>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Next Distribution</span>
              <span className="text-gray-300">
                {new Date(avsData.rewards.nextDistribution).toLocaleDateString()}
              </span>
            </div>
            
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Claim Rewards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AVSPerformance; 