import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../services/api.js";

export default function Payments({ merchant, darkMode = false }) {
  const loadPaymentsRequestId = useRef(0);

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function shortenAddress(address) {
    if (!address) return "Unknown";
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  }

  function shortenTxHash(txHash) {
    if (!txHash) return "Unknown";
    return `${txHash.slice(0, 8)}...${txHash.slice(-6)}`;
  }

  function formatAmount(amount) {
    return Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6
    });
  }

  function formatDate(dateValue) {
    if (!dateValue) return "Unknown";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Unknown";
    }

    return date.toLocaleString();
  }

  function getStatusStyle(status) {
    const normalized = String(status || "").toLowerCase();

    if (
      normalized === "confirmed" ||
      normalized === "paid"
    ) {
      return {
        background: darkMode
          ? "rgba(16, 185, 129, 0.12)"
          : "rgba(5, 150, 105, 0.08)",
        color: darkMode ? "#10b981" : "#059669"
      };
    }

    if (
      normalized === "pending" ||
      normalized === "processing"
    ) {
      return {
        background: darkMode
          ? "rgba(245, 158, 11, 0.12)"
          : "rgba(217, 119, 6, 0.08)",
        color: darkMode ? "#f59e0b" : "#d97706"
      };
    }

    if (
      normalized === "failed" ||
      normalized === "cancelled" ||
      normalized === "expired"
    ) {
      return {
        background: darkMode
          ? "rgba(239, 68, 68, 0.12)"
          : "rgba(220, 38, 38, 0.08)",
        color: darkMode ? "#ef4444" : "#dc2626"
      };
    }

    return {
      background: darkMode
        ? "rgba(59, 130, 246, 0.12)"
        : "rgba(37, 99, 235, 0.08)",
      color: darkMode ? "#3b82f6" : "#2563eb"
    };
  }

  async function loadPayments() {
    const requestId = ++loadPaymentsRequestId.current;

    setLoading(true);
    setError("");

    try {
      const result = await apiRequest("/api/payments");

      if (requestId === loadPaymentsRequestId.current) {
        setPayments(result.payments || []);
      }
    } catch (err) {
      if (requestId === loadPaymentsRequestId.current) {
        setError(
          err.message || "Unable to load payments."
        );
      }
    } finally {
      if (requestId === loadPaymentsRequestId.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (!merchant) {
      setPayments([]);
      return;
    }

    loadPayments();
  }, [merchant]);

  const theme = darkMode
    ? {
        background: "#0a0e1a",
        card: "#111827",
        cardHover: "#172033",
        text: "#f8fafc",
        muted: "#94a3b8",
        border: "#263244",
        primary: "#3b82f6",
        green: "#10b981",
        red: "#ef4444"
      }
    : {
        background: "#f8fafc",
        card: "#ffffff",
        cardHover: "#f8fafc",
        text: "#0f172a",
        muted: "#64748b",
        border: "#e2e8f0",
        primary: "#2563eb",
        green: "#059669",
        red: "#dc2626"
      };

  const cardStyle = {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: "16px"
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
            ...cardStyle,
            maxWidth: "560px",
            margin: "80px auto",
            padding: "50px 30px",
            textAlign: "center"
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
            ↗
          </div>

          <h2
            style={{
              margin: "0 0 10px",
              fontSize: "26px"
            }}
          >
            Payment History
          </h2>

          <p
            style={{
              margin: 0,
              color: theme.muted,
              lineHeight: "1.6"
            }}
          >
            Connect your wallet to view your payment
            history.
          </p>
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
          maxWidth: "1120px",
          margin: "0 auto"
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            marginBottom: "25px",
            flexWrap: "wrap"
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 6px",
                color: theme.muted,
                fontSize: "13px"
              }}
            >
              Merchant dashboard
            </p>

            <h1
              style={{
                margin: 0,
                fontSize: "30px",
                lineHeight: "1.2",
                letterSpacing: "-0.7px"
              }}
            >
              Payment History
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: theme.muted,
                fontSize: "14px"
              }}
            >
              Track confirmed and pending payments.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPayments}
            disabled={loading}
            style={{
              border: `1px solid ${theme.border}`,
              background: theme.card,
              color: theme.text,
              borderRadius: "10px",
              padding: "10px 15px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontSize: "13px",
              fontWeight: "600"
            }}
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {/* SUMMARY */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "15px",
            marginBottom: "22px"
          }}
        >
          <div
            style={{
              ...cardStyle,
              padding: "18px 20px"
            }}
          >
            <p
              style={{
                margin: "0 0 9px",
                color: theme.muted,
                fontSize: "12px"
              }}
            >
              Total Payments
            </p>

            <strong
              style={{
                fontSize: "25px"
              }}
            >
              {loading ? "..." : payments.length}
            </strong>
          </div>

          <div
            style={{
              ...cardStyle,
              padding: "18px 20px"
            }}
          >
            <p
              style={{
                margin: "0 0 9px",
                color: theme.muted,
                fontSize: "12px"
              }}
            >
              Confirmed
            </p>

            <strong
              style={{
                fontSize: "25px",
                color: theme.green
              }}
            >
              {loading
                ? "..."
                : payments.filter(
                    (payment) =>
                      payment.status === "confirmed" ||
                      payment.status === "paid"
                  ).length}
            </strong>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            style={{
              ...cardStyle,
              padding: "15px 18px",
              marginBottom: "20px",
              borderColor: theme.red
            }}
          >
            <p
              style={{
                margin: 0,
                color: theme.red,
                fontSize: "13px"
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* PAYMENT LIST */}
        {loading && payments.length === 0 && (
          <div
            style={{
              ...cardStyle,
              padding: "45px 20px",
              textAlign: "center",
              color: theme.muted
            }}
          >
            Loading payment history...
          </div>
        )}

        {!loading && payments.length === 0 && (
          <div
            style={{
              ...cardStyle,
              padding: "50px 20px",
              textAlign: "center"
            }}
          >
            <div
              style={{
                fontSize: "32px",
                marginBottom: "12px"
              }}
            >
              ↗
            </div>

            <h3
              style={{
                margin: "0 0 7px",
                fontSize: "18px"
              }}
            >
              No payments yet
            </h3>

            <p
              style={{
                margin: 0,
                color: theme.muted,
                fontSize: "13px"
              }}
            >
              Completed payments will appear here.
            </p>
          </div>
        )}

        {!loading && payments.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}
          >
            {payments.map((payment) => {
              const statusStyle = getStatusStyle(
                payment.status
              );

              return (
                <article
                  key={payment.id}
                  style={{
                    ...cardStyle,
                    padding: "20px"
                  }}
                >
                  {/* TOP */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "15px",
                      marginBottom: "20px",
                      flexWrap: "wrap"
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: "0 0 7px",
                          color: theme.muted,
                          fontSize: "11px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: "600"
                        }}
                      >
                        Invoice
                      </p>

                      <h3
                        style={{
                          margin: 0,
                          fontSize: "17px"
                        }}
                      >
                        {payment.invoice_number ||
                          "Payment"}
                      </h3>

                      {payment.description && (
                        <p
                          style={{
                            margin: "6px 0 0",
                            color: theme.muted,
                            fontSize: "13px"
                          }}
                        >
                          {payment.description}
                        </p>
                      )}
                    </div>

                    <div
                      style={{
                        textAlign: "right"
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          fontSize: "22px",
                          letterSpacing: "-0.3px"
                        }}
                      >
                        {formatAmount(
                          payment.amount
                        )}{" "}
                        {payment.currency || "USDC"}
                      </strong>

                      <span
                        style={{
                          ...statusStyle,
                          display: "inline-flex",
                          marginTop: "7px",
                          borderRadius: "999px",
                          padding: "5px 10px",
                          fontSize: "10px",
                          fontWeight: "700",
                          textTransform: "capitalize"
                        }}
                      >
                        {payment.status || "unknown"}
                      </span>
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "12px",
                      marginBottom: "18px"
                    }}
                  >
                    <div
                      style={{
                        border: `1px solid ${theme.border}`,
                        borderRadius: "11px",
                        padding: "13px"
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 5px",
                          color: theme.muted,
                          fontSize: "10px",
                          textTransform: "uppercase",
                          fontWeight: "600"
                        }}
                      >
                        From
                      </p>

                      <strong
                        style={{
                          fontSize: "12px",
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, monospace"
                        }}
                        title={payment.payer_address}
                      >
                        {shortenAddress(
                          payment.payer_address
                        )}
                      </strong>
                    </div>

                    <div
                      style={{
                        border: `1px solid ${theme.border}`,
                        borderRadius: "11px",
                        padding: "13px"
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 5px",
                          color: theme.muted,
                          fontSize: "10px",
                          textTransform: "uppercase",
                          fontWeight: "600"
                        }}
                      >
                        To
                      </p>

                      <strong
                        style={{
                          fontSize: "12px",
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, monospace"
                        }}
                        title={payment.receiver_address}
                      >
                        {shortenAddress(
                          payment.receiver_address
                        )}
                      </strong>
                    </div>

                    <div
                      style={{
                        border: `1px solid ${theme.border}`,
                        borderRadius: "11px",
                        padding: "13px"
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 5px",
                          color: theme.muted,
                          fontSize: "10px",
                          textTransform: "uppercase",
                          fontWeight: "600"
                        }}
                      >
                        Customer
                      </p>

                      <strong
                        style={{
                          fontSize: "12px"
                        }}
                      >
                        {payment.customer_name ||
                          payment.customer_email ||
                          "No customer"}
                      </strong>
                    </div>

                    <div
                      style={{
                        border: `1px solid ${theme.border}`,
                        borderRadius: "11px",
                        padding: "13px"
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 5px",
                          color: theme.muted,
                          fontSize: "10px",
                          textTransform: "uppercase",
                          fontWeight: "600"
                        }}
                      >
                        Block
                      </p>

                      <strong
                        style={{
                          fontSize: "12px"
                        }}
                      >
                        {payment.block_number ??
                          "Pending"}
                      </strong>
                    </div>
                  </div>

                  {/* TRANSACTION */}
                  <div
                    style={{
                      borderTop: `1px solid ${theme.border}`,
                      paddingTop: "15px",
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
                          fontSize: "10px",
                          textTransform: "uppercase",
                          fontWeight: "600"
                        }}
                      >
                        Transaction
                      </p>

                      {payment.tx_hash ? (
                        <a
                          href={`https://testnet.arcscan.app/tx/${payment.tx_hash}`}
                          target="_blank"
                          rel="noreferrer"
                          title={payment.tx_hash}
                          style={{
                            color: theme.primary,
                            fontSize: "12px",
                            fontFamily:
                              "ui-monospace, SFMono-Regular, Menlo, monospace",
                            textDecoration: "none"
                          }}
                        >
                          {shortenTxHash(
                            payment.tx_hash
                          )}{" "}
                          ↗
                        </a>
                      ) : (
                        <span
                          style={{
                            color: theme.muted,
                            fontSize: "12px"
                          }}
                        >
                          No transaction hash
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "18px",
                        flexWrap: "wrap"
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: "0 0 4px",
                            color: theme.muted,
                            fontSize: "10px"
                          }}
                        >
                          Confirmed
                        </p>

                        <span
                          style={{
                            fontSize: "11px"
                          }}
                        >
                          {payment.confirmed_at
                            ? formatDate(
                                payment.confirmed_at
                              )
                            : "Pending"}
                        </span>
                      </div>

                      <div>
                        <p
                          style={{
                            margin: "0 0 4px",
                            color: theme.muted,
                            fontSize: "10px"
                          }}
                        >
                          Created
                        </p>

                        <span
                          style={{
                            fontSize: "11px"
                          }}
                        >
                          {formatDate(
                            payment.created_at
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
