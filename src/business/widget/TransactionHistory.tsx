import { FC } from 'react';
import { useListenMessage } from '@/business/blockchain/layerZero';
import { ITransaction } from './useLocalTransactions';

interface IProps {
  transaction: ITransaction;
}

export const TransactionHistoryItem: FC<IProps> = ({ transaction }) => {
  const message = useListenMessage(transaction);

  if (!message) {
    return null;
  }

  const { data } = message;

  return (
    <li>
      ({new Date(transaction.timestamp).toLocaleString()})
      {data ? (
        <>
          {` `}
          {data.status}:{` `}
          <a
            href={`https://layerzeroscan.com/tx/${transaction.hash}`}
            target="_blank"
            style={{ textDecoration: 'underline' }}
          >
            Check on LayerZero scan
          </a>
        </>
      ) : (
        <>Waiting for LayerZero transaction</>
      )}
    </li>
  );
};
