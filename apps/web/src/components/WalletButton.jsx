import { useState } from "react";
import {
  connectWallet,
  getChainId,
  isArcTestnet,
  signMessage
} from "../services/blockchain.js";
import {
  apiRequest,
  saveSession
} from "../services/api.js";

export default function WalletButton() {
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setError("");
    setLoading(true);

    try {
      const address = await connectWallet();
      const chainId = await getChainId();

      if (!isArcTestnet(chainId)) {
        setAccount("");
        throw new Error("Please switch your wallet to Arc Testnet.");
      }

      const challenge = await apiRequest("/api/auth/challenge", {
        method: "POST",
        body: JSON.stringify({
          walletAddress: address
        })
      });

      const signature = await signMessage(challenge.nonce);

      const verification = await apiRequest("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({
          walletAddress: address,
          signature
        })
      });

      saveSession(verification.sessionToken);

      await apiRequest("/api/auth/merchant", {
        method: "POST"
      });

      setAccount(address);
    } catch (err) {
      setError(err.message || "Unable to authenticate wallet");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleConnect}
        disabled={loading}
      >
        {loading
          ? "Connecting..."
          : account
            ? `${account.slice(0, 6)}...${account.slice(-4)}`
            : "Connect Wallet"}
      </button>

      {error && <p role="alert">{error}</p>}
    </div>
  );
}
