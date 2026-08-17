import { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";

export default function Invoices({ merchant }) {
  const [invoices, setInvoices] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USDC");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function loadInvoices() {
    setLoading(true);
    setError("");

    try {
      const result = await apiRequest("/api/invoices");
      setInvoices(result.invoices || []);
    } catch (err) {
      setError(err.message || "Unable to load invoices.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!merchant) {
      setInvoices([]);
      return;
    }

    loadInvoices();
  }, [merchant]);

  async function handleCreateInvoice(event) {
    event.preventDefault();

    setCreating(true);
    setError("");

    try {
      await apiRequest("/api/invoices", {
        method: "POST",
        body: JSON.stringify({
          invoiceNumber,
          amount,
          currency,
          description
        })
      });

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
              <option value="EURC">EURC</option>
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

      <h3>Payment Invoices</h3>

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
