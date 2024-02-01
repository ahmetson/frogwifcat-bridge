import { useLocalStorage } from 'usehooks-ts';
import { useMemo } from 'react';

export interface ITransaction {
  hash: string;
  timestamp: number;
}

export const useLocalTransactions = () => {
  const [transactions, setTransactions] = useLocalStorage<ITransaction[]>(
    'txs',
    [],
  );

  const sortedTxs = useMemo(() => {
    const cTxs = [...transactions];
    return cTxs.sort((txA, txB) => txA.timestamp - txB.timestamp);
  }, [transactions]);

  return [sortedTxs, setTransactions] as const;
};
