import { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";

export default function Customers({ merchant }) {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [historyByCustomer, setHistoryByCustomer] = useState({});
  const [loadingHistoryId, setLoadingHistoryId] = useState(null);

  async function loadCustomers() {
    setLoading(true);
    setError("");

    try {
      const result = await apiRequest("/api/customers");
      setCustomers(result.customers || []);
    } catch (err) {
      setError(err.message || "Unable to load customers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!merchant) {
      setCustomers([]);
      return;
    }

    loadCustomers();
  }, [merchant]);

  async function handleViewHistory(customerId) {
    setLoadingHistoryId(customerId);

    try {
      const result = await apiRequest(`/api/customers/${customerId}/payments`);
      setHistoryByCustomer((prev) => ({
        ...prev,
        [customerId]: result.history || []
      }));
    } catch (err) {
      setError(err.message || "Unable to load customer history.");
    } finally {
      setLoadingHistoryId(null);
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
      setError(err.message || "Unable to create customer.");
    } finally {
      setCreating(false);
    }
  }

  if (!merchant) {
    return (
      <section>
        <h2>Customers</h2>
        <p>Connect your wallet to manage customers.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Customers</h2>

      <form onSubmit={handleCreateCustomer}>
        <h3>Add Customer</h3>

        <div>
          <label>
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Customer name"
            />
          </label>
        </div>

        <div>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="customer@example.com"
            />
          </label>
        </div>

        <button type="submit" disabled={creating}>
          {creating ? "Adding..." : "Add Customer"}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      <h3>Customer List</h3>

      {loading && <p>Loading customers...</p>}

      {!loading && customers.length === 0 && (
        <p>No customers yet.</p>
      )}

      {!loading && customers.length > 0 && (
        <div>
          {customers.map((customer) => (
            <article key={customer.id}>
              <h4>{customer.name || "Unnamed customer"}</h4>

              {customer.email && (
                <p>{customer.email}</p>
              )}

              <button
                type="button"
                onClick={() => handleViewHistory(customer.id)}
                disabled={loadingHistoryId === customer.id}
              >
                {loadingHistoryId === customer.id
                  ? "Loading..."
                  : "View History"}
              </button>

              {historyByCustomer[customer.id] && (
                <div>
                  {historyByCustomer[customer.id].length === 0 && (
                    <p>No invoices for this customer yet.</p>
                  )}

                  {historyByCustomer[customer.id].map((item) => (
                    <div key={item.invoice_id}>
                      <p>
                        {item.invoice_number}: {item.amount} {item.currency}
                      </p>
                      <p>Invoice status: {item.invoice_status}</p>
                      {item.payment_status && (
                        <p>Payment status: {item.payment_status}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
      }
