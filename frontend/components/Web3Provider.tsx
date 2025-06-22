'use client'

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, polygon, arbitrum } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

// Define Swellchain
const swellchain = {
  id: 1923,
  name: 'Swellchain',
  network: 'swellchain',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://swell-mainnet.alt.technology'] },
    default: { http: ['https://swell-mainnet.alt.technology'] },
  },
  blockExplorers: {
    default: { name: 'SwellScan', url: 'https://explorer.swellnetwork.io' },
  },
  testnet: false,
};

const { chains, publicClient } = configureChains(
  [mainnet, polygon, arbitrum, swellchain],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID || 'demo' }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'SwellScope',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
} 