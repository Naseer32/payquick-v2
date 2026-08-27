Invoices.jsx

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { apiRequest } from "../services/api.js";

export default function Invoices({ merchant }) {
  const loadInvoicesRequestId = useRef(0);

  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USDC");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [copiedInvoiceId, setCopiedInvoiceId] = useState(null);
  const [qrInvoiceId, setQrInvoiceId] = useState(null);

  async function loadInvoices() {
    const requestId = ++loadInvoicesRequestId.current;

    setLoading(true);
    setError("");

    try {
      const result = await apiRequest("/api/invoices");

      if (requestId === loadInvoicesRequestId.current) {
        setInvoices(result.invoices || []);
      }
    } catch (err) {
      if (requestId === loadInvoicesRequestId.current) {
        setError(
          err.message || "Unable to load invoices."
        );
      }
    } finally {
      if (requestId === loadInvoicesRequestId.current) {
        setLoading(false);
      }
    }
  }

  async function loadCustomers() {
    try {
      const result = await apiRequest("/api/customers");
      setCustomers(result.customers || []);
    } catch (err) {
      setError(
        err.message || "Unable to load customers."
      );
    }
  }

  useEffect(() => {
    if (!merchant) {
      setInvoices([]);
      setCustomers([]);
      return;
    }

    loadInvoices();
    loadCustomers();
  }, [merchant]);

  useEffect(() => {
    if (!merchant) return;

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        loadInvoices();
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [merchant]);

  function convertLocalDateTimeToUTC(value) {
    if (!value) {
      return null;
    }

    const localDate = new Date(value);

    if (Number.isNaN(localDate.getTime())) {
      throw new Error("Invalid due date.");
    }

    return localDate.toISOString();
  }

  async function handleCreateInvoice(event) {
    event.preventDefault();

    setCreating(true);
    setError("");

    try {
      const utcDueAt =
        convertLocalDateTimeToUTC(dueAt);

      await apiRequest("/api/invoices", {
        method: "POST",
        body: JSON.stringify({
          customerId: customerId || null,
          invoiceNumber,
          amount,
          currency,
          description,
          dueAt: utcDueAt
        })
      });

      setCustomerId("");
      setInvoiceNumber("");
      setAmount("");
      setDescription("");
      setDueAt("");

      await loadInvoices();
    } catch (err) {
      setError(
        err.message || "Unable to create invoice."
      );
    } finally {
      setCreating(false);
    }
  }

  async function copyCheckoutLink(invoice) {
    const checkoutUrl = getCheckoutUrl(invoice);

    try {
      await navigator.clipboard.writeText(checkoutUrl);

      setCopiedInvoiceId(invoice.id);

      setTimeout(() => {
        setCopiedInvoiceId(null);
      }, 2000);
    } catch (err) {
      setError("Unable to copy checkout link.");
    }
  }

  function getCheckoutUrl(invoice) {
    return (
      `${window.location.origin}/pay/` +
      encodeURIComponent(invoice.checkout_token)
    );
  }

  function formatAmount(amount) {
    return Number(amount || 0).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6
      }
    );
  }

  function formatDate(dateValue) {
    if (!dateValue) return "Not set";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not set";
    }

    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
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
        background: "#ecfdf5",
        color: "#047857"
      };
    }

    if (
      normalized === "pending" ||
      normalized === "processing"
    ) {
      return {
        background: "#fffbeb",
        color: "#b45309"
      };
    }

    if (
      normalized === "expired" ||
      normalized === "failed" ||
      normalized === "cancelled"
    ) {
      return {
        background: "#fef2f2",
        color: "#b91c1c"
      };
    }

    return {
      background: "#eff6ff",
      color: "#1d4ed8"
    };
  }

  const pageStyle = {
    minHeight: "calc(100vh - 72px)",
    padding: "32px 20px 60px",
    boxSizing: "border-box",
    background: "#f8fafc",
    color: "#0f172a"
  };

  const containerStyle = {
    maxWidth: "1120px",
    margin: "0 auto"
  };

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)"
  };

  if (!merchant) {
    return (
      <section style={pageStyle}>
        <div
          style={{
            ...containerStyle,
            maxWidth: "600px",
            paddingTop: "70px"
          }}
        >
          <div
            style={{
              ...cardStyle,
              padding: "50px 30px",
              textAlign: "center"
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 20px",
                borderRadius: "16px",
                background: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: "800"
              }}
            >
              $
            </div>

            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "26px"
              }}
            >
              Invoices
            </h2>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                lineHeight: "1.6"
              }}
            >
              Connect your wallet to create and
              manage payment invoices.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={pageStyle}>
      <div style={containerStyle}>
        {/* PAGE HEADER */}
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
            <p
              style={{
                margin: "0 0 7px",
                color: "#64748b",
                fontSize: "13px",
                fontWeight: "500"
              }}
            >
              Payments
            </p>

            <h1
              style={{
                margin: 0,
                fontSize: "30px",
                lineHeight: "1.2",
                letterSpacing: "-0.7px"
              }}
            >
              Invoices
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: "#64748b",
                fontSize: "14px"
              }}
            >
              Create invoices and share secure
              checkout links with your customers.
            </p>
          </div>

          <div
            style={{
              background: "#eff6ff",
              color: "#1d4ed8",
              borderRadius: "10px",
              padding: "9px 13px",
              fontSize: "12px",
              fontWeight: "600"
            }}
          >
            {invoices.length}{" "}
            {invoices.length === 1
              ? "invoice"
              : "invoices"}
          </div>
        </div>

        {/* CREATE INVOICE */}
        <div
          style={{
            ...cardStyle,
            padding: "24px",
            marginBottom: "30px"
          }}
        >
          <div
            style={{
              marginBottom: "22px"
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "19px"
              }}
            >
              Create Invoice
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#64748b",
                fontSize: "13px"
              }}
            >
              Create a payment request for your
              customer.
            </p>
          </div>

          <form onSubmit={handleCreateInvoice}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "18px"
              }}
            >
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                  fontSize: "13px",
                  fontWeight: "600"
                }}
              >
                Customer

                <select
                  value={customerId}
                  onChange={(event) =>
                    setCustomerId(
                      event.target.value
                    )
                  }
                  style={{
                    height: "44px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "9px",
                    padding: "0 12px",
                    background: "#ffffff",
                    color: "#0f172a",
                    fontSize: "14px",
                    outline: "none"
                  }}
                >
                  <option value="">
                    No customer
                  </option>

                  {customers.map((customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name ||
                        customer.email ||
                        "Unnamed customer"}
                    </option>
                  ))}
                </select>
              </label>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                  fontSize: "13px",
                  fontWeight: "600"
                }}
              >
                Invoice Number

                <input
                  value={invoiceNumber}
                  onChange={(event) =>
                    setInvoiceNumber(
                      event.target.value
                    )
                  }
                  placeholder="INV-0001"
                  required
                  style={{
                    height: "44px",
                    boxSizing: "border-box",
                    border: "1px solid #cbd5e1",
                    borderRadius: "9px",
                    padding: "0 12px",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </label>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                  fontSize: "13px",
                  fontWeight: "600"
                }}
              >
                Amount

                <div
                  style={{
                    display: "flex",
                    border: "1px solid #cbd5e1",
                    borderRadius: "9px",
                    overflow: "hidden",
                    height: "44px"
                  }}
                >
                  <input
                    type="number"
                    min="0"
                    step="0.000001"
                    value={amount}
                    onChange={(event) =>
                      setAmount(
                        event.target.value
                      )
                    }
                    placeholder="10"
                    required
                    style={{
                      minWidth: 0,
                      flex: 1,
                      border: "none",
                      padding: "0 12px",
                      fontSize: "14px",
                      outline: "none"
                    }}
                  />

                  <div
                    style={{
                      width: "72px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f8fafc",
                      borderLeft:
                        "1px solid #e2e8f0",
                      color: "#475569",
                      fontSize: "13px",
                      fontWeight: "700"
                    }}
                  >
                    USDC
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                  fontSize: "13px",
                  fontWeight: "600"
                }}
              >
                Due Date

                <input
                  type="datetime-local"
                  value={dueAt}
                  onChange={(event) =>
                    setDueAt(
                      event.target.value
                    )
                  }
                  style={{
                    height: "44px",
                    boxSizing: "border-box",
                    border: "1px solid #cbd5e1",
                    borderRadius: "9px",
                    padding: "0 12px",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />

                <span
                  style={{
                    color: "#94a3b8",
                    fontSize: "11px",
                    fontWeight: "400"
                  }}
                >
                  Minimum checkout validity is
                  24 hours.
                </span>
              </label>
            </div>

            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "7px",
                marginTop: "18px",
                fontSize: "13px",
                fontWeight: "600"
              }}
            >
              Description

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Payment for services"
                rows={3}
                style={{
                  resize: "vertical",
                  minHeight: "85px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "9px",
                  padding: "12px",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </label>

            {error && (
              <div
                role="alert"
                style={{
                  marginTop: "18px",
                  padding: "11px 13px",
                  borderRadius: "9px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  fontSize: "13px"
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={creating}
              style={{
                marginTop: "20px",
                minHeight: "44px",
                border: "none",
                borderRadius: "9px",
                padding: "0 18px",
                background: creating
                  ? "#93c5fd"
                  : "#2563eb",
                color: "#ffffff",
                cursor: creating
                  ? "not-allowed"
                  : "pointer",
                fontSize: "13px",
                fontWeight: "700"
              }}
            >
              {creating
                ? "Creating Invoice..."
                : "Create Invoice"}
            </button>
          </form>
        </div>

        {/* INVOICE LIST HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            marginBottom: "14px",
            flexWrap: "wrap"
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "19px"
              }}
            >
              Payment Invoices
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#64748b",
                fontSize: "12px"
              }}
            >
              Your latest invoice records
            </p>
          </div>

          <button
            type="button"
            onClick={loadInvoices}
            disabled={loading}
            style={{
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              borderRadius: "9px",
              padding: "9px 13px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontSize: "12px",
              fontWeight: "600"
            }}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div
            style={{
              ...cardStyle,
              padding: "45px 20px",
              textAlign: "center",
              color: "#64748b",
              fontSize: "14px"
            }}
          >
            Loading invoices...
          </div>
        )}

        {/* EMPTY */}
        {!loading && invoices.length === 0 && (
          <div
            style={{
              ...cardStyle,
              padding: "55px 20px",
              textAlign: "center"
            }}
          >
            <div
              style={{
                width: "54px",
                height: "54px",
                margin: "0 auto 16px",
                borderRadius: "14px",
                background: "#f1f5f9",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}
            >
              #
            </div>

            <h3
              style={{
                margin: "0 0 7px",
                fontSize: "17px"
              }}
            >
              No invoices yet
            </h3>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "13px"
              }}
            >
              Create your first invoice above.
            </p>
          </div>
        )}

        {/* INVOICES */}
        {!loading &&
          invoices.length > 0 && (
            <div
              style={{
                display: "grid",
                gap: "16px"
              }}
            >
              {invoices.map((invoice) => {
                const checkoutUrl =
                  getCheckoutUrl(invoice);

                const showQr =
                  qrInvoiceId === invoice.id;

                const statusStyle =
                  getStatusStyle(
                    invoice.status
                  );

                return (
                  <article
                    key={invoice.id}
                    style={{
                      ...cardStyle,
                      overflow: "hidden"
                    }}
                  >
                    {/* INVOICE TOP */}
                    <div
                      style={{
                        padding: "20px",
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "flex-start",
                        gap: "20px",
                        flexWrap: "wrap"
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: "0 0 7px",
                            color: "#94a3b8",
                            fontSize: "11px",
                            fontWeight: "600",
                            textTransform:
                              "uppercase",
                            letterSpacing:
                              "0.5px"
                          }}
                        >
                          Invoice
                        </p>

                        <h3
                          style={{
                            margin: 0,
                            fontSize: "18px",
                            letterSpacing:
                              "-0.2px"
                          }}
                        >
                          {invoice.invoice_number ||
                            invoice.id?.slice(
                              0,
                              8
                            )}
                        </h3>
                      </div>

                      <span
                        style={{
                          ...statusStyle,
                          display:
                            "inline-flex",
                          alignItems:
                            "center",
                          borderRadius:
                            "999px",
                          padding:
                            "6px 10px",
                          fontSize: "11px",
                          fontWeight: "700",
                          textTransform:
                            "capitalize"
                        }}
                      >
                        {invoice.status ||
                          "unknown"}
                      </span>
                    </div>

                    {/* AMOUNT */}
                    <div
                      style={{
                        margin: "0 20px",
                        padding: "18px",
                        borderRadius: "12px",
                        background: "#f8fafc",
                        border:
                          "1px solid #e2e8f0"
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 5px",
                          color: "#64748b",
                          fontSize: "11px",
                          fontWeight: "600",
                          textTransform:
                            "uppercase"
                        }}
                      >
                        Amount Due
                      </p>

                      <strong
                        style={{
                          display: "block",
                          fontSize: "27px",
                          letterSpacing:
                            "-0.6px"
                        }}
                      >
                        {formatAmount(
                          invoice.amount
                        )}{" "}
                        {invoice.currency ||
                          "USDC"}
                      </strong>
                    </div>

                    {/* DETAILS */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(190px, 1fr))",
                        gap: "1px",
                        marginTop: "18px",
                        borderTop:
                          "1px solid #e2e8f0",
                        borderBottom:
                          "1px solid #e2e8f0"
                      }}
                    >
                      <div
                        style={{
                          padding: "16px 20px"
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 6px",
                            color: "#94a3b8",
                            fontSize: "10px",
                            fontWeight: "700",
                            textTransform:
                              "uppercase"
                          }}
                        >
                          Customer
                        </p>

                        <strong
                          style={{
                            display: "block",
                            fontSize: "13px"
                          }}
                        >
                          {invoice.customer_name ||
                            "No customer"}
                        </strong>

                        {invoice.customer_email && (
                          <span
                            style={{
                              display: "block",
                              marginTop: "3px",
                              color: "#64748b",
                              fontSize: "11px"
                            }}
                          >
                            {
                              invoice.customer_email
                            }
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          padding: "16px 20px",
                          borderLeft:
                            "1px solid #e2e8f0"
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 6px",
                            color: "#94a3b8",
                            fontSize: "10px",
                            fontWeight: "700",
                            textTransform:
                              "uppercase"
                          }}
                        >
                          Due Date
                        </p>

                        <strong
                          style={{
                            display: "block",
                            fontSize: "13px"
                          }}
                        >
                          {formatDate(
                            invoice.due_at
                          )}
                        </strong>
                      </div>

                      <div
                        style={{
                          padding: "16px 20px",
                          borderLeft:
                            "1px solid #e2e8f0"
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 6px",
                            color: "#94a3b8",
                            fontSize: "10px",
                            fontWeight: "700",
                            textTransform:
                              "uppercase"
                          }}
                        >
                          Created
                        </p>

                        <strong
                          style={{
                            display: "block",
                            fontSize: "13px"
                          }}
                        >
                          {formatDate(
                            invoice.created_at
                          )}
                        </strong>
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    {invoice.description && (
                      <div
                        style={{
                          padding: "17px 20px 0"
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 5px",
                            color: "#94a3b8",
                            fontSize: "10px",
                            fontWeight: "700",
                            textTransform:
                              "uppercase"
                          }}
                        >
                          Description
                        </p>

                        <p
                          style={{
                            margin: 0,
                            color: "#475569",
                            fontSize: "13px",
                            lineHeight: "1.5"
                          }}
                        >
                          {invoice.description}
                        </p>
                      </div>
                    )}

                    {/* CHECKOUT */}
                    <div
                      style={{
                        margin: "18px 20px 0",
                        padding: "13px",
                        borderRadius: "10px",
                        background: "#f8fafc",
                        border:
                          "1px solid #e2e8f0"
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 7px",
                          color: "#94a3b8",
                          fontSize: "10px",
                          fontWeight: "700",
                          textTransform:
                            "uppercase"
                        }}
                      >
                        Checkout Link
                      </p>

                      <a
                        href={checkoutUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow:
                            "ellipsis",
                          whiteSpace:
                            "nowrap",
                          color: "#2563eb",
                          fontSize: "12px",
                          textDecoration:
                            "none"
                        }}
                      >
                        {checkoutUrl}
                      </a>
                    </div>

                    {/* ACTIONS */}
                    <div
                      style={{
                        padding: "18px 20px 20px",
                        display: "flex",
                        gap: "9px",
                        flexWrap: "wrap"
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          copyCheckoutLink(
                            invoice
                          )
                        }
                        style={{
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#334155",
                          borderRadius: "9px",
                          padding:
                            "9px 13px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}
                      >
                        {copiedInvoiceId ===
                        invoice.id
                          ? "✓ Copied"
                          : "Copy checkout link"}
                      </button>

                      <a
                        href={checkoutUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          borderRadius: "9px",
                          padding:
                            "9px 13px",
                          background: "#2563eb",
                          color: "#ffffff",
                          fontSize: "12px",
                          fontWeight: "600",
                          textDecoration:
                            "none"
                        }}
                      >
                        Open checkout
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          setQrInvoiceId(
                            showQr
                              ? null
                              : invoice.id
                          )
                        }
                        style={{
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#334155",
                          borderRadius: "9px",
                          padding:
                            "9px 13px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}
                      >
                        {showQr
                          ? "Hide QR"
                          : "Show QR"}
                      </button>
                    </div>

                    {/* QR CODE */}
                    {showQr && (
                      <div
                        style={{
                          borderTop:
                            "1px solid #e2e8f0",
                          padding:
                            "24px 20px 28px",
                          textAlign: "center"
                        }}
                      >
                        <p
                          style={{
                            margin:
                              "0 0 15px",
                            fontSize: "14px",
                            fontWeight: "700"
                          }}
                        >
                          Scan to pay
                        </p>

                        <div
                          style={{
                            display:
                              "inline-flex",
                            padding: "14px",
                            background:
                              "#ffffff",
                            border:
                              "1px solid #e2e8f0",
                            borderRadius:
                              "12px"
                          }}
                        >
                          <QRCodeSVG
                            value={
                              checkoutUrl
                            }
                            size={220}
                            level="M"
                          />
                        </div>

                        <p
                          style={{
                            maxWidth:
                              "500px",
                            margin:
                              "14px auto 0",
                            color: "#64748b",
                            fontSize: "11px",
                            lineHeight:
                              "1.5",
                            wordBreak:
                              "break-all"
                          }}
                        >
                          {checkoutUrl}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
      </div>
    </section>
  );
}
