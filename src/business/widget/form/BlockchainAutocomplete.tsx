import { FC } from 'react';
import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Autocomplete, { AutocompleteProps } from '@mui/material/Autocomplete';
import { Chain } from '@/business/blockchain/types';

interface IProps
  extends Pick<
    AutocompleteProps<Chain, undefined, undefined, undefined>,
    'onChange' | 'value' | 'options'
  > {
  label: TextFieldProps['label'];
}

export const BlockchainAutocomplete: FC<IProps> = ({ label, ...props }) => (
  <Autocomplete
    {...props}
    disablePortal
    sx={{ width: 300 }}
    renderInput={(params) => <TextField {...params} label={label} />}
    getOptionLabel={(option) =>
      `${option.name} (${option.nativeCurrency.symbol})`
    }
    renderOption={(props, option) => (
      <MenuItem {...props}>
        <ListItemAvatar>
          <Avatar src={option.iconUrl} alt={option.name} />
        </ListItemAvatar>
        <ListItemText>{option.name}</ListItemText>
      </MenuItem>
    )}
  />
);
