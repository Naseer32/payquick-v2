import { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";

const ARC_TESTNET_CHAIN_ID = "0x4cef52";

const PAYMENT_TRACKER_ADDRESS =
  "0xd0c5f3e9570CcA0E9913522905b164304A692166";

const PAYMENT_TRACKER_ABI = [
  "function sendPayment(address to, string memo) external payable"
];

export default function Checkout({ checkoutToken }) {
  const [checkout, setCheckout] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState(false);
  const [checking, setChecking] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState("");

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
  
  useEffect(() => {
    if (!paySuccess) return;
    if (checkout?.status === "paid") return;

    const interval = setInterval(() => {
      handleVerify();
    }, 5000);

    return () => clearInterval(interval);
  }, [paySuccess, checkout?.status]);

  async function handlePay() {
    setPayError("");
    setPaying(true);

    try {
      if (!window.ethereum) {
        throw new Error("No wallet found. Please open this page in Rabby or another Web3 browser.");
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      const payerAddress = accounts[0];

      const currentChainId = await window.ethereum.request({
        method: "eth_chainId"
      });

      if (currentChainId.toLowerCase() !== ARC_TESTNET_CHAIN_ID.toLowerCase()) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ARC_TESTNET_CHAIN_ID }]
        });
      }

      const merchantAddress = checkout.wallet_address;
      if (!merchantAddress) {
        throw new Error("Merchant wallet address missing from checkout data.");
      }

      const amountInBaseUnits = BigInt(
        Math.round(Number(checkout.amount) * 10 ** USDC_DECIMALS)
      );
      const data = encodeTransfer(merchantAddress, amountInBaseUnits);

      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: payerAddress,
            to: USDC_ADDRESS,
            data
          }
        ]
      });

      await apiRequest(`/api/checkout/${encodeURIComponent(checkoutToken)}/pay`, {
        method: "POST",
        body: JSON.stringify({ txHash, payerAddress })
      });

      setPaySuccess(true);
    } catch (err) {
      setPayError(err.message || "Payment failed.");
    } finally {
      setPaying(false);
    }
  }

  async function handleVerify() {
    setChecking(true);
    setVerifyStatus("");
    try {
      const result = await apiRequest(`/api/checkout/${encodeURIComponent(checkoutToken)}/verify`, {
        method: "POST"
      });
      setVerifyStatus(result.status);
      if (result.status === "confirmed" || result.status === "paid") {
        setCheckout((prev) => ({ ...prev, status: "paid" }));
      }
    } catch (err) {
      setVerifyStatus("error: " + (err.message || "unknown"));
    } finally {
      setChecking(false);
    }
  }

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

      {checkout.display_name && <p>Merchant: {checkout.display_name}</p>}

      <p>Invoice: {checkout.invoice_number}</p>
      <p>
        Amount: {checkout.amount} {checkout.currency}
      </p>

      {checkout.description && <p>{checkout.description}</p>}

      <p>Status: {checkout.status}</p>

      {checkout.status === "pending" && !paySuccess && (
        <button type="button" onClick={handlePay} disabled={paying}>
          {paying ? "Processing..." : "Pay Invoice"}
        </button>
      )}

      {paySuccess && (
        <>
          <p>Payment submitted! It will confirm shortly.</p>
          <button type="button" onClick={handleVerify} disabled={checking}>
            {checking ? "Checking..." : "Check Payment Status"}
          </button>
          {verifyStatus && <p>Status: {verifyStatus}</p>}
        </>
      )}

      {payError && <p style={{ color: "red" }}>{payError}</p>}
    </section>
  );
        }
