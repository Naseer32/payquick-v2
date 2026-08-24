import { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";

export default function Dashboard({ merchant, darkMode }) {
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

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
    if (!merchant) {
      setNotifications([]);
      setShowNotifications(false);
      return;
    }

    loadNotifications();
  }, [merchant]);

  const theme = darkMode
    ? {
        background: "#0f172a",
        card: "#111827",
        text: "#f8fafc",
        muted: "#94a3b8",
        border: "#334155",
        button: "#1e293b"
      }
    : {
        background: "#f8fafc",
        card: "#ffffff",
        text: "#0f172a",
        muted: "#64748b",
        border: "#e2e8f0",
        button: "#ffffff"
      };

  const unreadCount = notifications.filter(
    (notification) => !notification.read_at
  ).length;

  function shortenAddress(address) {
    if (!address) return "";

    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return (
    <section
      style={{
        minHeight: "calc(100vh - 120px)",
        background: theme.background,
        color: theme.text,
        padding: "24px",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px"
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 5px",
                color: theme.muted,
                fontSize: "14px"
              }}
            >
              PayQuick
            </p>

            <h2
              style={{
                margin: 0,
                fontSize: "30px"
              }}
            >
              Dashboard
            </h2>
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
              background: theme.button,
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
                  background: "#ef4444",
                  color: "#ffffff",
                  fontSize: "10px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </button>
        </div>

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
            <h3>Welcome to PayQuick</h3>

            <p
              style={{
                color: theme.muted
              }}
            >
              Connect your wallet to access your merchant
              dashboard.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: "16px",
                padding: "20px",
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
                Merchant wallet
              </p>

              <strong>
                {shortenAddress(
                  merchant.wallet_address
                )}
              </strong>
            </div>

            {showNotifications && (
              <div
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  borderRadius: "16px",
                  padding: "20px"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px"
                  }}
                >
                  <h3 style={{ margin: 0 }}>
                    Notifications
                  </h3>

                  <button
                    type="button"
                    onClick={loadNotifications}
                    disabled={loadingNotifications}
                    style={{
                      border: `1px solid ${theme.border}`,
                      background: theme.button,
                      color: theme.text,
                      borderRadius: "8px",
                      padding: "8px 12px",
                      cursor: "pointer"
                    }}
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
                        color: theme.muted
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
                              padding: "16px 0"
                            }}
                          >
                            <h4
                              style={{
                                margin:
                                  "0 0 8px"
                              }}
                            >
                              {
                                notification.title
                              }
                            </h4>

                            {notification.body && (
                              <p
                                style={{
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

                            {notification.read_at ? (
                              <p
                                style={{
                                  color:
                                    "#10b981"
                                }}
                              >
                                ✓ Read
                              </p>
                            ) : (
                              <div>
                                <strong>
                                  Unread
                                </strong>

                                <br />

                                <button
                                  type="button"
                                  onClick={() =>
                                    markAsRead(
                                      notification.id
                                    )
                                  }
                                  style={{
                                    marginTop:
                                      "8px",
                                    border:
                                      "none",
                                    background:
                                      "transparent",
                                    color:
                                      "#3b82f6",
                                    padding: 0,
                                    cursor:
                                      "pointer",
                                    fontWeight:
                                      "600"
                                  }}
                                >
                                  Mark as read
                                </button>
                              </div>
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
