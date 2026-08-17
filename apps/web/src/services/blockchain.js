const ARC_TESTNET_CHAIN_ID = 5042002;

export function getEthereumProvider() {
  if (!window.ethereum) {
    throw new Error("No compatible wallet found");
  }

  return window.ethereum;
}

export async function connectWallet() {
  const provider = getEthereumProvider();

  const accounts = await provider.request({
    method: "eth_requestAccounts"
  });

  if (!accounts?.length) {
    throw new Error("No wallet account returned");
  }

  return accounts[0];
}

export async function getChainId() {
  const provider = getEthereumProvider();

  return provider.request({
    method: "eth_chainId"
  });
}

export function isArcTestnet(chainId) {
  return Number.parseInt(chainId, 16) === ARC_TESTNET_CHAIN_ID;
}
