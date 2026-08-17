import { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";

export default function Checkout({ checkoutToken }) {
  const [checkout, setCheckout] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!checkoutToken) {
      setError("Invalid checkout link.");
      setLoading(false);
      return;
    }

    async function loadCheckout() {
      try {
        const result = await apiRequest(
          `/api/checkout/${encodeURIComponent(checkoutToken)}`
        );

        setCheckout(result.checkout);
      } catch (err) {
        setError(err.message || "Unable to load checkout.");
      } finally {
        setLoading(false);
      }
    }

    loadCheckout();
  }, [checkoutToken]);

  if (loading) {
    return (
      <section>
        <h2>Checkout</h2>
        <p>Loading invoice...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2>Checkout</h2>
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Pay Invoice</h2>

      {checkout.display_name && (
        <p>Merchant: {checkout.display_name}</p>
      )}

      <p>Invoice: {checkout.invoice_number}</p>
      <p>
        Amount: {checkout.amount} {checkout.currency}
      </p>

      {checkout.description && (
        <p>{checkout.description}</p>
      )}

      <p>Status: {checkout.status}</p>

      {checkout.status === "pending" && (
        <button type="button">
          Pay Invoice
        </button>
      )}
    </section>
  );
      }
