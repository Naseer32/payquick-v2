import { useState } from "react";
import { connectWallet } from "../services/blockchain.js";

export default function WalletButton() {
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");

  async function handleConnect() {
    setError("");

    try {
      const address = await connectWallet();
      setAccount(address);
    } catch (err) {
      setError(err.message || "Unable to connect wallet");
    }
  }

  return (
    <div>
      <button type="button" onClick={handleConnect}>
        {account
          ? `${account.slice(0, 6)}...${account.slice(-4)}`
          : "Connect Wallet"}
      </button>

      {error && <p role="alert">{error}</p>}
    </div>
  );
}
