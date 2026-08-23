import { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";

export default function Dashboard({ merchant }) {
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

  const unreadCount = notifications.filter(
    (notification) => !notification.read_at
  ).length;

  return (
    <section>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h2>Dashboard</h2>

        {merchant && (
          <button
            type="button"
            onClick={() =>
              setShowNotifications((current) => !current)
            }
            aria-label="Notifications"
            title="Notifications"
            style={{
              position: "relative",
              fontSize: "24px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: "8px"
            }}
          >
            🔔

            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  minWidth: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "red",
                  color: "white",
                  fontSize: "11px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                  boxSizing: "border-box"
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        )}
      </div>

      {merchant ? (
        <>
          <p>
            Merchant wallet: {merchant.wallet_address}
          </p>

          {showNotifications && (
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "12px",
                marginTop: "16px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <h3 style={{ margin: 0 }}>
                  Notifications
                </h3>

                <button
                  type="button"
                  onClick={loadNotifications}
                  disabled={loadingNotifications}
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
                  <p>No notifications yet.</p>
                )}

              {!loadingNotifications &&
                notifications.length > 0 && (
                  <div>
                    {notifications.map((notification) => (
                      <article
                        key={notification.id}
                        style={{
                          borderBottom: "1px solid #eee",
                          padding: "12px 0"
                        }}
                      >
                        <h4>
                          {notification.title}
                        </h4>

                        {notification.body && (
                          <p>{notification.body}</p>
                        )}

                        <p>
                          {new Date(
                            notification.created_at
                          ).toLocaleString()}
                        </p>

                        {notification.read_at ? (
                          <p>Read</p>
                        ) : (
                          <>
                            <strong>Unread</strong>

                            <br />

                            <button
                              type="button"
                              onClick={() =>
                                markAsRead(
                                  notification.id
                                )
                              }
                            >
                              Mark as read
                            </button>
                          </>
                        )}
                      </article>
                    ))}
                  </div>
                )}
            </div>
          )}
        </>
      ) : (
        <p>
          Connect your wallet to access your merchant dashboard.
        </p>
      )}
    </section>
  );
}
