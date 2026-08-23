import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../services/api.js";

export default function Payments({ merchant }) {
  const loadPaymentsRequestId = useRef(0);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function shortenAddress(address) {
    if (!address) return "Unknown";

    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  }

  function shortenTxHash(txHash) {
    if (!txHash) return "Unknown";

    return `${txHash.slice(0, 8)}...${txHash.slice(-6)}`;
  }

  async function loadPayments() {
    const requestId = ++loadPaymentsRequestId.current;

    setLoading(true);
    setError("");

    try {
      const result = await apiRequest("/api/payments");

      if (requestId === loadPaymentsRequestId.current) {
        setPayments(result.payments || []);
      }
    } catch (err) {
      if (requestId === loadPaymentsRequestId.current) {
        setError(err.message || "Unable to load payments.");
      }
    } finally {
      if (requestId === loadPaymentsRequestId.current) {
        setLoading(false);
      }
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
        <button
          type="button"
          onClick={loadPayments}
          disabled={loading}
        >
          Refresh
        </button>
      </h2>

      {error && <p role="alert">{error}</p>}

      {loading && <p>Loading payments...</p>}

      {!loading && payments.length === 0 && (
        <p>No payments yet.</p>
      )}

      {!loading && payments.length > 0 && (
        <div>
          {payments.map((payment) => (
            <article key={payment.id}>
              <h4>{payment.invoice_number}</h4>

              <p>
                {Number(payment.amount)} {payment.currency}
              </p>

              <p>Status: {payment.status}</p>

              {payment.customer_name ? (
                <div>
                  <p>
                    Customer: {payment.customer_name}
                  </p>

                  {payment.customer_email && (
                    <p>
                      Email: {payment.customer_email}
                    </p>
                  )}
                </div>
              ) : (
                <p>Customer: None</p>
              )}

              <p>
                From: {shortenAddress(payment.payer_address)}
              </p>

              <p>
                To: {shortenAddress(payment.receiver_address)}
              </p>

              <p>
                Tx:{" "}
                <a
                  href={`https://testnet.arcscan.app/tx/${payment.tx_hash}`}
                  target="_blank"
                  rel="noreferrer"
                  title={payment.tx_hash}
                >
                  {shortenTxHash(payment.tx_hash)}
                </a>
              </p>

              {payment.block_number !== null &&
                payment.block_number !== undefined && (
                  <p>
                    Block: {payment.block_number}
                  </p>
                )}

              {payment.confirmed_at && (
                <p>
                  Confirmed:{" "}
                  {new Date(
                    payment.confirmed_at
                  ).toLocaleString()}
                </p>
              )}

              <p>
                Created:{" "}
                {new Date(
                  payment.created_at
                ).toLocaleString()}
              </p>

              {payment.description && (
                <p>{payment.description}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
