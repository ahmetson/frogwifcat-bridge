import { useAccountModal, useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { useAccount, useAccountEffect, useWaitForTransactionReceipt } from 'wagmi';
import HubIcon from '@mui/icons-material/Hub';
import FaceIcon from '@mui/icons-material/Face';
import { BaseWalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ButtonProps } from '@solana/wallet-adapter-react-ui/lib/types/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import { List, ListItem, ListItemButton, ListItemText, useTheme } from '@mui/material';
import { useConnection as useSollanaConnection, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { solanaChain } from '../blockchain/useBlockchainConfiguration';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});


const LABELS = {
    'change-wallet': 'Change Solana wallet',
    connecting: 'Connecting ...',
    'copy-address': 'Copy address',
    copied: 'Copied',
    disconnect: 'Disconnect Solana',
    'has-wallet': 'Connect Solana',
    'no-wallet': 'Solana',
} as const;

export function WalletMultiButton(props: ButtonProps) {
    return <BaseWalletMultiButton {...props} labels={LABELS} />;
}

export function MultiConnect() {
  const { connection: solanaConnection } = useSollanaConnection();
  const { publicKey: solanaPublicKey, sendTransaction, connected: solanaConnected, disconnect: solanaDisconnect } = useSolanaWallet();

  const { openConnectModal: openEvmConnectModal } = useConnectModal();
  const { openChainModal: openEvmChainModal } = useChainModal();
  const { openAccountModal: openEvmAccountModal } = useAccountModal();
  const [networkName, setNetworkName] = React.useState("");
  const [walletAddress, setWalletAddress] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [openSolanaDialog, setSolanaOpenDialog] = React.useState(false);
  const evmWallet = useAccount();
  const [showConnectButton, setShowConnectButton] = React.useState(true);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [solanaCopied, setSolanaCopied] = React.useState(false);

  React.useEffect(() => {
    if (showConnectButton) {
        if (evmWallet.status == "connected") {
            setNetworkName(evmWallet.chain!.name);
            setWalletAddress(evmWallet.address);
            setShowConnectButton(false);
        } else if (solanaConnected) {
            setNetworkName(solanaChain.name);
            setWalletAddress(solanaPublicKey!.toBase58());
            setShowConnectButton(false);
        }
    } else {
        if (evmWallet.status == "disconnected" && !solanaConnected) {
            setShowConnectButton(true);
        }
    }

  }, [evmWallet, solanaConnected])

  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  const handleAccount = () => {
    if (solanaConnected) {
        setSolanaOpenDialog(true);
    } else if (evmWallet.status == "connected") {
        openEvmAccountModal!();
    }
  }

  const handleSolanaClose = () => {
    setSolanaOpenDialog(false);
  };

  const openEthModal = () => {
    setOpenDialog(false);
    if (openEvmConnectModal != undefined) {
        openEvmConnectModal();
    }
  }

  return (
    <React.Fragment>
      {showConnectButton && 
        <Button variant="contained" onClick={handleClickOpen}>
          Connect Wallet
        </Button>
      }
      {!showConnectButton && <>
        <Button
            onClick={openEvmChainModal}
            sx={{ mx: 0.5 }}
            color="secondary"
            startIcon={<HubIcon />}
        >
          {networkName}
        </Button>
        <Button
            onClick={handleAccount}
            sx={{ mx: 0.5 }}
            color="secondary"
            startIcon={<FaceIcon />}
        >
          {walletAddress}
        </Button>
      </>}
      <Dialog
        open={openDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        fullScreen={fullScreen}
      >
        <DialogTitle>{"Choose Network"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
              
          </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button variant='contained' onClick={openEthModal} sx={{padding:'12px', lineHeight: "48px", height: "48px"}}>EVM</Button>
            {!solanaConnected ? <Button onClick={handleClose}>
                <WalletMultiButton style={{padding: '12px'}} />
            </Button> : null}
            {/* <WalletDisconnectButton /> */}
        </DialogActions>
      </Dialog>
      {solanaConnected ? 
      <Dialog
        open={openSolanaDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleSolanaClose}
        aria-describedby="alert-dialog-slide-description"
        fullScreen={fullScreen}
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={async () => {
                                await navigator.clipboard.writeText(solanaPublicKey!.toBase58());
                                setSolanaCopied(true);
                                setTimeout(() => {setSolanaCopied(false); handleSolanaClose()}, 400);
                            }}>
                    <ListItemText primary={solanaCopied ? LABELS['copied'] : LABELS['copy-address']} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => {
                                solanaDisconnect();
                                handleSolanaClose();
                            }}>
                    <ListItemText primary={LABELS['disconnect']} />
                    </ListItemButton>
                </ListItem>
            </List>
          </DialogContentText>
        </DialogContent>
        </Dialog>
    : null}
    </React.Fragment>
  );
}