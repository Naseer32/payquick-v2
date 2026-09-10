import { useEffect, useState } from "react";
import {
  authenticateWallet,
  restoreSession,
  logout
} from "../services/auth.js";

export default function WalletButton({ onAuthenticated, isMobile = false }) {
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

  const buttonFontSize = isMobile ? "11px" : "13px";
  const buttonPadding = isMobile ? "8px 10px" : "10px 16px";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-end" : "center",
        gap: isMobile ? "6px" : "8px"
      }}
    >
      <button
        type="button"
        onClick={account ? handleLogout : handleConnect}
        disabled={loading}
        style={{
          border: "1px solid #2563eb",
          background: loading ? "#93c5fd" : "#2563eb",
          color: "#ffffff",
          borderRadius: "10px",
          padding: buttonPadding,
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: buttonFontSize,
          fontWeight: "700",
          whiteSpace: "nowrap"
        }}
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
          style={{
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#334155",
            borderRadius: "10px",
            padding: buttonPadding,
            cursor: "pointer",
            fontSize: buttonFontSize,
            fontWeight: "600",
            whiteSpace: "nowrap"
          }}
        >
          Disconnect
        </button>
      )}

      {error && (
        <p
          role="alert"
          style={{
            margin: 0,
            fontSize: "10px",
            color: "#dc2626",
            maxWidth: "140px",
            textAlign: "right"
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
