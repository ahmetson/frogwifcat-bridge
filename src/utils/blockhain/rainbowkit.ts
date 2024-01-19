'use client';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { walletConnectProjectId } from '@/utils/env';

const { chains, publicClient } = configureChains([mainnet], [publicProvider()]);

const { connectors } = getDefaultWallets({
  appName: '',
  projectId: walletConnectProjectId,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export { chains, wagmiConfig };
