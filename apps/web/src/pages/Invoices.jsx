import { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";

export default function Invoices({ merchant }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!merchant) {
      setInvoices([]);
      return;
    }

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

    loadInvoices();
  }, [merchant]);

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

      {loading && <p>Loading invoices...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && invoices.length === 0 && (
        <p>No invoices yet.</p>
      )}

      {!loading && !error && invoices.length > 0 && (
        <div>
          {invoices.map((invoice) => (
            <article key={invoice.id}>
              <h3>{invoice.invoice_number}</h3>

              <p>
                {invoice.amount} {invoice.currency}
              </p>

              <p>Status: {invoice.status}</p>

              {invoice.description && (
                <p>{invoice.description}</p>
              )}

              <p>
                Checkout:
                {" "}
                /pay/{invoice.checkout_token}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
