import { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";

export default function Dashboard({ merchant }) {
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");

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
      await apiRequest(`/api/notifications/${notificationId}/read`, {
        method: "POST"
      });

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
      return;
    }

    loadNotifications();
  }, [merchant]);

  return (
    <section>
      <h2>Dashboard</h2>

      {merchant ? (
        <>
          <p>
            Merchant wallet: {merchant.wallet_address}
          </p>

          <h3>
  Notifications (
  {notifications.filter((notification) => !notification.read_at).length}
  )
</h3>

          <button
            type="button"
            onClick={loadNotifications}
            disabled={loadingNotifications}
          >
            {loadingNotifications ? "Loading..." : "Refresh"}
          </button>

          {notificationError && (
            <p role="alert">{notificationError}</p>
          )}

          {!loadingNotifications &&
            notifications.length === 0 && (
              <p>No notifications yet.</p>
            )}

          {!loadingNotifications &&
            notifications.length > 0 && (
              <div>
                {notifications.map((notification) => (
                  <article key={notification.id}>
                    <h4>{notification.title}</h4>

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
                            markAsRead(notification.id)
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
        </>
      ) : (
        <p>
          Connect your wallet to access your merchant dashboard.
        </p>
      )}
    </section>
  );
}
