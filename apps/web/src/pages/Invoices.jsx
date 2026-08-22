import { useEffect, useRef, useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

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
        setError(err.message || "Unable to load invoices.");
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
      setError(err.message || "Unable to load customers.");
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
  

  async function handleCreateInvoice(event) {
    event.preventDefault();

    setCreating(true);
    setError("");

    try {
      await apiRequest("/api/invoices", {
        method: "POST",
        body: JSON.stringify({
          customerId: customerId || null,
          invoiceNumber,
          amount,
          currency,
          description
        })
      });

      setCustomerId("");
      setInvoiceNumber("");
      setAmount("");
      setDescription("");

      await loadInvoices();
    } catch (err) {
      setError(err.message || "Unable to create invoice.");
    } finally {
      setCreating(false);
    }
  }

  if (!merchant) {
    return (
      <section>
        <h2>Invoices</h2>
        <p>Connect your wallet to manage invoices.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Invoices</h2>

      <form onSubmit={handleCreateInvoice}>
        <h3>Create Invoice</h3>

        <div>
          <label>
            Customer
            <select
              value={customerId}
              onChange={(event) =>
                setCustomerId(event.target.value)
              }
            >
              <option value="">No customer</option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.name || customer.email || "Unnamed customer"}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label>
            Invoice Number
            <input
              value={invoiceNumber}
              onChange={(event) =>
                setInvoiceNumber(event.target.value)
              }
              placeholder="INV-0001"
              required
            />
          </label>
        </div>

        <div>
          <label>
            Amount
            <input
              type="number"
              min="0"
              step="0.000001"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              placeholder="10"
              required
            />
          </label>
        </div>

        <div>
          <label>
            Currency
            <select
              value={currency}
              onChange={(event) =>
                setCurrency(event.target.value)
              }
            >
              <option value="USDC">USDC</option>
            </select>
          </label>
        </div>

        <div>
          <label>
            Description
            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Payment for services"
            />
          </label>
        </div>

        <button type="submit" disabled={creating}>
          {creating ? "Creating..." : "Create Invoice"}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      <h3>
        Payment Invoices{" "}
        <button type="button" onClick={loadInvoices} disabled={loading}>
          Refresh
        </button>
      </h3>

      {loading && <p>Loading invoices...</p>}

      {!loading && invoices.length === 0 && (
        <p>No invoices yet.</p>
      )}

      {!loading && invoices.length > 0 && (
        <div>
          {invoices.map((invoice) => (
            <article key={invoice.id}>
              <h4>{invoice.invoice_number}</h4>

              <p>
                {invoice.amount} {invoice.currency}
              </p>

              <p>Status: {invoice.status}</p>

              {invoice.customer_id ? (
                <div>
                  <p>
                    Customer:{" "}
                    {invoice.customer_name || "Unnamed customer"}
                  </p>

                  {invoice.customer_email && (
                    <p>Email: {invoice.customer_email}</p>
                  )}
                </div>
              ) : (
                <p>Customer: None</p>
              )}

              {invoice.description && (
                <p>{invoice.description}</p>
              )}

              <p>
                Checkout:{" "}
                <a
                  href={`/pay/${encodeURIComponent(invoice.checkout_token)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open checkout
                </a>
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
