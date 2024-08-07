import { useEffect, useState } from 'react';
import { http } from 'wagmi';
import * as WagmiChains from 'wagmi/chains';
import { walletConnectProjectId } from '@/utils/env';
import { EndpointId } from '@layerzerolabs/lz-definitions'
import * as TrustWallet from './trustWallet';
import { ExtraChainData } from './types';
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { USE_TESTNET } from './configuration';
import { PublicKey, clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { type Chain } from "./types";

const TESTNET_ENDPOINT_IDS = [
  EndpointId.SEPOLIA_V2_TESTNET, 
  EndpointId.LINEASEP_V2_TESTNET, 
  EndpointId.BASESEP_V2_TESTNET
];

const TESTNET_CHAIN_IDS = [
  11155111,
  59141,
  84532 
];

const MAINNET_ENDPOINT_IDS = [
  EndpointId.ETHEREUM_V2_MAINNET,
  EndpointId.ZKCONSENSYS_V2_MAINNET,
  EndpointId.BASE_V2_MAINNET,
]

const MAINNET_CHAIN_IDS = [
  1,
  59144,
  8453
];

const SUPPORTED_ENDPOINT_IDS = (USE_TESTNET) ? TESTNET_ENDPOINT_IDS : MAINNET_ENDPOINT_IDS;
const SUPPORTED_CHAIN_IDS = (USE_TESTNET) ? TESTNET_CHAIN_IDS : MAINNET_CHAIN_IDS;

export const DEPLOYED_ADDRESSES: {[key: number]: `${string}`} = {
  0: (USE_TESTNET) ? "0x03b01f5823a06030a2bc9d6c9ffc69996490dd515359be24bbb94dc4a2b80b88" : "0x5f2b904f10210b8e3a35e38775b09d0fbcfe7985c23b75c17a789effd93fd308",
  11155111: "0x32ce985bCab4961394A9167D15F5d509D6F23f06", // sepolia
  59141: "0xe40c7856B6D0e1B01dECBF9976BB706B9Cd1229f", // linea sepolia
  84532: "0xe40c7856B6D0e1B01dECBF9976BB706B9Cd1229f", // "base sepolia"
  1: "0x0564c3e8fe23c5a6220a300c303f41e43d9be9e2",  // ethereum
  59144: "0x889400fB9BDE04BFdf353cC718fED3d6dDcF735F", // linea
  8453: "0xe40c7856B6D0e1B01dECBF9976BB706B9Cd1229f" // base
};

export const ReceiverGasLimit = (chainId: number) => {
  if (chainId === 0) {
    return [200000, 2500000];
  } else {
    return [70000, 0];
  }
}

export const solanaChain: Chain = (USE_TESTNET) ? 
  {
    id: 0,
    nativeCurrency: {
      name: "SOL",
      symbol: "SOL",
      decimals: 9
    },
    name:"Solana Testnet", 
    testnet: true,
    rpcUrls: { 
      "default": {
        http: [clusterApiUrl(WalletAdapterNetwork.Testnet)] 
      }
    },
    lzEndpointId: EndpointId.SOLANA_V2_TESTNET.toString(),
  }
 :
  {
    id: 0,
    nativeCurrency: {
      name: "SOL",
      symbol: "SOL",
      decimals: 9
    },
    name: "Solana", 
    testnet: false,
    rpcUrls: {
      "default": {
        http: [clusterApiUrl(WalletAdapterNetwork.Mainnet)]
      },
    },
    lzEndpointId: EndpointId.SOLANA_V2_MAINNET.toString(),
  }
;

function buildRainbowKitConfigs(blockchains: Record<string, ExtraChainData>) {
  const wagmiConfig = getDefaultConfig({
    appName: 'FrogWifCat Bridge',
    projectId: walletConnectProjectId,
    chains: (USE_TESTNET) ? 
      [WagmiChains.sepolia, WagmiChains.lineaSepolia, WagmiChains.baseSepolia] : 
      [WagmiChains.mainnet, WagmiChains.linea, WagmiChains.base],
    transports: (USE_TESTNET) ? { 
      [WagmiChains.sepolia.id]: http(), 
      [WagmiChains.lineaSepolia.id]: http(), 
      [WagmiChains.baseSepolia.id]: http(), 
    } : {
      [WagmiChains.mainnet.id]: http(), 
      [WagmiChains.linea.id]: http(),
      [WagmiChains.base.id]: http(),
    },
  })

  //todo add solana testnet
  let chains: Array<Chain> = Object.values(WagmiChains)
      .filter((bc) => {
        return !!blockchains[String(bc.id)];
      })
      .map((bc) => ({
        ...bc,
        ...blockchains[String(bc.id)],
      }));
  chains.push(solanaChain);

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
