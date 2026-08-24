import { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";

export default function Dashboard({ merchant }) {
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("payquick_theme") === "dark";
    } catch {
      return false;
    }
  });

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

  useEffect(() => {
    try {
      localStorage.setItem(
        "payquick_theme",
        darkMode ? "dark" : "light"
      );
    } catch {
      // Ignore localStorage errors.
    }
  }, [darkMode]);

  useEffect(() => {
    if (!merchant) {
      setNotifications([]);
      setShowNotifications(false);
      return;
    }

    loadNotifications();
  }, [merchant]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read_at
  ).length;

  const theme = {
    page: darkMode ? "#0f172a" : "#f8fafc",
    card: darkMode ? "#111827" : "#ffffff",
    cardSecondary: darkMode ? "#1e293b" : "#f8fafc",
    text: darkMode ? "#f8fafc" : "#0f172a",
    muted: darkMode ? "#94a3b8" : "#64748b",
    border: darkMode ? "#334155" : "#e2e8f0",
    accent: "#2563eb",
    accentHover: "#1d4ed8",
    success: darkMode ? "#34d399" : "#059669",
    danger: "#ef4444"
  };

  function shortenAddress(address) {
    if (!address) return "";

    if (address.length <= 14) {
      return address;
    }

    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return (
    <section
      style={{
        minHeight: "100%",
        background: theme.page,
        color: theme.text,
        padding: "24px",
        boxSizing: "border-box",
        transition: "background 0.2s ease, color 0.2s ease"
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto"
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            marginBottom: "28px",
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
              PayQuick
            </p>

            <h2
              style={{
                margin: 0,
                fontSize: "30px",
                lineHeight: 1.2
              }}
            >
              Dashboard
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <button
              type="button"
              onClick={() =>
                setDarkMode((current) => !current)
              }
              aria-label={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title={
                darkMode
                  ? "Light mode"
                  : "Dark mode"
              }
              style={{
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text,
                borderRadius: "10px",
                padding: "10px 12px",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            {merchant && (
              <button
                type="button"
                onClick={() =>
                  setShowNotifications(
                    (current) => !current
                  )
                }
                aria-label="Notifications"
                title="Notifications"
                style={{
                  position: "relative",
                  border: `1px solid ${theme.border}`,
                  background: theme.card,
                  color: theme.text,
                  borderRadius: "10px",
                  padding: "10px 12px",
                  cursor: "pointer",
                  fontSize: "18px"
                }}
              >
                🔔

                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      minWidth: "19px",
                      height: "19px",
                      borderRadius: "50%",
                      background: theme.danger,
                      color: "#ffffff",
                      fontSize: "10px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                      boxSizing: "border-box"
                    }}
                  >
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </header>

        {!merchant ? (
          <div
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: "16px",
              padding: "32px",
              textAlign: "center"
            }}
          >
            <div
              style={{
                fontSize: "40px",
                marginBottom: "12px"
              }}
            >
              💳
            </div>

            <h3 style={{ margin: "0 0 8px" }}>
              Welcome to PayQuick
            </h3>

            <p
              style={{
                margin: 0,
                color: theme.muted
              }}
            >
              Connect your wallet to access your
              merchant dashboard.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                background:
                  darkMode
                    ? "#172554"
                    : "#eff6ff",
                border: `1px solid ${
                  darkMode
                    ? "#1e40af"
                    : "#bfdbfe"
                }`,
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "20px"
              }}
            >
              <p
                style={{
                  margin: "0 0 6px",
                  color: theme.muted,
                  fontSize: "13px"
                }}
              >
                Connected merchant wallet
              </p>

              <strong
                style={{
                  fontSize: "16px",
                  wordBreak: "break-all"
                }}
              >
                {shortenAddress(
                  merchant.wallet_address
                )}
              </strong>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "16px",
                marginBottom: "24px"
              }}
            >
              <div
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  borderRadius: "16px",
                  padding: "20px"
                }}
              >
                <p
                  style={{
                    margin: "0 0 10px",
                    color: theme.muted,
                    fontSize: "13px"
                  }}
                >
                  Balance
                </p>

                <h3
                  style={{
                    margin: 0,
                    fontSize: "25px"
                  }}
                >
                  USDC
                </h3>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: theme.muted,
                    fontSize: "13px"
                  }}
                >
                  Arc Testnet
                </p>
              </div>

              <div
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  borderRadius: "16px",
                  padding: "20px"
                }}
              >
                <p
                  style={{
                    margin: "0 0 10px",
                    color: theme.muted,
                    fontSize: "13px"
                  }}
                >
                  Payments
                </p>

                <h3
                  style={{
                    margin: 0,
                    fontSize: "25px"
                  }}
                >
                  —
                </h3>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: theme.muted,
                    fontSize: "13px"
                  }}
                >
                  View payment history
                </p>
              </div>

              <div
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  borderRadius: "16px",
                  padding: "20px"
                }}
              >
                <p
                  style={{
                    margin: "0 0 10px",
                    color: theme.muted,
                    fontSize: "13px"
                  }}
                >
                  Notifications
                </p>

                <h3
                  style={{
                    margin: 0,
                    fontSize: "25px"
                  }}
                >
                  {unreadCount}
                </h3>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: theme.muted,
                    fontSize: "13px"
                  }}
                >
                  Unread notifications
                </p>
              </div>
            </div>

            {showNotifications && (
              <div
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  borderRadius: "16px",
                  padding: "20px",
                  marginBottom: "24px"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px"
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0
                      }}
                    >
                      Notifications
                    </h3>

                    <p
                      style={{
                        margin: "4px 0 0",
                        color: theme.muted,
                        fontSize: "13px"
                      }}
                    >
                      Your latest account activity
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadNotifications}
                    disabled={loadingNotifications}
                    style={{
                      border: `1px solid ${theme.border}`,
                      background: theme.cardSecondary,
                      color: theme.text,
                      borderRadius: "8px",
                      padding: "8px 12px",
                      cursor: loadingNotifications
                        ? "default"
                        : "pointer"
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
                      color: theme.danger
                    }}
                  >
                    {notificationError}
                  </p>
                )}

                {!loadingNotifications &&
                  notifications.length === 0 && (
                    <div
                      style={{
                        background:
                          theme.cardSecondary,
                        borderRadius: "10px",
                        padding: "20px",
                        textAlign: "center"
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: theme.muted
                        }}
                      >
                        No notifications yet.
                      </p>
                    </div>
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
                              padding: "16px 0"
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent:
                                  "space-between",
                                gap: "12px",
                                alignItems:
                                  "flex-start"
                              }}
                            >
                              <div>
                                <h4
                                  style={{
                                    margin:
                                      "0 0 6px"
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
                                        theme.muted
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
                                    background:
                                      darkMode
                                        ? "#422006"
                                        : "#fef3c7",
                                    color:
                                      darkMode
                                        ? "#fbbf24"
                                        : "#92400e",
                                    borderRadius:
                                      "999px",
                                    padding:
                                      "4px 8px",
                                    fontSize:
                                      "11px",
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
                                  markAsRead(
                                    notification.id
                                  )
                                }
                                style={{
                                  marginTop:
                                    "10px",
                                  border: "none",
                                  background:
                                    "transparent",
                                  color:
                                    theme.accent,
                                  padding: 0,
                                  cursor:
                                    "pointer",
                                  fontWeight:
                                    "600"
                                }}
                              >
                                Mark as read
                              </button>
                            )}

                            {notification.read_at && (
                              <small
                                style={{
                                  display:
                                    "block",
                                  marginTop:
                                    "8px",
                                  color:
                                    theme.success
                                }}
                              >
                                ✓ Read
                              </small>
                            )}
                          </article>
                        )
                      )}
                    </div>
                  )}
              </div>
