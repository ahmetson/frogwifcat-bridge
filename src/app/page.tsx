'use client';
import {
  Autocomplete,
  Avatar,
  Button,
  Card,
  CardContent,
  Container,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import '@rainbow-me/rainbowkit/styles.css';
import { FC, useEffect, useMemo, useState } from 'react';
import {
  configureChains,
  createConfig,
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  WagmiConfig,
} from 'wagmi';
import {
  ConnectButton,
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';
import type { Chain as ViemChain } from 'viem/chains';
import * as WagmiChains from 'wagmi/chains';
import { walletConnectProjectId } from '@/utils/env';
import { publicProvider } from 'wagmi/providers/public';
import { ChainId, ChainListId } from '@layerzerolabs/lz-sdk';
import oftAbi from '@/utils/blockhain/abi/oft.json';
import {
  createClient,
  Message,
  MessageStatus,
} from '@layerzerolabs/scan-client';
import { useInterval, useLocalStorage } from 'usehooks-ts';

const client = createClient('mainnet');

const ChainIdToEndpointId = Object.keys(ChainListId).reduce<
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
}, {});

interface ExtraChainData {
  iconUrl?: string;
  lzEndpointId: string;
}

interface Chain extends ViemChain, ExtraChainData {}

interface ITransaction {
  hash: string;
  timestamp: number;
}

const BlockchainAutocomplete: FC<{
  label: string;
  blockchains: Chain[];
  state: ReturnType<typeof useState<Chain | null>>;
}> = ({ label, blockchains, state: [blockchain, setBlockchain] }) => (
  <Autocomplete
    disablePortal
    options={blockchains}
    sx={{ width: 300 }}
    renderInput={(params) => <TextField {...params} label={label} />}
    getOptionLabel={(option) =>
      `${option.name} (${option.nativeCurrency.symbol}) [${option.lzEndpointId}]`
    }
    renderOption={(props, option) => (
      <MenuItem {...props}>
        <ListItemAvatar>
          <Avatar src={option.iconUrl} alt={option.name} />
        </ListItemAvatar>
        <ListItemText>{option.name}</ListItemText>
      </MenuItem>
    )}
    value={blockchain}
    onChange={(_e, value) => setBlockchain(value)}
  />
);

function hasCause(error: {
  cause?: unknown;
}): error is { cause: { shortMessage: string } } {
  if (!error.cause) return false;
  if (!(typeof error.cause === 'object')) return false;
  if (!('shortMessage' in error.cause)) return false;

  return typeof error.cause.shortMessage === 'string';
}

const HistoryItem = ({ transaction }: { transaction: ITransaction }) => {
  const [message, setMessage] = useState<Message>();

  const isStaled = transaction.timestamp < Date.now() - 120_000;
  const isFinal =
    message &&
    [MessageStatus.FAILED, MessageStatus.DELIVERED].includes(message.status);
  const delay = (() => {
    if (isStaled) return 0;
    if (isFinal) return null;
    return 5000;
  })();
  useInterval(async () => {
    const { messages } = await client.getMessagesBySrcTxHash(transaction.hash);
    setMessage(messages[0]);
  }, delay);

  if (!message && isStaled) {
    return null;
  }

  return (
    <li>
      ({new Date(transaction.timestamp).toLocaleString()})
      {message && (
        <>
          message.status :{' '}
          <a
            href={`https://layerzeroscan.com/tx/${transaction.hash}`}
            target="_blank"
          >
            Check on layerzero scan
          </a>
        </>
      )}
    </li>
  );
};

const Widget = ({ blockchains }: { blockchains: Chain[] }) => {
  const toBlockchain = useState<Chain | null>();

  const [oftAddress, setOftAddress] = useState<string>();
  const [value, setValue] = useState('0');
  const [recipient, setRecipient] = useState<string>();

  const wallet = useAccount({
    onConnect({ address }) {
      setRecipient(address);
    },
  });

  const {
    data,
    status,
    error: rError,
  } = useContractRead({
    enabled: !!(toBlockchain[0]?.lzEndpointId && oftAddress),
    address: oftAddress as any,
    abi: oftAbi,
    functionName: 'estimateSendFee',
    args: [
      toBlockchain[0]?.lzEndpointId,
      recipient,
      parseEther(value, 'wei'),
      false,
      '0x',
    ],
  });
  const nativeFee = status === 'success' ? (data as any)[0] : undefined;

  const { config, error } = usePrepareContractWrite({
    enabled: status === 'success',
    address: oftAddress as any,
    abi: oftAbi,
    functionName: 'sendFrom',
    value: nativeFee,
    args: [
      wallet.address,
      toBlockchain[0]?.lzEndpointId,
      recipient,
      parseEther(value, 'wei'),
      wallet.address,
      wallet.address,
      '0x',
    ],
  });

  const [txs, setTransactions] = useLocalStorage<ITransaction[]>('txs', []);
  const sortedTxs = useMemo(() => {
    const cTxs = [...txs];
    return cTxs.sort((txA, txB) => txA.timestamp - txB.timestamp);
  }, [txs]);

  const { write, status: writeStatus } = useContractWrite({
    ...config,
    onSuccess: (data) => {
      setTransactions((o) => [
        ...o,
        {
          hash: data.hash,
          timestamp: Date.now(),
        },
      ]);
    },
  });

  return (
    <Container>
      <Stack gap={4}>
        <div style={{ margin: '48px auto 0' }}>
          <ConnectButton />
        </div>
        <Card>
          <CardContent>
            <Stack gap={2}>
              <BlockchainAutocomplete
                label="Destination network"
                blockchains={blockchains ?? []}
                state={toBlockchain}
              />
              <TextField
                onChange={(e) => setOftAddress(e.target.value)}
                value={oftAddress}
                label="OFT Adress"
              />
              <TextField
                disabled={wallet.isDisconnected}
                onChange={(e) => setValue(e.target.value)}
                value={value}
                label="Value"
              />
              <TextField
                disabled={wallet.isDisconnected}
                onChange={(e) => setRecipient(e.target.value)}
                value={recipient}
                label="To address"
                InputLabelProps={{ shrink: true }}
              />
              <Button
                variant="contained"
                onClick={write}
                disabled={writeStatus === 'loading'}
              >
                {writeStatus === 'loading' ? 'Loading' : 'Run transaction'}
              </Button>
              {rError && <p>{rError.message}</p>}
              {error && (
                <p>
                  {hasCause(error) ? error.cause.shortMessage : error.message}
                </p>
              )}
            </Stack>
          </CardContent>
        </Card>
        <ul>
          {sortedTxs.map((tx) => (
            <HistoryItem key={tx.hash} transaction={tx} />
          ))}
        </ul>
      </Stack>
    </Container>
  );
};

function buildConfigs(blockchains: Record<string, ExtraChainData>) {
  const { chains, publicClient } = configureChains<Chain>(
    Object.values(WagmiChains)
      .filter(
        (bc) => !('testnet' in bc && bc.testnet) && blockchains[String(bc.id)],
      )
      .map((bc) => ({
        ...bc,
        ...blockchains[String(bc.id)],
      })),
    [publicProvider()],
  );

  const { connectors } = getDefaultWallets({
    appName: '',
    projectId: walletConnectProjectId,
    chains,
  });

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
  });

  return {
    wagmiConfig,
    chains,
  };
}

export default function Home() {
  const [config, setConfig] = useState<ReturnType<typeof buildConfigs>>();

  useEffect(() => {
    (async () => {
      const result = await fetch(
        'https://raw.githubusercontent.com/trustwallet/wallet-core/master/registry.json',
      );
      const data: Array<{
        id: string;
        name: string;
        symbol: string;
        decimals: number;
        chainId: string;
        blockchain: 'Ethereum' | string;
        deprecated?: boolean;
      }> = await result.json();

      const blockchainIcons = data
        .filter((bc) => !bc.deprecated && bc.blockchain === 'Ethereum')
        .reduce<Record<string, string>>(
          (acc, bc) => ({
            ...acc,
            [bc.chainId]: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${bc.id}/info/logo.png`,
          }),
          {},
        );

      const blockchainData = Object.keys(ChainListId).reduce<
        Record<string, ExtraChainData>
      >(
        (acc, chainId) => ({
          ...acc,
          [chainId]: {
            iconUrl: blockchainIcons[chainId],
            lzEndpointId: ChainIdToEndpointId[chainId],
          },
        }),
        {},
      );

      setConfig(buildConfigs(blockchainData));
    })();
  }, []);

  if (!config) {
    return null;
  }

  return (
    <WagmiConfig config={config.wagmiConfig}>
      <RainbowKitProvider chains={config.chains} initialChain={{ id: 1 }}>
        <Widget blockchains={config.chains} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
