'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { formatCurrency, formatPercentage, truncateAddress } from '../lib/utils';

// Simple inline type definition to avoid import issues
interface CrossChainPosition {
  id: string;
  userAddress: string;
  fromChain: { chainId: number; name: string; logo: string };
  toChain: { chainId: number; name: string; logo: string };
  token: { symbol: string; name: string; address: string; decimals: number; logo: string };
  amount: number;
  valueUSD: number;
  bridgeContract: string;
  status: string;
  lastBridged: Date;
  estimatedYield: number;
  riskScore: number;
}

interface CrossChainPositionsProps {
  userAddress?: string;
  className?: string;
}

export default function CrossChainPositions({ userAddress, className }: CrossChainPositionsProps) {
  const [positions, setPositions] = useState<CrossChainPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userAddress) {
      fetchCrossChainPositions();
    }
  }, [userAddress]);

  const fetchCrossChainPositions = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from your API
      // For now, we'll use mock data
      const mockPositions: CrossChainPosition[] = [
        {
          id: 'pos_1',
          userAddress: userAddress || '',
          fromChain: {
            chainId: 1,
            name: 'Ethereum',
            logo: '/images/ethereum.png'
          },
          toChain: {
            chainId: 1923,
            name: 'Swellchain',
            logo: '/images/swellchain.png'
          },
          token: {
            symbol: 'swETH',
            name: 'Swell ETH',
            address: '0x...',
            decimals: 18,
            logo: '/images/sweth.png'
          },
          amount: 32.5,
          valueUSD: 97500,
          bridgeContract: '0x...',
          status: 'active',
          lastBridged: new Date(Date.now() - 86400000), // 1 day ago
          estimatedYield: 0.092,
          riskScore: 0.25
        },
        {
          id: 'pos_2',
          userAddress: userAddress || '',
          fromChain: {
            chainId: 1923,
            name: 'Swellchain',
            logo: '/images/swellchain.png'
          },
          toChain: {
            chainId: 42161,
            name: 'Arbitrum',
            logo: '/images/arbitrum.png'
          },
          token: {
            symbol: 'swETH',
            name: 'Swell ETH',
            address: '0x...',
            decimals: 18,
            logo: '/images/sweth.png'
          },
          amount: 15.8,
          valueUSD: 47400,
          bridgeContract: '0x...',
          status: 'pending',
          lastBridged: new Date(Date.now() - 3600000), // 1 hour ago
          estimatedYield: 0.078,
          riskScore: 0.30
        }
      ];

      setPositions(mockPositions);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cross-chain positions');
      console.error('Error fetching cross-chain positions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRiskBadge = (riskScore: number) => {
    if (riskScore <= 0.25) {
      return <Badge className="risk-low">Low Risk</Badge>;
    } else if (riskScore <= 0.5) {
      return <Badge className="risk-medium">Medium Risk</Badge>;
    } else if (riskScore <= 0.75) {
      return <Badge className="risk-high">High Risk</Badge>;
    } else {
      return <Badge className="risk-critical">Critical Risk</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Cross-Chain Positions</CardTitle>
          <CardDescription>Your positions across different chains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-white">Loading cross-chain positions...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Cross-Chain Positions</CardTitle>
          <CardDescription>Your positions across different chains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchCrossChainPositions} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (positions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Cross-Chain Positions</CardTitle>
          <CardDescription>Your positions across different chains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400">No cross-chain positions found</p>
            <p className="text-sm text-gray-400 mt-2">
              Connect your wallet and bridge assets to see your positions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Cross-Chain Positions</CardTitle>
        <CardDescription>
          Your positions across different chains ({positions.length} position{positions.length !== 1 ? 's' : ''})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {positions.map((position) => (
            <div
              key={position.id}
              className="rounded-lg border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white">{position.fromChain.name}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium text-white">{position.toChain.name}</span>
                  </div>
                  {getStatusBadge(position.status)}
                </div>
                {getRiskBadge(position.riskScore)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Token</p>
                  <p className="font-medium text-white">{position.token.symbol}</p>
                </div>
                <div>
                  <p className="text-gray-400">Amount</p>
                  <p className="font-medium text-white">{position.amount.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Value</p>
                  <p className="font-medium text-white">{formatCurrency(position.valueUSD)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Est. Yield</p>
                  <p className="font-medium text-green-400">
                    {formatPercentage(position.estimatedYield)}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Bridge: {truncateAddress(position.bridgeContract)}</span>
                  <span>Last bridged: {position.lastBridged.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
          <h4 className="font-medium mb-2 text-white">Cross-Chain Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Total Value</p>
              <p className="font-bold text-lg text-white">
                {formatCurrency(positions.reduce((sum, pos) => sum + pos.valueUSD, 0))}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Avg. Yield</p>
              <p className="font-bold text-lg text-green-400">
                {formatPercentage(
                  positions.reduce((sum, pos) => sum + pos.estimatedYield, 0) / positions.length
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 