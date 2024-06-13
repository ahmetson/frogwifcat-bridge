import { useReadContract } from 'wagmi';
import oftAbi from './abi.json';
import { parseEther } from 'viem';
import { FormState } from '@/business/widget/form/useFormState';
import { getCause } from '@/utils/getCause';
import {Options} from '@layerzerolabs/lz-v2-utilities';
import { hexToBytes, bytesToHex } from 'viem';

interface IParams {
  formState: FormState;
}

export const BYTES32_ZEROES = "0x0000000000000000000000000000000000000000000000000000000000000000";

export type SendParam = {
  dstEid: number; // Destination endpoint ID.
  to: string; // Recipient address.
  amountLD: bigint; // Amount to send in local decimals.
  minAmountLD: bigint; // Minimum amount to send in local decimals.
  extraOptions: string; // Additional options supplied by the caller to be used in the LayerZero message.
  composeMsg: string;
  oftCmd: string;
}

export function useEstimateSendFee({ formState }: IParams) {
  const _options = Options.newOptions();
  if (formState.destinationChain?.id == 8453) {
  _options.addExecutorLzReceiveOption(1000000, 0);
  }
  else {
    _options.addExecutorLzReceiveOption(70000, 0);
  }
  let lzEndpoint = parseInt(formState.destinationChain?.lzEndpointId as string);
  console.log(`To: ${bytesToHex(hexToBytes(formState.recipient, { size: 32 }))}, ${hexToBytes("0x00", {size: 32})}`);
  const { data, status, error } = useReadContract({
    query: {
      enabled: !!(
        formState.destinationChain?.lzEndpointId && formState.oftAddress
      )
    },
    address: formState.oftAddress,
    abi: oftAbi,
    functionName: 'quoteSend',
    args: [{
      dstEid: lzEndpoint,
      to: BYTES32_ZEROES.substring(0, 13*2) + formState.recipient.substring(2),
      amountLD: parseEther(formState.value, "wei"),
      minAmountLD: parseEther(formState.value, "wei"),
      extraOptions: _options.toHex(),
      composeMsg: "0x00",
      oftCmd: "0x00"
    } as SendParam,
    false
    ],
  });

  const nativeFee: bigint | undefined =
    status === 'success' ? (data as any)['nativeFee'] : undefined;

  return {
    status,
    nativeFee,
    error: getCause(error),
  };
}
