import { useEffect, useState } from 'react';
import { http } from 'wagmi';
import * as WagmiChains from 'wagmi/chains';
import { walletConnectProjectId } from '@/utils/env';
import { EndpointId } from '@layerzerolabs/lz-definitions'
import * as TrustWallet from './trustWallet';
import { ExtraChainData } from './types';
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

const SUPPORTED_ENDPOINT_IDS = [
  EndpointId.SEPOLIA_V2_TESTNET, 
  EndpointId.LINEASEP_V2_TESTNET, 
  EndpointId.BASESEP_V2_TESTNET
];
const SUPPORTED_CHAIN_IDS = [
  11155111,
  59141,
  84532 
];

function buildRainbowKitConfigs(blockchains: Record<string, ExtraChainData>) {
  const wagmiConfig = getDefaultConfig({
    appName: 'FrogWifCat Bridge',
    projectId: walletConnectProjectId,
    chains: [WagmiChains.sepolia, WagmiChains.lineaSepolia, WagmiChains.baseSepolia],
    transports: { 
      [WagmiChains.sepolia.id]: http(), 
      [WagmiChains.lineaSepolia.id]: http(), 
      [WagmiChains.baseSepolia.id]: http(), 
    },
  })

  let chains = Object.values(WagmiChains)
      .filter((bc) => {
        return !!blockchains[String(bc.id)];
      })
      .map((bc) => ({
        ...bc,
        ...blockchains[String(bc.id)],
      }));


  return {
    wagmiConfig,
    chains
  };
}

/**
 * Fetch data from TrustWallet (for icons) and LayerZero (for endpoint ids).
 * Merge the data into a record
 */
async function buildExtraChainData(): Promise<Record<string, ExtraChainData>> {
  const blockchainIcons = await TrustWallet.fetchBlockchainIcons();

  var chains: Record<string, ExtraChainData> = {};
  for (var i = 0; i < SUPPORTED_CHAIN_IDS.length; ++i) {
    const chainId = SUPPORTED_CHAIN_IDS[i];
    chains[chainId] = {
      iconUrl: blockchainIcons[chainId],
      lzEndpointId: SUPPORTED_ENDPOINT_IDS[i].toString(),
    };
  }

  return chains;
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
