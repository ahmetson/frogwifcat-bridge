import { useEffect, useState } from 'react';
import { configureChains, createConfig } from 'wagmi';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import * as WagmiChains from 'wagmi/chains';
import { walletConnectProjectId } from '@/utils/env';
import { publicProvider } from 'wagmi/providers/public';
import { ChainListId } from '@layerzerolabs/lz-sdk';
import * as TrustWallet from './trustWallet';
import { USE_TESTNET } from '@/business/blockchain/configuration';
import * as LayerZero from './layerZero';
import { Chain, ExtraChainData } from './types';

function isTestnet(bc: object) {
  return !!('testnet' in bc && bc.testnet);
}

function buildRainbowKitConfigs(blockchains: Record<string, ExtraChainData>) {
  const { chains, publicClient } = configureChains<Chain>(
    Object.values(WagmiChains)
      .filter((bc) => {
        if (!USE_TESTNET && isTestnet(bc)) {
          return false;
        }

        return !!blockchains[String(bc.id)];
      })
      .map((bc) => ({
        ...bc,
        ...blockchains[String(bc.id)],
      })),
    [publicProvider()],
  );

  const { connectors } = getDefaultWallets({
    appName: 'OFT Bridge UI',
    projectId: walletConnectProjectId,
    chains,
  });

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
  });

  return {
    wagmiConfig,
    chains,
  };
}

/**
 * Fetch data from TrustWallet (for icons) and LayerZero (for endpoint ids).
 * Merge the data into a record
 */
async function buildExtraChainData(): Promise<Record<string, ExtraChainData>> {
  const blockchainIcons = await TrustWallet.fetchBlockchainIcons();

  return Object.keys(ChainListId).reduce((acc, chainId) => {
    const lzEndpointId = LayerZero.getEndpointId(chainId);

    // Skip chain unsupported by LayerZero
    if (!lzEndpointId) return acc;

    return {
      ...acc,
      [chainId]: {
        iconUrl: blockchainIcons[chainId],
        lzEndpointId,
      },
    };
  }, {});
}

/**
 * Build and expose chains configurations that match our needs :
 * - chain icons
 * - LayerZero endpoint ids
 */
export const useBlockchainConfiguration = () => {
  const [config, setConfig] =
    useState<ReturnType<typeof buildRainbowKitConfigs>>();

  useEffect(() => {
    (async () => {
      setConfig(buildRainbowKitConfigs(await buildExtraChainData()));
    })();
  }, []);

  return config;
};
