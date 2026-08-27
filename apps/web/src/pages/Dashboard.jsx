import { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";

export default function Dashboard({ merchant, darkMode }) {
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const [stats, setStats] = useState({
    payments: 0,
    invoices: 0,
    customers: 0,
    totalReceived: 0,
    currency: "USDC"
  });

  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");

  async function loadNotifications() {
    if (!merchant) return;

    setLoadingNotifications(true);
    setNotificationError("");

    try {
      const result = await apiRequest("/api/notifications");
      setNotifications(result.notifications || []);
    } catch (err) {
      setNotificationError(
        err.message || "Unable to load notifications."
      );
    } finally {
      setLoadingNotifications(false);
    }
  }

  async function markAsRead(notificationId) {
    try {
      await apiRequest(
        `/api/notifications/${notificationId}/read`,
        {
          method: "POST"
        }
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                read_at: new Date().toISOString()
              }
            : notification
        )
      );
    } catch (err) {
      setNotificationError(
        err.message || "Unable to mark notification as read."
      );
    }
  }

  async function loadStats() {
    if (!merchant) return;

    setLoadingStats(true);
    setStatsError("");

    try {
      const [
        paymentsResult,
        invoicesResult,
        customersResult
      ] = await Promise.all([
        apiRequest("/api/payments"),
        apiRequest("/api/invoices"),
        apiRequest("/api/customers")
      ]);

      const payments = paymentsResult.payments || [];
      const invoices = invoicesResult.invoices || [];
      const customers = customersResult.customers || [];

      const successfulPayments = payments.filter(
        (payment) =>
          payment.status === "confirmed" ||
          payment.status === "paid"
      );

      const totalReceived = successfulPayments.reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      );

      const currency =
        successfulPayments.find(
          (payment) => payment.currency
        )?.currency || "USDC";

      setStats({
        payments: payments.length,
        invoices: invoices.length,
        customers: customers.length,
        totalReceived,
        currency
      });

      const sortedInvoices = [...invoices].sort((a, b) => {
        const dateA = new Date(
          a.created_at || a.updated_at || 0
        ).getTime();

        const dateB = new Date(
          b.created_at || b.updated_at || 0
        ).getTime();

        return dateB - dateA;
      });

      setRecentInvoices(sortedInvoices.slice(0, 6));
    } catch (err) {
      console.error(
        "PayQuick dashboard stats failed:",
        err
      );

      setStatsError(
        err.message ||
          "Unable to load dashboard statistics."
      );
    } finally {
      setLoadingStats(false);
    }
  }

  useEffect(() => {
    if (!merchant) {
      setNotifications([]);
      setRecentInvoices([]);
      setShowNotifications(false);

      setStats({
        payments: 0,
        invoices: 0,
        customers: 0,
        totalReceived: 0,
        currency: "USDC"
      });

      return;
    }

    loadNotifications();
    loadStats();
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
        primarySoft: "rgba(59, 130, 246, 0.12)",
        green: "#10b981",
        greenSoft: "rgba(16, 185, 129, 0.12)",
        amber: "#f59e0b",
        amberSoft: "rgba(245, 158, 11, 0.12)",
        red: "#ef4444",
        redSoft: "rgba(239, 68, 68, 0.12)"
      }
    : {
        background: "#f8fafc",
        card: "#ffffff",
        cardHover: "#f1f5f9",
        text: "#0f172a",
        muted: "#64748b",
        border: "#e2e8f0",
        primary: "#2563eb",
        primarySoft: "rgba(37, 99, 235, 0.08)",
        green: "#059669",
        greenSoft: "rgba(5, 150, 105, 0.08)",
        amber: "#d97706",
        amberSoft: "rgba(217, 119, 6, 0.08)",
        red: "#dc2626",
        redSoft: "rgba(220, 38, 38, 0.08)"
      };

  const unreadCount = notifications.filter(
    (notification) => !notification.read_at
  ).length;

  function shortenAddress(address) {
    if (!address) return "Unknown";

    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  function formatAmount(amount) {
    return Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  function formatRelativeTime(dateValue) {
    if (!dateValue) return "Unknown";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Unknown";
    }

    const seconds = Math.floor(
      (Date.now() - date.getTime()) / 1000
    );

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 30) {
      return `${days}d ago`;
    }

    return date.toLocaleDateString();
  }

  function getStatusStyle(status) {
    const normalized = String(status || "").toLowerCase();

    if (
      normalized === "paid" ||
      normalized === "confirmed"
    ) {
      return {
        background: theme.greenSoft,
        color: theme.green
      };
    }

    if (
      normalized === "pending" ||
      normalized === "processing"
    ) {
      return {
        background: theme.amberSoft,
        color: theme.amber
      };
    }

    if (
      normalized === "failed" ||
      normalized === "cancelled" ||
      normalized === "expired"
    ) {
      return {
        background: theme.redSoft,
        color: theme.red
      };
    }

    return {
      background: theme.primarySoft,
      color: theme.primary
    };
  }

  const cardStyle = {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: "16px",
    boxSizing: "border-box"
  };

  if (!merchant) {
    return (
      <section
        style={{
          minHeight: "calc(100vh - 72px)",
          background: theme.background,
          color: theme.text,
          padding: "60px 20px",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            maxWidth: "560px",
            margin: "60px auto"
          }}
        >
          <div
            style={{
              ...cardStyle,
              padding: "56px 32px",
              textAlign: "center"
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 22px",
                borderRadius: "18px",
                background: theme.primary,
                color: "#fff",
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
                fontSize: "27px",
                letterSpacing: "-0.6px"
              }}
            >
              Welcome to PayQuick
            </h2>

            <p
              style={{
                margin: 0,
                color: theme.muted,
                lineHeight: "1.7",
                fontSize: "14px"
              }}
            >
              Connect your wallet to access your
              merchant dashboard and manage your
              stablecoin payments.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      style={{
        minHeight: "calc(100vh - 72px)",
        background: theme.background,
        color: theme.text,
        padding: "34px 28px 60px",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto"
        }}
      >
        {/* DASHBOARD HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            marginBottom: "28px",
            flexWrap: "wrap"
          }}
        >
          <div>
            <div
              style={{
                color: theme.primary,
                fontSize: "12px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.7px",
                marginBottom: "8px"
              }}
            >
              Overview
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "30px",
                lineHeight: "1.2",
                letterSpacing: "-0.8px"
              }}
            >
              Welcome back
            </h1>

            <p
              style={{
                margin: "9px 0 0",
                color: theme.muted,
                fontSize: "14px"
              }}
            >
              Monitor your invoices, customers and
              payment activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowNotifications((current) => !current)
            }
            style={{
              position: "relative",
              width: "46px",
              height: "46px",
              border: `1px solid ${theme.border}`,
              background: theme.card,
              color: theme.text,
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "17px"
            }}
            title="Notifications"
          >
            🔔

            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  minWidth: "19px",
                  height: "19px",
                  padding: "0 4px",
                  borderRadius: "999px",
                  background: theme.red,
                  color: "#fff",
                  fontSize: "9px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* WALLET SUMMARY */}

        <div
          style={{
            ...cardStyle,
            padding: "18px 20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "13px"
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "11px",
                background: theme.primarySoft,
                color: theme.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800"
              }}
            >
              $
            </div>

            <div>
              <p
                style={{
                  margin: "0 0 4px",
                  color: theme.muted,
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
              >
                Connected wallet
              </p>

              <strong
                style={{
                  fontSize: "14px",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, monospace"
                }}
              >
                {shortenAddress(merchant.wallet_address)}
              </strong>
            </div>
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
              fontSize: "11px",
              fontWeight: "700"
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

        {/* ERROR */}

        {statsError && (
          <div
            style={{
              ...cardStyle,
              padding: "15px 18px",
              marginBottom: "20px",
              borderColor: theme.red,
              background: theme.redSoft
            }}
          >
            <p
              role="alert"
              style={{
                margin: 0,
                color: theme.red,
                fontSize: "13px"
              }}
            >
              {statsError}
            </p>
          </div>
        )}

        {/* STATS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "14px",
            marginBottom: "24px"
          }}
        >
          <div
            style={{
              ...cardStyle,
              padding: "22px"
            }}
          >
            <p
              style={{
                margin: "0 0 14px",
                color: theme.muted,
                fontSize: "12px"
              }}
            >
              Total Received
            </p>

            <strong
              style={{
                display: "block",
                fontSize: "28px",
                letterSpacing: "-0.8px"
              }}
            >
              {loadingStats
                ? "..."
                : `${formatAmount(stats.totalReceived)} ${stats.currency}`}
            </strong>

            <div
              style={{
                marginTop: "12px",
                display: "inline-flex",
                padding: "5px 8px",
                borderRadius: "7px",
                background: theme.greenSoft,
                color: theme.green,
                fontSize: "10px",
                fontWeight: "700"
              }}
            >
              CONFIRMED
            </div>
          </div>

          <div
            style={{
              ...cardStyle,
              padding: "22px"
            }}
          >
            <p
              style={{
                margin: "0 0 14px",
                color: theme.muted,
                fontSize: "12px"
              }}
            >
              Invoices
            </p>

            <strong
              style={{
                display: "block",
                fontSize: "28px"
              }}
            >
              {loadingStats ? "..." : stats.invoices}
            </strong>

            <p
              style={{
                margin: "10px 0 0",
                color: theme.muted,
                fontSize: "11px"
              }}
            >
              Total invoice records
            </p>
          </div>

          <div
            style={{
              ...cardStyle,
              padding: "22px"
            }}
          >
            <p
              style={{
                margin: "0 0 14px",
                color: theme.muted,
                fontSize: "12px"
              }}
            >
              Payments
            </p>

            <strong
              style={{
                display: "block",
                fontSize: "28px"
              }}
            >
              {loadingStats ? "..." : stats.payments}
            </strong>

            <p
              style={{
                margin: "10px 0 0",
                color: theme.muted,
                fontSize: "11px"
              }}
            >
              Payment activity
            </p>
          </div>

          <div
            style={{
              ...cardStyle,
              padding: "22px"
            }}
          >
            <p
              style={{
                margin: "0 0 14px",
                color: theme.muted,
                fontSize: "12px"
              }}
            >
              Customers
            </p>

            <strong
              style={{
                display: "block",
                fontSize: "28px"
              }}
            >
              {loadingStats ? "..." : stats.customers}
            </strong>

            <p
              style={{
                margin: "10px 0 0",
                color: theme.muted,
                fontSize: "11px"
              }}
            >
              Customer records
            </p>
          </div>
        </div>

        {/* RECENT INVOICES */}

        <div
          style={{
            ...cardStyle,
            overflow: "hidden",
            marginBottom: "24px"
          }}
        >
          <div
            style={{
              padding: "21px 22px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap"
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  letterSpacing: "-0.2px"
                }}
              >
                Recent Invoices
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: theme.muted,
                  fontSize: "12px"
                }}
              >
                Your latest invoice activity
              </p>
            </div>

            <button
              type="button"
              onClick={loadStats}
              disabled={loadingStats}
              style={{
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text,
                borderRadius: "9px",
                padding: "8px 12px",
                cursor: loadingStats
                  ? "not-allowed"
                  : "pointer",
                fontSize: "11px",
                fontWeight: "600"
              }}
            >
              {loadingStats ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loadingStats ? (
            <div
              style={{
                borderTop: `1px solid ${theme.border}`,
                padding: "38px 20px",
                textAlign: "center",
                color: theme.muted,
                fontSize: "13px"
              }}
            >
              Loading invoices...
            </div>
          ) : recentInvoices.length === 0 ? (
            <div
              style={{
                borderTop: `1px solid ${theme.border}`,
                padding: "45px 20px",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  margin: "0 auto 12px",
                  borderRadius: "12px",
                  background: theme.primarySoft,
                  color: theme.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px"
                }}
              >
                +
              </div>

              <p
                style={{
                  margin: 0,
                  color: theme.muted,
                  fontSize: "13px"
                }}
              >
                No invoices yet.
              </p>
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
                borderTop: `1px solid ${theme.border}`
              }}
            >
              <div style={{ minWidth: "650px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1.2fr 1.5fr 1fr 1fr 0.8fr",
                    gap: "15px",
                    padding: "11px 22px",
                    color: theme.muted,
                    fontSize: "10px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}
                >
                  <span>Invoice</span>
                  <span>Customer</span>
                  <span>Amount</span>
                  <span>Status</span>
                  <span>Time</span>
                </div>

                {recentInvoices.map((invoice) => {
                  const statusStyle =
                    getStatusStyle(invoice.status);

                  return (
                    <div
                      key={invoice.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "1.2fr 1.5fr 1fr 1fr 0.8fr",
                        gap: "15px",
                        padding: "16px 22px",
                        borderTop: `1px solid ${theme.border}`,
                        alignItems: "center",
                        fontSize: "12px"
                      }}
                    >
                      <strong>
                        {invoice.invoice_number ||
                          invoice.id?.slice(0, 8)}
                      </strong>

                      <span
                        style={{
                          color: theme.muted
                        }}
                      >
                        {invoice.customer_name ||
                          invoice.customer_email ||
                          "No customer"}
                      </span>

                      <strong>
                        {formatAmount(invoice.amount)}{" "}
                        {invoice.currency || "USDC"}
                      </strong>

                      <span
                        style={{
                          ...statusStyle,
                          display: "inline-flex",
                          width: "fit-content",
                          borderRadius: "999px",
                          padding: "5px 9px",
                          fontSize: "9px",
                          fontWeight: "700",
                          textTransform: "capitalize"
                        }}
                      >
                        {invoice.status || "unknown"}
                      </span>

                      <span
                        style={{
                          color: theme.muted,
                          fontSize: "10px"
                        }}
                      >
                        {formatRelativeTime(
                          invoice.created_at
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* NOTIFICATIONS */}

        {showNotifications && (
          <div
            style={{
              ...cardStyle,
              padding: "21px 22px"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginBottom: "6px",
                flexWrap: "wrap"
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "17px"
                  }}
                >
                  Notifications
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: theme.muted,
                    fontSize: "12px"
                  }}
                >
                  Recent account activity
                </p>
              </div>

              <button
                type="button"
                onClick={loadNotifications}
                disabled={loadingNotifications}
                style={{
                  border: `1px solid ${theme.border}`,
                  background: theme.card,
                  color: theme.text,
                  borderRadius: "9px",
                  padding: "8px 12px",
                  cursor: loadingNotifications
                    ? "not-allowed"
                    : "pointer",
                  fontSize: "11px",
                  fontWeight: "600"
                }}
              >
                {loadingNotifications
                  ? "Loading..."
                  : "Refresh"}
              </button>
            </div>

            {notificationError && (
              <p
                role="alert"
                style={{
                  color: theme.red,
                  fontSize: "12px"
                }}
              >
                {notificationError}
              </p>
            )}

            {!loadingNotifications &&
              notifications.length === 0 && (
                <p
                  style={{
                    color: theme.muted,
                    padding: "20px 0",
                    fontSize: "13px"
                  }}
                >
                  No notifications yet.
                </p>
              )}

            {!loadingNotifications &&
              notifications.length > 0 &&
              notifications.map((notification) => (
                <article
                  key={notification.id}
                  style={{
                    borderTop: `1px solid ${theme.border}`,
                    padding: "17px 0"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "15px"
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          margin: "0 0 6px",
                          fontSize: "13px"
                        }}
                      >
                        {notification.title}
                      </h4>

                      {notification.body && (
                        <p
                          style={{
                            margin: "0 0 7px",
                            color: theme.muted,
                            lineHeight: "1.5",
                            fontSize: "12px"
                          }}
                        >
                          {notification.body}
                        </p>
                      )}

                      <small
                        style={{
                          color: theme.muted,
                          fontSize: "10px"
                        }}
                      >
                        {formatRelativeTime(
                          notification.created_at
                        )}
                      </small>
                    </div>

                    {!notification.read_at && (
                      <span
                        style={{
                          color: theme.primary,
                          fontSize: "10px",
                          fontWeight: "700"
                        }}
                      >
                        Unread
                      </span>
                    )}
                  </div>

                  {!notification.read_at && (
                    <button
                      type="button"
                      onClick={() =>
                        markAsRead(notification.id)
                      }
                      style={{
                        marginTop: "9px",
                        border: "none",
                        background: "transparent",
                        color: theme.primary,
                        padding: 0,
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "600"
                      }}
                    >
                      Mark as read
                    </button>
                  )}
                </article>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
