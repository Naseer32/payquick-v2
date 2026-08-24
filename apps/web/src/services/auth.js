import {
  apiRequest,
  saveSession,
  clearSession
} from "./api.js";

import {
  connectWallet,
  ensureArcTestnet,
  signMessage
} from "./blockchain.js";

export async function restoreSession() {
  const token = localStorage.getItem("payquick_session");

  if (!token) {
    return null;
  }

  try {
    const merchantResult = await apiRequest("/api/auth/merchant", {
      method: "POST"
    });

    return {
      walletAddress: merchantResult.merchant.wallet_address,
      merchant: merchantResult.merchant
    };
  } catch (error) {
    console.log("PayQuick: saved session is no longer valid");

    clearSession();

    return null;
  }
}

export async function authenticateWallet() {
  try {
    const walletAddress = await connectWallet();

    console.log(
      "PayQuick: wallet connected",
      walletAddress
    );

    const chainId = await ensureArcTestnet();
console.log("PayQuick: chain ID", chainId);

    console.log(
      "PayQuick: requesting challenge"
    );

    const challenge = await apiRequest(
      "/api/auth/challenge",
      {
        method: "POST",
        body: JSON.stringify({
          walletAddress
        })
      }
    );

    console.log(
      "PayQuick: challenge received"
    );

    const message =
      `Sign in to PayQuick\n\nNonce: ${challenge.nonce}`;

    console.log(
      "PayQuick: requesting wallet signature"
    );

    const signature = await signMessage(
      message,
      walletAddress
    );

    console.log(
      "PayQuick: signature received"
    );

    const verification = await apiRequest(
      "/api/auth/verify",
      {
        method: "POST",
        body: JSON.stringify({
          walletAddress,
          signature
        })
      }
    );

    console.log(
      "PayQuick: signature verified"
    );

    saveSession(
      verification.sessionToken
    );

    const merchantResult = await apiRequest(
      "/api/auth/merchant",
      {
        method: "POST"
      }
    );

    console.log(
      "PayQuick: merchant loaded"
    );

    return {
      walletAddress,
      merchant: merchantResult.merchant
    };
  } catch (error) {
    console.error(
      "PayQuick authentication failed:",
      error
    );

    throw error;
  }
}

export function logout() {
  clearSession();
}
