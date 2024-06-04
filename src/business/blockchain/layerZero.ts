import {
  createClient,
  Message,
  MessageStatus,
} from '@layerzerolabs/scan-client';
import { USE_TESTNET } from '@/business/blockchain/configuration';
import { useState } from 'react';
import { useInterval } from 'usehooks-ts';

const client = createClient(USE_TESTNET ? 'testnet' : 'mainnet');

/*const ChainIdToEndpointId = Object.keys(ChainListId).reduce<
  Record<string, string>
>((acc, chainKey) => {
  const chainId = Object(ChainListId)[chainKey];
  const endpointId = Object(ChainId)[chainKey];

  if (!endpointId) return acc;
  if (chainKey.endsWith('SANDBOX')) return acc;

  return {
    ...acc,
    [chainId]: endpointId,
  };
}, {});*/

//export function getEndpointId(chainId: string): string | undefined {
//  return ChainIdToEndpointId[chainId];
//}

interface ITransaction {
  hash: string;
  timestamp: number;
}

export function useListenMessage(transaction: ITransaction) {
  const [data, setData] = useState<Message>();

  const isStaled = transaction.timestamp < Date.now() - 120_000;
  const isFinal =
    data &&
    [MessageStatus.FAILED, MessageStatus.DELIVERED].includes(data.status);
  const delay = (() => {
    if (isStaled || isFinal) return null;
    return 5000;
  })();

  useInterval(async () => {
    const { messages } = await client.getMessagesBySrcTxHash(transaction.hash);
    setData(messages[0]);
  }, delay);

  if (!data && isStaled) {
    return null;
  }

  return {
    data,
  };
}
