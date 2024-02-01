import { useMemo, useState } from 'react';
import { Chain } from '@/business/blockchain/types';

export function useFormState() {
  const [destinationChain, setDestinationChain] = useState<Chain | null>(null);

  const [oftAddress, setOftAddress] = useState<`0x${string}`>('0x');
  const [value, setValue] = useState('0');
  const [recipient, setRecipient] = useState<`0x${string}`>('0x');

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
