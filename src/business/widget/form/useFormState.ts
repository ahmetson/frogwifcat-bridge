import { useEffect, useMemo, useState } from 'react';
import { Chain } from '@/business/blockchain/types';
import { useAccount } from "wagmi";
import { DEPLOYED_ADDRESSES } from "../../blockchain/useBlockchainConfiguration";

export function useFormState() {
  const [destinationChain, setDestinationChain] = useState<Chain | null>(null);

  const [oftAddress, setOftAddress] = useState<`0x${string}`>('0x');
  const [value, setValue] = useState('0');
  const [recipient, setRecipient] = useState<`0x${string}`>('0x');

  // Use the solana blockchain as well
  const { chain } = useAccount();

  useEffect(() => {
    if (chain == undefined) {
      return;
    }
    if (DEPLOYED_ADDRESSES[chain.id] != undefined && DEPLOYED_ADDRESSES[chain.id].length > 0) {
      setOftAddress(DEPLOYED_ADDRESSES[chain.id]);
    }
  }, [chain]);

  return useMemo(
    () => ({
      destinationChain,
      setDestinationChain,
      oftAddress,
      setOftAddress,
      value,
      setValue,
      recipient,
      setRecipient,
    }),
    [
      destinationChain,
      setDestinationChain,
      oftAddress,
      setOftAddress,
      value,
      setValue,
      recipient,
      setRecipient,
    ],
  );
}

export type FormState = ReturnType<typeof useFormState>;
