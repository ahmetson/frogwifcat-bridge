import {
  useAccount,
  useContractWrite,
  UseContractWriteConfig,
  usePrepareContractWrite,
} from 'wagmi';
import { parseEther } from 'viem';
import { FormState } from '@/business/widget/form/useFormState';
import { WriteContractMode } from '@wagmi/core';
import oftAbi from './abi.json';
import { getCause } from '@/utils/getCause';

interface IParams {
  formState: FormState;
  enabled: boolean;
  nativeFee: bigint | undefined;
  onSendFromSuccess: UseContractWriteConfig<
    typeof oftAbi,
    'sendFrom',
    WriteContractMode
  >['onSuccess'];
}

export const useSendFrom = ({
  formState,
  enabled,
  nativeFee,
  onSendFromSuccess,
}: IParams) => {
  const wallet = useAccount();

  const { config, error } = usePrepareContractWrite({
    enabled,
    address: formState.oftAddress,
    abi: oftAbi,
    functionName: 'sendFrom',
    value: nativeFee,
    args: [
      wallet.address,
      formState.destinationChain?.lzEndpointId,
      formState.recipient,
      parseEther(formState.value, 'wei'),
      wallet.address,
      wallet.address,
      '0x',
    ],
  });

  const { write, status } = useContractWrite({
    ...config,
    onSuccess: onSendFromSuccess,
  });

  return {
    write,
    status,
    error: getCause(error),
  };
};
