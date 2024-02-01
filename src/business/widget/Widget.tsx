import { useFormState } from '@/business/widget/form/useFormState';
import { useLocalTransactions } from '@/business/widget/useLocalTransactions';
import { useAccount } from 'wagmi';
import { useEstimateSendFee } from '@/business/blockchain/oft/useEstimateSendFee';
import { useSendFrom } from '@/business/blockchain/oft/useSendFrom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Form } from '@/business/widget/form/Form';
import { Chain } from '@/business/blockchain/types';
import { FC } from 'react';
import { TransactionHistoryItem } from '@/business/widget/TransactionHistory';

interface IProps {
  blockchains: Chain[];
}

export const Widget: FC<IProps> = ({ blockchains }) => {
  const formState = useFormState();
  const wallet = useAccount({
    onConnect({ address }) {
      if(address) {
        formState.setRecipient(address);
      }
    },
  });

  const [transactions, setTransactions] = useLocalTransactions();
  const {
    status: estimateSendFeeStatus,
    error: estimateSendFeeError,
    nativeFee,
  } = useEstimateSendFee({ formState });
  const {
    write,
    status: sendFromStatus,
    error: sendFromError,
  } = useSendFrom({
    formState,
    enabled: estimateSendFeeStatus === 'success',
    nativeFee,
    onSendFromSuccess: (data) => {
      setTransactions((o) => [
        ...o,
        {
          hash: data.hash,
          timestamp: Date.now(),
        },
      ]);
    },
  });
  const error = estimateSendFeeError || sendFromError;

  return (
    <Container>
      <Stack gap={4}>
        <div style={{ margin: '48px auto 0' }}>
          <ConnectButton />
        </div>
        <Card>
          <CardContent>
            <Form
              blockchains={blockchains ?? []}
              formState={formState}
              onSubmit={write}
              submitting={sendFromStatus === 'loading'}
              isWalletReady={wallet.isConnected}
              error={error}
            />
          </CardContent>
        </Card>
        <ul>
          {transactions.map((tx) => (
            <TransactionHistoryItem key={tx.hash} transaction={tx} />
          ))}
        </ul>
      </Stack>
    </Container>
  );
};
