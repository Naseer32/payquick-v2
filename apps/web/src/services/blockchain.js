const ARC_TESTNET_CHAIN_ID = 5042002;
const ARC_TESTNET_CHAIN_ID_HEX = "0x4cef52";

const ARC_TESTNET_CONFIG = {
  chainId: ARC_TESTNET_CHAIN_ID_HEX,
  chainName: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 6
  },
  rpcUrls: ["https://rpc.testnet.arc.network"],
  blockExplorerUrls: ["https://testnet.arcscan.app"]
};

export function getEthereumProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error(
      "No compatible wallet found. Please install or open a compatible wallet."
    );
  }

  return window.ethereum;
}

export async function connectWallet() {
  const provider = getEthereumProvider();

  const accounts = await provider.request({
    method: "eth_requestAccounts"
  });

  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new Error("No wallet account returned.");
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

export async function ensureArcTestnet() {
  const provider = getEthereumProvider();

  let chainId = await provider.request({
    method: "eth_chainId"
  });

  if (isArcTestnet(chainId)) {
    return chainId;
  }

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: ARC_TESTNET_CHAIN_ID_HEX
        }
      ]
    });
  } catch (error) {
    if (error?.code !== 4902) {
      throw new Error(
        error?.message ||
          "Unable to switch wallet to Arc Testnet."
      );
    }

    await provider.request({
      method: "wallet_addEthereumChain",
      params: [ARC_TESTNET_CONFIG]
    });

    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: ARC_TESTNET_CHAIN_ID_HEX
        }
      ]
    });
  }

  chainId = await provider.request({
    method: "eth_chainId"
  });

  if (!isArcTestnet(chainId)) {
    throw new Error(
      "Wallet could not be switched to Arc Testnet."
    );
  }

  return chainId;
}

export async function signMessage(message, walletAddress) {
  const provider = getEthereumProvider();

  if (!walletAddress) {
    throw new Error(
      "Wallet address is required to sign the message."
    );
  }

  const normalizedAddress = walletAddress.toLowerCase();

  return provider.request({
    method: "personal_sign",
    params: [message, normalizedAddress]
  });
}
