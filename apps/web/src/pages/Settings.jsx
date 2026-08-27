import { useState } from "react";

export default function Settings({
  merchant,
  darkMode,
  setDarkMode
}) {
  const [copied, setCopied] = useState(false);

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
