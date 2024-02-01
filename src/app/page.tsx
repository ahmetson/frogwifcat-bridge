'use client';
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { useBlockchainConfiguration } from '@/business/blockchain/useBlockchainConfiguration';
import { Widget } from '@/business/widget/Widget';

export default function Home() {
  const config = useBlockchainConfiguration();

  if (!config) {
    return null;
  }

  return (
    <WagmiConfig config={config.wagmiConfig}>
      <RainbowKitProvider chains={config.chains} initialChain={{ id: 1 }}>
        <Widget blockchains={config.chains} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
