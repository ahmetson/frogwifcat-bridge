import { Chain as ViemChain } from 'viem/_types/types/chain';

export interface ExtraChainData {
  iconUrl?: string;
  lzEndpointId: string;
}

export interface Chain extends ViemChain, ExtraChainData {}
