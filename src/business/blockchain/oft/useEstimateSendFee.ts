import { useReadContract } from 'wagmi';
import oftAbi from './abi.json';
import { parseEther } from 'viem';
import { FormState } from '@/business/widget/form/useFormState';
import { getCause } from '@/utils/getCause';
import {Options} from '@layerzerolabs/lz-v2-utilities';
import { hexToBytes, bytesToHex } from 'viem';
import { DEPLOYED_ADDRESSES, ReceiverGasLimit } from '../useBlockchainConfiguration';
import { PublicKey } from '@solana/web3.js';
import { Console } from 'console';

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

const addrToHex = (chainId: number, addr: string): string|undefined => {
  if (chainId == 0) {
    let publicKey: PublicKey;
    try {
      publicKey = new PublicKey(addr);
    } catch(err) {
      return undefined;
    }
    const to = '0x' + Buffer.from(publicKey.toBytes()).toString('hex'); 
    return to;
  } 
  BYTES32_ZEROES.substring(0, 13*2) + addr.substring(2);
}

export function useEstimateSendFee({ formState }: IParams) {
  const _options = Options.newOptions();
  console.log(`Chain id == ${formState.destinationChain?.id}, adding 21,000 GAS limit`);
  const [gasLimit, nativeDrop] = ReceiverGasLimit(formState.destinationChain?.id!);
  _options.addExecutorLzReceiveOption(gasLimit, 0);
  const to = addrToHex(formState.destinationChain?.id!, formState.recipient);
  if (formState.destinationChain?.id === 0) {
    console.log("native drop to " + to);
    _options.addExecutorNativeDropOption(nativeDrop, to!)
  }
  let lzEndpoint = parseInt(formState.destinationChain?.lzEndpointId as string);
  
  const logTo = `${formState.recipient}, ${hexToBytes("0x00", {size: 32})}`;
  
  console.log(`To: ${logTo}, prefixed: ${to}, gas limit: ${gasLimit} in ${nativeDrop} dest: ${formState.destinationChain?.lzEndpointId}`);
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
      to: to,
      amountLD: parseEther(formState.value, "wei"),
      minAmountLD: parseEther(formState.value, "wei"),
      extraOptions: _options.toHex(),
      composeMsg: "0x00",
      oftCmd: "0x00"
    } as SendParam,
    false
    ],
  });

  console.log(data, status, error);
  const nativeFee: bigint | undefined =
    status === 'success' ? (data as any)['nativeFee'] : undefined;

  return {
    status,
    nativeFee,
    error: getCause(error),
  };
}
