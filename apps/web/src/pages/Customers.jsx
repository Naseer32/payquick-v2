import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../services/api.js";

export default function Customers({ merchant, darkMode = false }) {
  const loadCustomersRequestId = useRef(0);
  const historyRequestIds = useRef({});

  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [historyByCustomer, setHistoryByCustomer] = useState({});
  const [loadingHistoryId, setLoadingHistoryId] = useState(null);

  async function loadCustomers() {
    const requestId = ++loadCustomersRequestId.current;

    setLoading(true);
    setError("");

    try {
      const result = await apiRequest("/api/customers");

      if (requestId === loadCustomersRequestId.current) {
        setCustomers(result.customers || []);
      }
    } catch (err) {
      if (requestId === loadCustomersRequestId.current) {
        setError(err.message || "Unable to load customers.");
      }
    } finally {
      if (requestId === loadCustomersRequestId.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (!merchant) {
      setCustomers([]);
      setHistoryByCustomer({});
      return;
    }

    loadCustomers();
  }, [merchant]);

  async function handleViewHistory(customerId) {
    const requestId =
      (historyRequestIds.current[customerId] || 0) + 1;

    historyRequestIds.current[customerId] = requestId;

    setLoadingHistoryId(customerId);
    setError("");

    try {
      const result = await apiRequest(
        `/api/customers/${customerId}/payments`
      );

      if (historyRequestIds.current[customerId] === requestId) {
        setHistoryByCustomer((prev) => ({
          ...prev,
          [customerId]: result.history || []
        }));
      }
    } catch (err) {
      if (historyRequestIds.current[customerId] === requestId) {
        setError(
          err.message || "Unable to load customer history."
        );
      }
    } finally {
      if (historyRequestIds.current[customerId] === requestId) {
        setLoadingHistoryId(null);
      }
    }
  }

  async function handleCreateCustomer(event) {
    event.preventDefault();

    setCreating(true);
    setError("");

    try {
      await apiRequest("/api/customers", {
        method: "POST",
        body: JSON.stringify({
          name,
          email
        })
      });

      setName("");
      setEmail("");

      await loadCustomers();
    } catch (err) {
      setError(
        err.message || "Unable to create customer."
      );
    } finally {
      setCreating(false);
    }
  }

  function getInitials(customer) {
    const value =
      customer.name ||
      customer.email ||
      "C";

    const parts = value.trim().split(/\s+/);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return value.slice(0, 2).toUpperCase();
  }

  function formatDate(dateValue) {
    if (!dateValue) return "Unknown";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Unknown";
    }

    return date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function formatAmount(amount) {
    return Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  function getStatusStyle(status) {
    const normalized = String(
      status || ""
    ).toLowerCase();

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
        cardHover: "#f8fafc",
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
          minHeight: "calc(100vh - 120px)",
          padding: "40px 20px",
          color: theme.text
        }}
      >
        <div
          style={{
            maxWidth: "560px",
            margin: "80px auto"
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
                width: "68px",
                height: "68px",
                margin: "0 auto 20px",
                borderRadius: "18px",
                background: theme.primary,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "27px",
                fontWeight: "800"
              }}
            >
              C
            </div>

            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "27px"
              }}
            >
              Customers
            </h2>

            <p
              style={{
                margin: 0,
                color: theme.muted,
                fontSize: "14px",
                lineHeight: "1.6"
              }}
            >
              Connect your wallet to manage your
              customers and view their payment history.
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
        padding: "30px 20px 50px",
        color: theme.text,
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
            marginBottom: "26px",
            flexWrap: "wrap"
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 6px",
                color: theme.muted,
                fontSize: "13px",
                fontWeight: "500"
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
              Customers
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: theme.muted,
                fontSize: "14px"
              }}
            >
              Manage customers and view their payment history.
            </p>
          </div>

          <button
            type="button"
            onClick={loadCustomers}
            disabled={loading}
            style={{
              border: `1px solid ${theme.border}`,
              background: theme.card,
              color: theme.text,
              borderRadius: "10px",
              padding: "10px 14px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: "600"
            }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* ADD CUSTOMER */}
        <div
          style={{
            ...cardStyle,
            padding: "22px",
            marginBottom: "24px"
          }}
        >
          <div style={{ marginBottom: "18px" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "18px"
              }}
            >
              Add Customer
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: theme.muted,
                fontSize: "12px"
              }}
            >
              Create a customer record for your invoices.
            </p>
          </div>

          <form onSubmit={handleCreateCustomer}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
                alignItems: "end"
              }}
            >
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                  color: theme.muted,
                  fontSize: "12px",
                  fontWeight: "600"
                }}
              >
                Name

                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Customer name"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: `1px solid ${theme.border}`,
                    background: theme.background,
                    color: theme.text,
                    borderRadius: "10px",
                    padding: "11px 12px",
                    outline: "none",
                    fontSize: "14px"
                  }}
                />
              </label>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                  color: theme.muted,
                  fontSize: "12px",
                  fontWeight: "600"
                }}
              >
                Email

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="customer@example.com"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: `1px solid ${theme.border}`,
                    background: theme.background,
                    color: theme.text,
                    borderRadius: "10px",
                    padding: "11px 12px",
                    outline: "none",
                    fontSize: "14px"
                  }}
                />
              </label>

              <button
                type="submit"
                disabled={creating}
                style={{
                  border: "none",
                  background: theme.primary,
                  color: "#ffffff",
                  borderRadius: "10px",
                  padding: "12px 18px",
                  cursor: creating
                    ? "not-allowed"
                    : "pointer",
                  fontSize: "13px",
                  fontWeight: "700",
                  minHeight: "42px"
                }}
              >
                {creating ? "Adding..." : "Add Customer"}
              </button>
            </div>
          </form>
        </div>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            style={{
              ...cardStyle,
              padding: "14px 16px",
              marginBottom: "20px",
              borderColor: theme.red,
              background: theme.redSoft
            }}
          >
            <span
              style={{
                color: theme.red,
                fontSize: "13px"
              }}
            >
              {error}
            </span>
          </div>
        )}

        {/* CUSTOMER LIST */}
        <div
          style={{
            ...cardStyle,
            overflow: "hidden"
          }}
        >
          <div
            style={{
              padding: "20px",
              borderBottom: `1px solid ${theme.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px"
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px"
                }}
              >
                Customer List
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: theme.muted,
                  fontSize: "12px"
                }}
              >
                {customers.length}{" "}
                {customers.length === 1
                  ? "customer"
                  : "customers"}
              </p>
            </div>
          </div>

          {loading ? (
            <div
              style={{
                padding: "45px 20px",
                textAlign: "center",
                color: theme.muted,
                fontSize: "14px"
              }}
            >
              Loading customers...
            </div>
          ) : customers.length === 0 ? (
            <div
              style={{
                padding: "50px 20px",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  margin: "0 auto 15px",
                  borderRadius: "14px",
                  background: theme.primarySoft,
                  color: theme.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  fontWeight: "700"
                }}
              >
                C
              </div>

              <strong
                style={{
                  display: "block",
                  fontSize: "15px",
                  marginBottom: "6px"
                }}
              >
                No customers yet
              </strong>

              <span
                style={{
                  color: theme.muted,
                  fontSize: "13px"
                }}
              >
                Add your first customer above.
              </span>
            </div>
          ) : (
            <div>
              {customers.map((customer) => {
                const history =
                  historyByCustomer[customer.id];

                const historyOpen =
                  history !== undefined;

                const isLoadingHistory =
                  loadingHistoryId === customer.id;

                return (
                  <article
                    key={customer.id}
                    style={{
                      padding: "19px 20px",
                      borderBottom: `1px solid ${theme.border}`
                    }}
                  >
                    {/* CUSTOMER ROW */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "18px",
                        flexWrap: "wrap"
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "13px",
                          minWidth: 0
                        }}
                      >
                        <div
                          style={{
                            width: "42px",
                            height: "42px",
                            flexShrink: 0,
                            borderRadius: "12px",
                            background: theme.primarySoft,
                            color: theme.primary,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                            fontWeight: "800"
                          }}
                        >
                          {getInitials(customer)}
                        </div>

                        <div
                          style={{
                            minWidth: 0
                          }}
                        >
                          <strong
                            style={{
                              display: "block",
                              fontSize: "14px",
                              marginBottom: "4px"
                            }}
                          >
                            {customer.name ||
                              "Unnamed customer"}
                          </strong>

                          <span
                            style={{
                              color: theme.muted,
                              fontSize: "12px",
                              wordBreak: "break-word"
                            }}
                          >
                            {customer.email ||
                              "No email address"}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px"
                        }}
                      >
                        <span
                          style={{
                            color: theme.muted,
                            fontSize: "11px"
                          }}
                        >
                          Added{" "}
                          {formatDate(
                            customer.created_at
                          )}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleViewHistory(
                              customer.id
                            )
                          }
                          disabled={isLoadingHistory}
                          style={{
                            border: `1px solid ${theme.border}`,
                            background: historyOpen
                              ? theme.primarySoft
                              : theme.card,
                            color: historyOpen
                              ? theme.primary
                              : theme.text,
                            borderRadius: "9px",
                            padding: "8px 12px",
                            cursor: isLoadingHistory
                              ? "not-allowed"
                              : "pointer",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}
                        >
                          {isLoadingHistory
                            ? "Loading..."
                            : historyOpen
                            ? "Refresh History"
                            : "View History"}
                        </button>
                      </div>
                    </div>

                    {/* PAYMENT HISTORY */}
                    {historyOpen && (
                      <div
                        style={{
                          marginTop: "18px",
                          marginLeft: "55px",
                          border: `1px solid ${theme.border}`,
                          borderRadius: "12px",
                          overflow: "hidden"
                        }}
                      >
                        <div
                          style={{
                            padding: "13px 15px",
                            background: theme.background,
                            borderBottom: `1px solid ${theme.border}`,
                            fontSize: "12px",
                            fontWeight: "700"
                          }}
                        >
                          Payment History
                        </div>

                        {history.length === 0 ? (
                          <div
                            style={{
                              padding: "20px 15px",
                              color: theme.muted,
                              fontSize: "12px"
                            }}
                          >
                            No invoices for this customer yet.
                          </div>
                        ) : (
                          <div>
                            {history.map((item) => {
                              const invoiceStatus =
                                getStatusStyle(
                                  item.invoice_status
                                );

                              return (
                                <div
                                  key={item.invoice_id}
                                  style={{
                                    padding: "15px",
                                    borderBottom: `1px solid ${theme.border}`,
                                    display: "flex",
                                    justifyContent:
                                      "space-between",
                                    alignItems: "center",
                                    gap: "15px",
                                    flexWrap: "wrap"
                                  }}
                                >
                                  <div>
                                    <strong
                                      style={{
                                        display: "block",
                                        fontSize: "13px",
                                        marginBottom: "5px"
                                      }}
                                    >
                                      {item.invoice_number}
                                    </strong>

                                    <span
                                      style={{
                                        color: theme.muted,
                                        fontSize: "11px"
                                      }}
                                    >
                                      {formatAmount(
                                        item.amount
                                      )}{" "}
                                      {item.currency ||
                                        "USDC"}
                                    </span>
                                  </div>

                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      flexWrap: "wrap"
                                    }}
                                  >
                                    <span
                                      style={{
                                        ...invoiceStatus,
                                        borderRadius:
                                          "999px",
                                        padding:
                                          "5px 9px",
                                        fontSize: "10px",
                                        fontWeight: "700",
                                        textTransform:
                                          "capitalize"
                                      }}
                                    >
                                      Invoice:{" "}
                                      {item.invoice_status ||
                                        "unknown"}
                                    </span>

                                    {item.payment_status && (
                                      <span
                                        style={{
                                          ...getStatusStyle(
                                            item.payment_status
                                          ),
                                          borderRadius:
                                            "999px",
                                          padding:
                                            "5px 9px",
                                          fontSize:
                                            "10px",
                                          fontWeight:
                                            "700",
                                          textTransform:
                                            "capitalize"
                                        }}
                                      >
                                        Payment:{" "}
                                        {
                                          item.payment_status
                                        }
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
