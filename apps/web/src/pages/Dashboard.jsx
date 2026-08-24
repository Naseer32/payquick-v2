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
      const [paymentsResult, invoicesResult, customersResult] =
        await Promise.all([
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
    } catch (err) {
      console.error("PayQuick dashboard stats failed:", err);

      setStatsError(
        err.message || "Unable to load dashboard statistics."
      );
    } finally {
      setLoadingStats(false);
    }
  }

  useEffect(() => {
    if (!merchant) {
      setNotifications([]);
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
        background: "#0f172a",
        card: "#111827",
        cardHover: "#1e293b",
        text: "#f8fafc",
        muted: "#94a3b8",
        border: "#334155",
        button: "#1e293b",
        primary: "#3b82f6"
      }
    : {
        background: "#f8fafc",
        card: "#ffffff",
        cardHover: "#f1f5f9",
        text: "#0f172a",
        muted: "#64748b",
        border: "#e2e8f0",
        button: "#ffffff",
        primary: "#2563eb"
      };

  const unreadCount = notifications.filter(
    (notification) => !notification.read_at
  ).length;

  function shortenAddress(address) {
    if (!address) return "";

    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  const cardStyle = {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: "16px",
    padding: "20px"
  };

  const secondaryButtonStyle = {
    border: `1px solid ${theme.border}`,
    background: theme.button,
    color: theme.text,
    borderRadius: "9px",
    padding: "9px 13px",
    cursor: "pointer",
    fontWeight: "500"
  };

  return (
    <section
      style={{
        minHeight: "calc(100vh - 120px)",
        background: theme.background,
        color: theme.text,
        padding: "28px 20px",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto"
        }}
      >
        {!merchant ? (
          <div
            style={{
              ...cardStyle,
              maxWidth: "600px",
              margin: "60px auto",
              textAlign: "center",
              padding: "48px 28px"
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 20px",
                borderRadius: "16px",
                background: theme.primary,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: "700"
              }}
            >
              P
            </div>

            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "28px"
              }}
            >
              Welcome to PayQuick
            </h2>

            <p
              style={{
                margin: 0,
                color: theme.muted,
                lineHeight: "1.6"
              }}
            >
              Connect your wallet to access your merchant
              dashboard and manage your payments.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "20px",
                marginBottom: "24px",
                flexWrap: "wrap"
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 6px",
                    color: theme.muted,
                    fontSize: "14px"
                  }}
                >
                  Merchant dashboard
                </p>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "30px",
                    letterSpacing: "-0.5px"
                  }}
                >
                  Welcome back
                </h2>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: theme.muted
                  }}
                >
                  Manage your stablecoin payments from one place.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowNotifications(
                    (current) => !current
                  )
                }
                title="Notifications"
                style={{
                  position: "relative",
                  border: `1px solid ${theme.border}`,
                  background: theme.card,
                  color: theme.text,
                  borderRadius: "11px",
                  padding: "11px 14px",
                  cursor: "pointer",
                  fontSize: "19px"
                }}
              >
                🔔

                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-7px",
                      right: "-7px",
                      minWidth: "20px",
                      height: "20px",
                      padding: "0 5px",
                      borderRadius: "999px",
                      background: "#ef4444",
                      color: "#ffffff",
                      fontSize: "10px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxSizing: "border-box"
                    }}
                  >
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>
            </div>

            <div
              style={{
                ...cardStyle,
                marginBottom: "20px"
              }}
            >
              <p
                style={{
                  margin: "0 0 8px",
                  color: theme.muted,
                  fontSize: "13px"
                }}
              >
                Connected wallet
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "15px",
                  flexWrap: "wrap"
                }}
              >
                <strong
                  style={{
                    fontSize: "17px",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, monospace"
                  }}
                >
                  {shortenAddress(
                    merchant.wallet_address
                  )}
                </strong>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    color: "#10b981",
                    fontSize: "13px",
                    fontWeight: "600"
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#10b981"
                    }}
                  />
                  Connected
                </span>
              </div>
            </div>

            {statsError && (
              <div
                style={{
                  ...cardStyle,
                  marginBottom: "20px",
                  borderColor: "#ef4444"
                }}
              >
                <p
                  role="alert"
                  style={{
                    margin: 0,
                    color: "#ef4444"
                  }}
                >
                  {statsError}
                </p>
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "16px",
                marginBottom: "20px"
              }}
            >
              <div style={cardStyle}>
                <p
                  style={{
                    margin: "0 0 12px",
                    color: theme.muted,
                    fontSize: "13px"
                  }}
                >
                  Payments
                </p>

                <strong
                  style={{
                    fontSize: "28px"
                  }}
                >
                  {loadingStats ? "..." : stats.payments}
                </strong>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: theme.muted,
                    fontSize: "13px"
                  }}
                >
                  Payment activity
                </p>
              </div>

              <div style={cardStyle}>
                <p
                  style={{
                    margin: "0 0 12px",
                    color: theme.muted,
                    fontSize: "13px"
                  }}
                >
                  Invoices
                </p>

                <strong
                  style={{
                    fontSize: "28px"
                  }}
                >
                  {loadingStats ? "..." : stats.invoices}
                </strong>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: theme.muted,
                    fontSize: "13px"
                  }}
                >
                  Invoice activity
                </p>
              </div>

                          <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "16px",
                marginBottom: "20px"
              }}
            >
              <div style={cardStyle}>
                <p
                  style={{
                    margin: "0 0 12px",
                    color: theme.muted,
                    fontSize: "13px"
                  }}
                >
                  Total Received
                </p>

                <strong style={{ fontSize: "28px" }}>
                  {loadingStats
                    ? "..."
                    : `${stats.totalReceived.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2
                      })} ${stats.currency}`}
                </strong>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: theme.muted,
                    fontSize: "13px"
                  }}
                >
                  Confirmed payments
                </p>
              </div>

              <div style={cardStyle}>
                <p
                  style={{
                    margin: "0 0 12px",
                    color: theme.muted,
                    fontSize: "13px"
                  }}
                >
                  Payments
                </p>

                <strong style={{ fontSize: "28px" }}>
                  {loadingStats ? "..." : stats.payments}
                </strong>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: theme.muted,
                    fontSize: "13px"
                  }}
                >
                  Payment activity
                </p>
              </div>

              <div style={cardStyle}>
                <p
                  style={{
                    margin: "0 0 12px",
                    color: theme.muted,
                    fontSize: "13px"
                  }}
                >
                  Invoices
                </p>

                <strong style={{ fontSize: "28px" }}>
                  {loadingStats ? "..." : stats.invoices}
                </strong>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: theme.muted,
                    fontSize: "13px"
                  }}
                >
                  Invoice activity
                </p>
              </div>

              <div style={cardStyle}>
                <p
                  style={{
                    margin: "0 0 12px",
                    color: theme.muted,
                    fontSize: "13px"
                  }}
                >
                  Customers
                </p>

                <strong style={{ fontSize: "28px" }}>
                  {loadingStats ? "..." : stats.customers}
                </strong>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: theme.muted,
                    fontSize: "13px"
                  }}
                >
                  Customer records
                </p>
              </div>
            </div>


            {showNotifications && (
              <div style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                    flexWrap: "wrap"
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "20px"
                      }}
                    >
                      Notifications
                    </h3>

                    <p
                      style={{
                        margin: "5px 0 0",
                        color: theme.muted,
                        fontSize: "13px"
                      }}
                    >
                      Recent account activity
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadNotifications}
                    disabled={loadingNotifications}
                    style={secondaryButtonStyle}
                  >
                    {loadingNotifications
                      ? "Loading..."
                      : "Refresh"}
                  </button>
                </div>

                {notificationError && (
                  <p role="alert">
                    {notificationError}
                  </p>
                )}

                {!loadingNotifications &&
                  notifications.length === 0 && (
                    <p
                      style={{
                        color: theme.muted,
                        padding: "20px 0"
                      }}
                    >
                      No notifications yet.
                    </p>
                  )}

                {!loadingNotifications &&
                  notifications.length > 0 && (
                    <div>
                      {notifications.map(
                        (notification) => (
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
                                justifyContent:
                                  "space-between",
                                gap: "15px"
                              }}
                            >
                              <div>
                                <h4
                                  style={{
                                    margin:
                                      "0 0 7px"
                                  }}
                                >
                                  {
                                    notification.title
                                  }
                                </h4>

                                {notification.body && (
                                  <p
                                    style={{
                                      margin:
                                        "0 0 8px",
                                      color:
                                        theme.muted,
                                      lineHeight:
                                        "1.5"
                                    }}
                                  >
                                    {
                                      notification.body
                                    }
                                  </p>
                                )}

                                <small
                                  style={{
                                    color:
                                      theme.muted
                                  }}
                                >
                                  {new Date(
                                    notification.created_at
                                  ).toLocaleString()}
                                </small>
                              </div>

                              {!notification.read_at && (
                                <span
                                  style={{
                                    color:
                                      theme.primary,
                                    fontSize:
                                      "12px",
                                    fontWeight:
                                      "600",
                                    whiteSpace:
                                      "nowrap"
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
                                  marginTop: "10px",
                                  border: "none",
                                  background: "transparent",
                                  color: theme.primary,
                                  padding: 0,
                                  cursor: "pointer",
                                  fontWeight: "600"
                                }}
                              >
                                Mark as read
                              </button>
                            )}
                          </article>
                        )
                      )}
                    </div>
                  )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
            
           
