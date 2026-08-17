import { useState } from "react";
import { authenticateWallet } from "../services/auth.js";

export default function WalletButton({ onAuthenticated }) {
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setError("");
    setLoading(true);

    try {
      const result = await authenticateWallet();
      onAuthenticated?.(result.merchant);
      setAccount(result.walletAddress);
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
