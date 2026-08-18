import {
  apiRequest,
  saveSession,
  clearSession
} from "./api.js";

import {
  connectWallet,
  getChainId,
  isArcTestnet,
  signMessage
} from "./blockchain.js";

export async function authenticateWallet() {
  const walletAddress = await connectWallet();
  const chainId = await getChainId();

  if (!isArcTestnet(chainId)) {
    throw new Error("Please switch your wallet to Arc Testnet.");
  }

  const challenge = await apiRequest("/api/auth/challenge", {
    method: "POST",
    body: JSON.stringify({
      walletAddress
    })
  });

  const message = `Sign in to PayQuick\n\nNonce: ${challenge.nonce}`;
  const signature = await signMessage(message);

  const verification = await apiRequest("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify({
      walletAddress,
      signature
    })
  });

  saveSession(verification.sessionToken);

  const merchantResult = await apiRequest("/api/auth/merchant", {
    method: "POST"
  });

  return {
    walletAddress,
    merchant: merchantResult.merchant
  };
}

export function logout() {
  clearSession();
}
