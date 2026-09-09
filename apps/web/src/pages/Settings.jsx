import { useState, useEffect } from "react";
import { sendNativeTransfer } from "../services/blockchain.js";
import { apiRequest } from "../services/api.js";

export default function Settings({
  merchant,
  darkMode,
  setDarkMode
}) {
  const [copied, setCopied] = useState(false);

  const [withdrawTo, setWithdrawTo] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  const [apiKeys, setApiKeys] = useState([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [newRawKey, setNewRawKey] = useState("");
  const [keyError, setKeyError] = useState("");

  const theme = darkMode
    ? {
        background: "#0a0e1a",
        card: "#111827",
        text: "#f8fafc",
        muted: "#94a3b8",
        border: "#263244",
        primary: "#3b82f6",
        green: "#10b981",
        greenSoft: "rgba(16, 185, 129, 0.12)"
      }
    : {
        background: "#f8fafc",
        card: "#ffffff",
        text: "#0f172a",
        muted: "#64748b",
        border: "#e2e8f0",
        primary: "#2563eb",
        green: "#059669",
        greenSoft: "rgba(5, 150, 105, 0.08)"
      };

  function shortenAddress(address) {
    if (!address) return "Not connected";

    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  }

  async function copyWalletAddress() {
    if (!merchant?.wallet_address) return;

    try {
      await navigator.clipboard.writeText(
        merchant.wallet_address
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }

  async function loadApiKeys() {
    if (!merchant) return;

    setLoadingKeys(true);
    setKeyError("");

    try {
      const result = await apiRequest("/api/keys");
      setApiKeys(result.keys || []);
    } catch (err) {
      setKeyError(err.message || "Unable to load API keys.");
    } finally {
      setLoadingKeys(false);
    }
  }

  useEffect(() => {
    if (merchant) {
      loadApiKeys();
    } else {
      setApiKeys([]);
    }
  }, [merchant]);

  async function handleCreateKey(event) {
    event.preventDefault();

    setCreatingKey(true);
    setKeyError("");
    setNewRawKey("");

    try {
      const result = await apiRequest("/api/keys", {
        method: "POST",
        body: JSON.stringify({ name: keyName })
      });

      setNewRawKey(result.key.rawKey);
      setKeyName("");

      await loadApiKeys();
    } catch (err) {
      setKeyError(err.message || "Unable to create API key.");
    } finally {
      setCreatingKey(false);
    }
  }

  async function handleRevokeKey(keyId) {
    setKeyError("");

    try {
      await apiRequest(`/api/keys/${keyId}/revoke`, {
        method: "POST"
      });

      await loadApiKeys();
    } catch (err) {
      setKeyError(err.message || "Unable to revoke API key.");
    }
  }

  async function handleWithdraw(event) {
    event.preventDefault();

    setWithdrawing(true);
    setWithdrawError("");
    setWithdrawSuccess("");

    try {
      const txHash = await sendNativeTransfer(
        merchant.wallet_address,
        withdrawTo,
        withdrawAmount
      );

      setWithdrawSuccess(`Sent! Transaction: ${txHash}`);
      setWithdrawTo("");
      setWithdrawAmount("");
    } catch (err) {
      setWithdrawError(err.message || "Withdrawal failed.");
    } finally {
      setWithdrawing(false);
    }
  }

  const cardStyle = {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: "16px",
    padding: "22px",
    boxSizing: "border-box"
  };

  if (!merchant) {
    return (
      <section
        style={{
          minHeight: "calc(100vh - 120px)",
          background: theme.background,
          color: theme.text,
          padding: "40px 20px",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            maxWidth: "560px",
            margin: "70px auto"
          }}
        >
          <div
            style={{
              ...cardStyle,
              textAlign: "center",
              padding: "50px 30px"
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 20px",
                borderRadius: "18px",
                background: theme.primary,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: "800"
              }}
            >
              P
            </div>

            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "26px"
              }}
            >
              Settings
            </h2>

            <p
              style={{
                margin: 0,
                color: theme.muted,
                lineHeight: "1.6",
                fontSize: "14px"
              }}
            >
              Connect your wallet to view and manage
              your PayQuick settings.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      style={{
        minHeight: "calc(100vh - 120px)",
        background: theme.background,
        color: theme.text,
        padding: "30px 20px 50px",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto"
        }}
      >
        <div
          style={{
            marginBottom: "28px"
          }}
        >
          <p
            style={{
              margin: "0 0 7px",
              color: theme.muted,
              fontSize: "13px",
              fontWeight: "500"
            }}
          >
            Account settings
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              letterSpacing: "-0.7px"
            }}
          >
            Settings
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: theme.muted,
              fontSize: "14px"
            }}
          >
            Manage your PayQuick account and payment preferences.
          </p>
        </div>

        {/* ACCOUNT */}
        <div
          style={{
            ...cardStyle,
            marginBottom: "18px"
          }}
        >
          <div
            style={{
              marginBottom: "20px"
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "18px"
              }}
            >
              Account
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: theme.muted,
                fontSize: "13px"
              }}
            >
              Your connected PayQuick merchant account.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gap: "14px"
            }}
          >
            <div
              style={{
                padding: "15px",
                border: `1px solid ${theme.border}`,
                borderRadius: "12px"
              }}
            >
              <p
                style={{
                  margin: "0 0 7px",
                  color: theme.muted,
                  fontSize: "12px"
                }}
              >
                Wallet address
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap"
                }}
              >
                <strong
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: "14px"
                  }}
                >
                  {shortenAddress(
                    merchant.wallet_address
                  )}
                </strong>

                <button
                  type="button"
                  onClick={copyWalletAddress}
                  style={{
                    border: `1px solid ${theme.border}`,
                    background: theme.card,
                    color: theme.text,
                    borderRadius: "8px",
                    padding: "7px 10px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div
              style={{
                padding: "15px",
                border: `1px solid ${theme.border}`,
                borderRadius: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap"
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 5px",
                    color: theme.muted,
                    fontSize: "12px"
                  }}
                >
                  Connection status
                </p>

                <strong
                  style={{
                    fontSize: "14px"
                  }}
                >
                  Wallet connected
                </strong>
              </div>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  color: theme.green,
                  background: theme.greenSoft,
                  borderRadius: "999px",
                  padding: "7px 11px",
                  fontSize: "12px",
                  fontWeight: "600"
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: theme.green
                  }}
                />

                Connected
              </span>
            </div>
          </div>
        </div>

        {/* WITHDRAW */}
        <div
          style={{
            ...cardStyle,
            marginBottom: "18px"
          }}
        >
          <div
            style={{
              marginBottom: "20px"
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "18px"
              }}
            >
              Withdraw Funds
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: theme.muted,
                fontSize: "13px"
              }}
            >
              Send USDC from your merchant wallet to another address.
            </p>
          </div>

          <form onSubmit={handleWithdraw}>
            <div
              style={{
                display: "grid",
                gap: "14px"
              }}
            >
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: theme.muted
                }}
              >
                Recipient address

                <input
                  value={withdrawTo}
                  onChange={(event) => setWithdrawTo(event.target.value)}
                  placeholder="0x..."
                  required
                  style={{
                    height: "44px",
                    boxSizing: "border-box",
                    border: `1px solid ${theme.border}`,
                    background: theme.background,
                    color: theme.text,
                    borderRadius: "9px",
                    padding: "0 12px",
                    fontSize: "13px",
                    outline: "none",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
                  }}
                />
              </label>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: theme.muted
                }}
              >
                Amount (USDC)

                <input
                  type="number"
                  min="0"
                  step="0.000001"
                  value={withdrawAmount}
                  onChange={(event) => setWithdrawAmount(event.target.value)}
                  placeholder="10"
                  required
                  style={{
                    height: "44px",
                    boxSizing: "border-box",
                    border: `1px solid ${theme.border}`,
                    background: theme.background,
                    color: theme.text,
                    borderRadius: "9px",
                    padding: "0 12px",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </label>

              {withdrawError && (
                <p
                  role="alert"
                  style={{
                    margin: 0,
                    color: theme.red,
                    fontSize: "12px"
                  }}
                >
                  {withdrawError}
                </p>
              )}

              {withdrawSuccess && (
                <p
                  style={{
                    margin: 0,
                    color: theme.green,
                    fontSize: "12px",
                    wordBreak: "break-all"
                  }}
                >
                  {withdrawSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={withdrawing}
                style={{
                  border: "none",
                  background: theme.primary,
                  color: "#ffffff",
                  borderRadius: "9px",
                  padding: "12px 18px",
                  cursor: withdrawing ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  fontWeight: "700",
                  minHeight: "44px"
                }}
              >
                {withdrawing ? "Sending..." : "Send Withdrawal"}
              </button>
            </div>
          </form>
        </div>

        {/* API KEYS */}
        <div
          style={{
            ...cardStyle,
            marginBottom: "18px"
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ margin: 0, fontSize: "18px" }}>
              API Keys
            </h2>
            <p
              style={{
                margin: "6px 0 0",
                color: theme.muted,
                fontSize: "13px"
              }}
            >
              Generate keys for developers to integrate with PayQuick.
            </p>
          </div>

          <form onSubmit={handleCreateKey} style={{ marginBottom: "18px" }}>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input
                value={keyName}
                onChange={(event) => setKeyName(event.target.value)}
                placeholder="Key name (e.g. Website integration)"
                style={{
                  flex: 1,
                  minWidth: "200px",
                  height: "44px",
                  boxSizing: "border-box",
                  border: `1px solid ${theme.border}`,
                  background: theme.background,
                  color: theme.text,
                  borderRadius: "9px",
                  padding: "0 12px",
                  fontSize: "13px",
                  outline: "none"
                }}
              />

              <button
                type="submit"
                disabled={creatingKey}
                style={{
                  border: "none",
                  background: theme.primary,
                  color: "#ffffff",
                  borderRadius: "9px",
                  padding: "0 18px",
                  cursor: creatingKey ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  fontWeight: "700",
                  minHeight: "44px"
                }}
              >
                {creatingKey ? "Generating..." : "Generate Key"}
              </button>
            </div>
          </form>

          {newRawKey && (
            <div
              style={{
                marginBottom: "18px",
                padding: "14px",
                borderRadius: "10px",
                border: `1px solid ${theme.primary}`,
                background: theme.background
              }}
            >
              <p style={{ margin: "0 0 8px", fontSize: "12px", color: theme.muted }}>
                Copy this key now — it will not be shown again.
              </p>
              <code
                style={{
                  display: "block",
                  wordBreak: "break-all",
                  fontSize: "12px",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
                }}
              >
                {newRawKey}
              </code>
            </div>
          )}

          {keyError && (
            <p role="alert" style={{ color: theme.red, fontSize: "12px", marginBottom: "14px" }}>
              {keyError}
            </p>
          )}

          {loadingKeys ? (
            <p style={{ color: theme.muted, fontSize: "13px" }}>Loading keys...</p>
          ) : apiKeys.length === 0 ? (
            <p style={{ color: theme.muted, fontSize: "13px" }}>No API keys yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 14px",
                    border: `1px solid ${theme.border}`,
                    borderRadius: "10px",
                    flexWrap: "wrap"
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "13px" }}>
                      {key.name || "Unnamed key"}
                    </strong>
                    <div
                      style={{
                        color: theme.muted,
                        fontSize: "11px",
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
                      }}
                    >
                      {key.key_prefix}...
                    </div>
                  </div>

                  {key.revoked_at ? (
                    <span style={{ color: theme.red, fontSize: "11px", fontWeight: "700" }}>
                      Revoked
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRevokeKey(key.id)}
                      style={{
                        border: `1px solid ${theme.red}`,
                        background: "transparent",
                        color: theme.red,
                        borderRadius: "8px",
                        padding: "7px 11px",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "600"
                      }}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* APPEARANCE */}
        <div
          style={{
            ...cardStyle,
            marginBottom: "18px"
          }}
        >
          <div
            style={{
              marginBottom: "20px"
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "18px"
              }}
            >
              Appearance
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: theme.muted,
                fontSize: "13px"
              }}
            >
              Choose how PayQuick looks on your device.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
              flexWrap: "wrap"
            }}
          >
            <div>
              <strong
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "14px"
                }}
              >
                Dark mode
              </strong>

              <span
                style={{
                  color: theme.muted,
                  fontSize: "12px"
                }}
              >
                {darkMode
                  ? "Dark theme is currently enabled."
                  : "Light theme is currently enabled."}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setDarkMode(
                  (current) => !current
                )
              }
              style={{
                border: `1px solid ${theme.border}`,
                background: darkMode
                  ? theme.primary
                  : theme.card,
                color: darkMode
                  ? "#ffffff"
                  : theme.text,
                borderRadius: "10px",
                padding: "9px 14px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600"
              }}
            >
              {darkMode
                ? "Switch to Light"
                : "Switch to Dark"}
            </button>
          </div>
        </div>

        {/* PAYMENT */}
        <div
          style={{
            ...cardStyle,
            marginBottom: "18px"
          }}
        >
          <div
            style={{
              marginBottom: "20px"
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "18px"
              }}
            >
              Payment Preferences
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: theme.muted,
                fontSize: "13px"
              }}
            >
              Current payment configuration for your account.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px"
            }}
          >
            <div
              style={{
                padding: "16px",
                border: `1px solid ${theme.border}`,
                borderRadius: "12px"
              }}
            >
              <span
                style={{
                  display: "block",
                  color: theme.muted,
                  fontSize: "12px",
                  marginBottom: "8px"
                }}
              >
                Default currency
              </span>

              <strong
                style={{
                  fontSize: "18px"
                }}
              >
                USDC
              </strong>
            </div>

            <div
              style={{
                padding: "16px",
                border: `1px solid ${theme.border}`,
                borderRadius: "12px"
              }}
            >
              <span
                style={{
                  display: "block",
                  color: theme.muted,
                  fontSize: "12px",
                  marginBottom: "8px"
                }}
              >
                Network
              </span>

              <strong
                style={{
                  fontSize: "18px"
                }}
              >
                Arc Testnet
              </strong>
            </div>
          </div>
        </div>

        {/* ABOUT */}
        <div
          style={{
            ...cardStyle
          }}
        >
          <h2
            style={{
              margin: "0 0 7px",
              fontSize: "18px"
            }}
          >
            About PayQuick
          </h2>

          <p
            style={{
              margin: "0 0 18px",
              color: theme.muted,
              fontSize: "13px",
              lineHeight: "1.6"
            }}
          >
            PayQuick helps merchants create invoices,
            receive USDC payments, and track payment
            activity on Arc.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "15px",
              paddingTop: "15px",
              borderTop: `1px solid ${theme.border}`,
              color: theme.muted,
              fontSize: "12px",
              flexWrap: "wrap"
            }}
          >
            <span>PayQuick</span>
            <span>Version 0.1.0</span>
          </div>
        </div>
      </div>
    </section>
  );
}
