import { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";

export default function Payments({ merchant }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadPayments() {
    setLoading(true);
    setError("");

    try {
      const result = await apiRequest("/api/payments");
      setPayments(result.payments || []);
    } catch (err) {
      setError(err.message || "Unable to load payments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!merchant) {
      setPayments([]);
      return;
    }

    loadPayments();
  }, [merchant]);

  if (!merchant) {
    return (
      <section>
        <h2>Payments</h2>
        <p>Connect your wallet to view payment history.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>
        Payments{" "}
        <button type="button" onClick={loadPayments} disabled={loading}>
          Refresh
        </button>
      </h2>

      {error && <p role="alert">{error}</p>}

      {loading && <p>Loading payments...</p>}

      {!loading && payments.length === 0 && <p>No payments yet.</p>}

      {!loading && payments.length > 0 && (
        <div>
          {payments.map((payment) => (
            <article key={payment.id}>
              <h4>{payment.invoice_number}</h4>

              <p>
                {payment.amount} {payment.currency}
              </p>

              <p>Status: {payment.status}</p>

              <p>From: {payment.payer_address}</p>

              <p>Tx: {payment.tx_hash}</p>

              {payment.confirmed_at && (
                <p>Confirmed: {new Date(payment.confirmed_at).toLocaleString()}</p>
              )}

              {payment.description && <p>{payment.description}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
                }
