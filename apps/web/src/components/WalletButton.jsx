import { useEffect, useState } from "react";
import {
  authenticateWallet,
  restoreSession,
  logout
} from "../services/auth.js";

export default function WalletButton({ onAuthenticated }) {
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function restore() {
      const token = localStorage.getItem(
        "payquick_session"
      );

      if (!token) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        console.log(
          "PayQuick: restoring existing session"
        );

        const result = await restoreSession();

        if (!mounted) return;

        if (result) {
          setAccount(result.walletAddress);

          onAuthenticated?.(
            result.merchant
          );

          console.log(
            "PayQuick: session restored"
          );
        }
      } catch (err) {
        if (!mounted) return;

        setError(
          err.message ||
            "Unable to restore wallet session."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    restore();

    return () => {
      mounted = false;
    };
  }, [onAuthenticated]);

  async function handleConnect() {
    setError("");
    setLoading(true);

    try {
      const result =
        await authenticateWallet();

      setAccount(
        result.walletAddress
      );

      onAuthenticated?.(
        result.merchant
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to authenticate wallet"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    setAccount("");
  }

  return (
    <div>
      <button
        type="button"
        onClick={account ? handleLogout : handleConnect}
        disabled={loading}
      >
        {loading
          ? "Checking..."
          : account
            ? `${account.slice(0, 6)}...${account.slice(-4)}`
            : "Connect Wallet"}
      </button>

      {account && !loading && (
        <button
          type="button"
          onClick={handleLogout}
        >
          Disconnect
        </button>
      )}

      {error && (
        <p role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
