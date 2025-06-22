import React, { useState } from 'react';
import { CrossChainPosition, BridgeOperation, ComponentProps } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface CrossChainBridgeProps extends ComponentProps {
  positions: CrossChainPosition[];
  operations: BridgeOperation[];
  isLoading: boolean;
  onBridge: (fromChain: number, toChain: number, token: string, amount: number) => Promise<boolean>;
}

const CrossChainBridge: React.FC<CrossChainBridgeProps> = ({
  positions,
  operations,
  isLoading,
  onBridge,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'bridge' | 'history'>('positions');
  const [bridgeForm, setBridgeForm] = useState({
    fromChain: 1,
    toChain: 1101, // Polygon zkEVM
    token: 'swETH',
    amount: '',
  });
  const [isBridging, setIsBridging] = useState(false);

  const formatCurrency = (amount: number) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
    return `$${amount.toFixed(2)}`;
  };

  const getChainName = (chainId: number) => {
    const chains: Record<number, string> = {
      1: 'Ethereum',
      1101: 'Swellchain',
      10: 'Optimism',
      42161: 'Arbitrum',
      137: 'Polygon',
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  const getChainIcon = (chainId: number) => {
    const icons: Record<number, string> = {
      1: '🔷',
      1101: '🌊',
      10: '🔴',
      42161: '🔵',
      137: '🟣',
    };
    return icons[chainId] || '⚪';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'confirmed':
        return 'text-green-400 bg-green-400/10';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'failed':
      case 'cancelled':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const handleBridge = async () => {
    if (!bridgeForm.amount || parseFloat(bridgeForm.amount) <= 0) return;
    
    setIsBridging(true);
    try {
      await onBridge(
        bridgeForm.fromChain,
        bridgeForm.toChain,
        bridgeForm.token,
        parseFloat(bridgeForm.amount)
      );
      setBridgeForm({ ...bridgeForm, amount: '' });
    } catch (error) {
      console.error('Bridge error:', error);
    } finally {
      setIsBridging(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-gray-800/50 rounded-xl p-8 border border-gray-700 ${className}`}>
        <LoadingSpinner size="large" text="Loading cross-chain data..." />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Cross-Chain Bridge</h2>
          <p className="text-gray-400">Manage your restaking positions across multiple chains</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-800/30 rounded-lg p-1">
        {[
          { id: 'positions', label: 'Positions', icon: '🌐' },
          { id: 'bridge', label: 'Bridge Assets', icon: '🌉' },
          { id: 'history', label: 'Transaction History', icon: '📜' },
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
              <h3 className="text-gray-400 text-sm mb-2">Total Value</h3>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(positions.reduce((sum, pos) => sum + pos.value, 0))}
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
              <h3 className="text-gray-400 text-sm mb-2">Active Chains</h3>
              <p className="text-2xl font-bold text-blue-400">
                {new Set(positions.map(p => p.chainId)).size}
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
              <h3 className="text-gray-400 text-sm mb-2">Bridge-able Assets</h3>
              <p className="text-2xl font-bold text-green-400">
                {positions.filter(p => p.canBridge).length}
              </p>
            </div>
          </div>

          {/* Positions List */}
          <div className="space-y-4">
            {positions.map((position) => (
              <div key={`${position.chainId}-${position.token}`} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{getChainIcon(position.chainId)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {position.token} on {position.chainName}
                      </h3>
                      <p className="text-gray-400">via {position.bridge}</p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(position.status)}`}>
                    {position.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Amount</p>
                    <p className="text-white font-semibold">
                      {position.amount.toFixed(4)} {position.token}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm">Value</p>
                    <p className="text-white font-semibold">{formatCurrency(position.value)}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm">Bridge Fee</p>
                    <p className="text-white font-semibold">{formatCurrency(position.bridgeFee)}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm">Est. Time</p>
                    <p className="text-white font-semibold">{position.estimatedTime}min</p>
                  </div>
                </div>

                {position.canBridge && (
                  <div className="mt-4 flex justify-end">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Bridge to Swellchain
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bridge Tab */}
      {activeTab === 'bridge' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6">Bridge Assets</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* From Chain */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  From Chain
                </label>
                <select
                  value={bridgeForm.fromChain}
                  onChange={(e) => setBridgeForm({ ...bridgeForm, fromChain: parseInt(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value={1}>🔷 Ethereum</option>
                  <option value={10}>🔴 Optimism</option>
                  <option value={42161}>🔵 Arbitrum</option>
                  <option value={137}>🟣 Polygon</option>
                </select>
              </div>

              {/* To Chain */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  To Chain
                </label>
                <select
                  value={bridgeForm.toChain}
                  onChange={(e) => setBridgeForm({ ...bridgeForm, toChain: parseInt(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value={1101}>🌊 Swellchain</option>
                  <option value={1}>🔷 Ethereum</option>
                  <option value={10}>🔴 Optimism</option>
                  <option value={42161}>🔵 Arbitrum</option>
                </select>
              </div>

              {/* Token */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token
                </label>
                <select
                  value={bridgeForm.token}
                  onChange={(e) => setBridgeForm({ ...bridgeForm, token: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="swETH">swETH</option>
                  <option value="rswETH">rswETH</option>
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={bridgeForm.amount}
                  onChange={(e) => setBridgeForm({ ...bridgeForm, amount: e.target.value })}
                  placeholder="0.0"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Bridge Info */}
            <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Estimated Fee:</span>
                <span className="text-white">$2.50</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-400">Estimated Time:</span>
                <span className="text-white">~15 minutes</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-400">Route:</span>
                <span className="text-white">
                  {getChainName(bridgeForm.fromChain)} → {getChainName(bridgeForm.toChain)}
                </span>
              </div>
            </div>

            {/* Bridge Button */}
            <button
              onClick={handleBridge}
              disabled={isBridging || !bridgeForm.amount}
              className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isBridging && <LoadingSpinner size="small" />}
              <span>{isBridging ? 'Bridging...' : 'Bridge Assets'}</span>
            </button>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {operations.length === 0 ? (
            <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 text-center">
              <p className="text-gray-400">No bridge operations found</p>
            </div>
          ) : (
            operations.map((operation) => (
              <div key={operation.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getChainIcon(operation.fromChain)}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-2xl">{getChainIcon(operation.toChain)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {operation.amount.toFixed(4)} {operation.token}
                      </h3>
                      <p className="text-gray-400">
                        {getChainName(operation.fromChain)} → {getChainName(operation.toChain)}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(operation.status)}`}>
                    {operation.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Fee</p>
                    <p className="text-white font-semibold">{formatCurrency(operation.fee)}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm">Time</p>
                    <p className="text-white font-semibold">
                      {operation.actualTime ? `${operation.actualTime}min` : `~${operation.estimatedTime}min`}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm">Source Tx</p>
                    <p className="text-blue-400 font-mono text-sm">
                      {operation.transactionHash ? 
                        `${operation.transactionHash.slice(0, 10)}...${operation.transactionHash.slice(-6)}` : 
                        'Pending'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm">Date</p>
                    <p className="text-white font-semibold">
                      {new Date(operation.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {operation.destinationHash && (
                  <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-green-400 text-sm">
                      ✅ Destination Tx: {operation.destinationHash.slice(0, 10)}...{operation.destinationHash.slice(-6)}
                    </p>
                  </div>
                )}

                {operation.error && (
                  <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <p className="text-red-400 text-sm">
                      ❌ Error: {operation.error}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CrossChainBridge; 