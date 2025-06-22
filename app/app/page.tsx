'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import CrossChainPositions from '../../components/CrossChainPositions';

export default function SwellScopeDashboard() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to SwellScope
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Advanced restaking analytics and risk management for Swellchain
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto"></div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-300 mb-6">
              Connect your wallet to access advanced restaking analytics, risk assessment, and portfolio management tools.
            </p>
            <ConnectButton />
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-Time Analytics</h3>
              <p className="text-gray-400 text-sm">
                Monitor TVL, yield rates, and validator performance across all Swellchain protocols
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Risk Management</h3>
              <p className="text-gray-400 text-sm">
                Advanced slashing risk analysis and automated protection mechanisms
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Automated Optimization</h3>
              <p className="text-gray-400 text-sm">
                Dynamic rebalancing and yield optimization across restaking strategies
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">SwellScope Dashboard</h1>
        
        <div className="space-y-8">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">
              Welcome to SwellScope Analytics
            </h2>
            <p className="text-gray-300 mb-4">
              Connected as: {address}
            </p>
            <p className="text-gray-300">
              Your advanced restaking analytics dashboard is now ready. Explore your cross-chain positions below.
            </p>
          </div>

          <CrossChainPositions userAddress={address} className="bg-white/10 backdrop-blur-md border border-white/20" />
        </div>
      </div>
    </div>
  );
} 