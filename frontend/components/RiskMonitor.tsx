import React, { useState } from 'react';
import { RiskMetrics, RiskProfile, ComponentProps } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface RiskMonitorProps extends ComponentProps {
  riskMetrics: RiskMetrics | null;
  isLoading: boolean;
  detailed?: boolean;
  onUpdateProfile?: (profile: Partial<RiskProfile>) => Promise<boolean>;
}

const RiskMonitor: React.FC<RiskMonitorProps> = ({
  riskMetrics,
  isLoading,
  detailed = false,
  onUpdateProfile,
  className = '',
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [newRiskTolerance, setNewRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-400 bg-red-400/10 border-red-400/20';
    if (score >= 60) return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    if (score >= 40) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-green-400 bg-green-400/10 border-green-400/20';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return 'High Risk';
    if (score >= 60) return 'Medium Risk';
    if (score >= 40) return 'Low Risk';
    return 'Very Low Risk';
  };

  const handleUpdateRiskProfile = async () => {
    if (!onUpdateProfile) return;
    
    const success = await onUpdateProfile({
      riskTolerance: newRiskTolerance,
      maxRiskScore: newRiskTolerance === 'conservative' ? 40 : newRiskTolerance === 'moderate' ? 70 : 90,
    });
    
    if (success) {
      setShowSettings(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-gray-800/50 rounded-xl p-8 border border-gray-700 ${className}`}>
        <LoadingSpinner size="large" text="Loading risk data..." />
      </div>
    );
  }

  if (!riskMetrics) {
    return (
      <div className={`bg-gray-800/50 rounded-xl p-8 border border-gray-700 text-center ${className}`}>
        <p className="text-gray-400">Risk metrics not available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Risk Monitor</h2>
          <p className="text-gray-400">Real-time risk assessment and monitoring</p>
        </div>
        
        {detailed && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Settings
          </button>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && detailed && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Profile Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Risk Tolerance
              </label>
              <select
                value={newRiskTolerance}
                onChange={(e) => setNewRiskTolerance(e.target.value as any)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="conservative">Conservative (Low Risk)</option>
                <option value="moderate">Moderate (Medium Risk)</option>
                <option value="aggressive">Aggressive (High Risk)</option>
              </select>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleUpdateRiskProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Profile
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Risk Score */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Composite Risk Score</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(riskMetrics.compositeRisk)}`}>
            {getRiskLabel(riskMetrics.compositeRisk)}
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-bold text-white">{riskMetrics.compositeRisk}/100</span>
              <div className={`flex items-center space-x-1 text-sm ${
                riskMetrics.trend === 'increasing' ? 'text-red-400' :
                riskMetrics.trend === 'decreasing' ? 'text-green-400' : 'text-yellow-400'
              }`}>
                <span>{riskMetrics.trend === 'increasing' ? '↗️' : riskMetrics.trend === 'decreasing' ? '↘️' : '➡️'}</span>
                <span className="capitalize">{riskMetrics.trend}</span>
              </div>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  riskMetrics.compositeRisk >= 80 ? 'bg-red-400' :
                  riskMetrics.compositeRisk >= 60 ? 'bg-orange-400' :
                  riskMetrics.compositeRisk >= 40 ? 'bg-yellow-400' : 'bg-green-400'
                }`}
                style={{ width: `${riskMetrics.compositeRisk}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factor Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-300">Slashing Risk</h4>
            <span className="text-2xl">⚔️</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">{riskMetrics.slashingRisk}/100</span>
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-red-400 transition-all duration-300"
                style={{ width: `${riskMetrics.slashingRisk}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-300">Liquidity Risk</h4>
            <span className="text-2xl">💧</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">{riskMetrics.liquidityRisk}/100</span>
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-400 transition-all duration-300"
                style={{ width: `${riskMetrics.liquidityRisk}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-300">Smart Contract Risk</h4>
            <span className="text-2xl">🔒</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">{riskMetrics.smartContractRisk}/100</span>
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-purple-400 transition-all duration-300"
                style={{ width: `${riskMetrics.smartContractRisk}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-300">Market Risk</h4>
            <span className="text-2xl">📈</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">{riskMetrics.marketRisk}/100</span>
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-green-400 transition-all duration-300"
                style={{ width: `${riskMetrics.marketRisk}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-300">Correlation Risk</h4>
            <span className="text-2xl">🔗</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">{riskMetrics.correlationRisk}/100</span>
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${riskMetrics.correlationRisk}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors Detail */}
      {detailed && riskMetrics.riskFactors.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Factor Analysis</h3>
          <div className="space-y-3">
            {riskMetrics.riskFactors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-white">{factor.name}</h4>
                  <p className="text-sm text-gray-400">{factor.description}</p>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    factor.impact === 'positive' ? 'text-green-400' :
                    factor.impact === 'negative' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {factor.score}/100
                  </div>
                  <div className="text-xs text-gray-400">
                    Weight: {(factor.weight * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Update */}
      <div className="text-center text-sm text-gray-400">
        Last updated: {new Date(riskMetrics.lastUpdate).toLocaleString()}
      </div>
    </div>
  );
};

export default RiskMonitor; 