interface TrustWalletBlockchain {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  chainId: string;
  blockchain: 'Ethereum' | string;
  deprecated?: boolean;
}

async function fetchBlockchainData(): Promise<TrustWalletBlockchain[]> {
  const result = await fetch(
    'https://raw.githubusercontent.com/trustwallet/wallet-core/master/registry.json',
  );
  return result.json();
}

function getBlockchainLogoUrl(id: TrustWalletBlockchain['id']) {
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${id}/info/logo.png`;
}

export async function fetchBlockchainIcons() {
  const trustWalletData = await fetchBlockchainData();

  return trustWalletData
    .filter((bc) => !bc.deprecated && bc.blockchain === 'Ethereum')
    .reduce<Record<string, string>>(
      (acc, bc) => ({
        ...acc,
        [bc.chainId]: getBlockchainLogoUrl(bc.id),
      }),
      {},
    );
}
