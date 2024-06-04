import {
  useAccount,
  useWriteContract,
  useSimulateContract,
} from 'wagmi';
import { parseEther } from 'viem';
import { FormState } from '@/business/widget/form/useFormState';
import oftAbi from './abi.json';
import { getCause } from '@/utils/getCause';
import {SendParam, BYTES32_ZEROES} from "./useEstimateSendFee";
import {Options} from '@layerzerolabs/lz-v2-utilities';

interface IParams {
  formState: FormState;
  enabled: boolean;
  nativeFee: bigint | undefined;
  onSendFromSuccess: (data: any) => void;
}

export const useSendFrom = ({
  formState,
  enabled,
  nativeFee,
}: IParams) => {
  
  /*return {write: undefined,  data: undefined,
    hash: undefined,
    isPending: undefined,
    error: undefined,};*/
  const wallet = useAccount();
  const _options = Options.newOptions();
  _options.addExecutorLzReceiveOption(70000, 0);
  let lzEndpoint = parseInt(formState.destinationChain?.lzEndpointId as string);

  const { data, error, isSuccess, isLoading: isLoadingSimulate } = useSimulateContract({
    query: {
      enabled
    },
    address: formState.oftAddress,
    abi: oftAbi,
    functionName: 'send',
    value: nativeFee,
    args: [ {
      dstEid: lzEndpoint,
      to: BYTES32_ZEROES.substring(0, 13*2) + formState.recipient.substring(2),
      amountLD: parseEther(formState.value, "wei"),
      minAmountLD: parseEther(formState.value, "wei"),
      extraOptions: _options.toHex(),
      composeMsg: "0x00",
      oftCmd: "0x00"
    } as SendParam,
    {nativeFee: nativeFee, lzTokenFee: 0},
    wallet.address
    ],
  });

  /*const { write, status } = useWriteContract({
    ...config,
    onSuccess: onSendFromSuccess,
  });*/
  const { writeContract, data: hash, isPending: isWritePending, isSuccess: writeIsSuccess, error: writeError } = useWriteContract();

  /*useEffect(() => {
  // https://www.reddit.com/r/reactjs/comments/1b6g3ze/looking_for_help_on_hook_redesign/    
  }, [isPending]);*/

  return {
    writeContract,
    writeParams: {
      hash, isPending: isWritePending, isSuccess: writeIsSuccess, error: getCause(writeError)
    },
    simulateParams: {
      data, error: getCause(error), isSuccess, isLoading: isLoadingSimulate
    }
  };
};
