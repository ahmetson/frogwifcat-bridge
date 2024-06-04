'use client';
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { useBlockchainConfiguration } from '@/business/blockchain/useBlockchainConfiguration';
import { Widget } from '@/business/widget/Widget';
import { USE_TESTNET } from '@/business/blockchain/configuration';
import { lineaSepolia, linea } from 'viem/chains';

const queryClient = new QueryClient()

export default function Home() {
  const config = useBlockchainConfiguration();

  if (!config) {
    return null;
  }

  return (
    <WagmiProvider config={config.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
      <RainbowKitProvider initialChain={(USE_TESTNET) ? lineaSepolia : linea}>
        <Widget blockchains={config.chains} />
      </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
