'use client';
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { useBlockchainConfiguration } from '@/business/blockchain/useBlockchainConfiguration';
import { Widget } from '@/business/widget/Widget';
import { USE_TESTNET } from '@/business/blockchain/configuration';
import { lineaSepolia, linea } from 'viem/chains';
import { solanaChain } from '../business/blockchain/useBlockchainConfiguration';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
require('@solana/wallet-adapter-react-ui/styles.css');
import {
  WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';

const queryClient = new QueryClient()

export default function Home() {
  const config = useBlockchainConfiguration();

  if (!config) {
    return null;
  }

  const wallets = [
        /**
         * Wallets that implement either of these standards will be available automatically.
         *
         *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
         *     (https://github.com/solana-mobile/mobile-wallet-adapter)
         *   - Solana Wallet Standard
         *     (https://github.com/anza-xyz/wallet-standard)
         *
         * If you wish to support a wallet that supports neither of those standards,
         * instantiate its legacy wallet adapter here. Common legacy adapters can be found
         * in the npm package `@solana/wallet-adapter-wallets`.
         */
        new UnsafeBurnerWalletAdapter(),
    ];

  return (
    <WagmiProvider config={config.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={(USE_TESTNET) ? lineaSepolia : linea}>
          <ConnectionProvider endpoint={solanaChain.rpcUrls.default.http[0]}>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                
                <Widget blockchains={config.chains} />
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
