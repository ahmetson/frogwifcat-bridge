import { useFormState } from '@/business/widget/form/useFormState';
import { useLocalTransactions, ITransaction } from '@/business/widget/useLocalTransactions';
import { useAccount, useAccountEffect, useWaitForTransactionReceipt } from 'wagmi';
import { useEstimateSendFee } from '@/business/blockchain/oft/useEstimateSendFee';
import { useSendFrom } from '@/business/blockchain/oft/useSendFrom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Form } from '@/business/widget/form/Form';
import { Chain } from '@/business/blockchain/types';
import { FC, useEffect, useState } from 'react';
import { TransactionHistoryItem } from '@/business/widget/TransactionHistory';

interface IProps {
  blockchains: Chain[];
}

export const Widget: FC<IProps> = ({ blockchains }) => {
  const formState = useFormState();
  const [sendFromStatus, setSendFromStatus] = useState("undefined");
  const wallet = useAccount();
  useAccountEffect({
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

  useEffect(() => {
    console.log(`Estimated Status; status=${estimateSendFeeStatus}, error=${estimateSendFeeError}, nativeFee=${nativeFee}`);
  }, [estimateSendFeeStatus, estimateSendFeeError]);

  const {
    // write,
    // data: sendFromData,
    // status: sendFromStatus,
    // hash,
    // isPending,
    // error: sendFromError,
    simulateParams,
    writeParams,
    writeContract
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
  const error = estimateSendFeeError || (simulateParams.error || writeParams.error);
  
  useEffect(() => {
    console.log(`The writing simulation:`);
    console.log(simulateParams);
    if (simulateParams.data) {
      if (simulateParams.data?.request) {
        if (simulateParams.isSuccess) {
          console.log('sending went well')
        }
        else {
          console.log(`Sending did not work`);
          console.log(simulateParams);
        }
      }
    }
  }, [simulateParams])

  useEffect(() => {
    console.log(`Simulate or write was changed: `, simulateParams, writeParams, sendFromStatus);
    if (simulateParams.isSuccess && writeParams.isSuccess) {
      setSendFromStatus('success');
    } else if (simulateParams.isLoading || writeParams.isPending) {
      setSendFromStatus('loading');
    } else if (writeParams.isPending == false && writeParams.isSuccess == false && simulateParams.isSuccess && simulateParams.isLoading == false) {
      setSendFromStatus('idle');
    }
  }, [simulateParams, writeParams])

  useEffect(() => {
    if (sendFromStatus == 'success') {
      setTransactions([
        ...transactions,
        {
          hash: writeParams.hash,
          timestamp: Date.now(),
        } as ITransaction,
      ]);
    }
  }, [sendFromStatus])

  let onSubmit = () => {
    console.log(`Move out hook to the top from Widget.tsx: `, nativeFee, sendFromStatus);
    if (simulateParams.data && simulateParams.data.request) {
      writeContract(simulateParams.data?.request)
    }
  }

  return (
    <Container>
      <Stack gap={4}>
        <div style={{ margin: '48px auto 0' }}>
          <ConnectButton />
        </div>
        <Card>
          <CardContent>
            <Form
              blockchains={blockchains.filter((chain) => chain.id != wallet.chainId) ?? []}
              formState={formState}
              onSubmit={onSubmit}
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
