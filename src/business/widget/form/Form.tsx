import { FormState } from './useFormState';
import Button, { ButtonProps } from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import { BlockchainAutocomplete } from './BlockchainAutocomplete';
import { Chain } from '@/business/blockchain/types';
import { FC } from 'react';

interface IProps {
  blockchains: Chain[];
  formState: FormState;
  onSubmit: ButtonProps['onChange'];
  submitting: boolean;
  isWalletReady: boolean;
  error?: string;
}

/**
 * todo input values should be validated to avoid any cast.
 */
export const Form: FC<IProps> = ({
  blockchains,
  formState,
  onSubmit,
  submitting,
  isWalletReady,
  error,
}) => (
  <Stack gap={2}>
    <BlockchainAutocomplete
      label="Destination chain"
      options={blockchains}
      onChange={(_, value) => formState.setDestinationChain(value)}
      value={formState.destinationChain}
    />
    <TextField
      label="FrogWifCat (WEF)"
      disabled={true}
      // onChange={(e) => formState.setOftAddress(e.target.value as any)}
      value={formState.oftAddress}
    />
    <TextField
      label="Value"
      disabled={!isWalletReady}
      onChange={(e) => formState.setValue(e.target.value)}
      value={formState.value}
    />
    <TextField
      label="To address"
      disabled={!isWalletReady}
      onChange={(e) => formState.setRecipient(e.target.value as any)}
      value={formState.recipient}
    />
    <Button variant="contained" onClick={onSubmit} disabled={submitting}>
      {submitting ? 'Loading' : 'Run transaction'}
    </Button>
    {error && <Alert severity="error">{error}</Alert>}
  </Stack>
);
