import { useContractRead } from 'wagmi';
import oftAbi from './abi.json';
import { parseEther } from 'viem';
import { FormState } from '@/business/widget/form/useFormState';
import { getCause } from '@/utils/getCause';

interface IParams {
  formState: FormState;
}

export function useEstimateSendFee({ formState }: IParams) {
  const { data, status, error } = useContractRead({
    enabled: !!(
      formState.destinationChain?.lzEndpointId && formState.oftAddress
    ),
    address: formState.oftAddress,
    abi: oftAbi,
    functionName: 'estimateSendFee',
    args: [
      formState.destinationChain?.lzEndpointId,
      formState.recipient,
      parseEther(formState.value, 'wei'),
      false,
      '0x',
    ],
  });

  const nativeFee: bigint | undefined =
    status === 'success' ? (data as any)[0] : undefined;

  return {
    status,
    nativeFee,
    error: getCause(error),
  };
}
