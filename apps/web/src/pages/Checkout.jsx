import { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";

const ARC_TESTNET_CHAIN_ID = "0x4cef52"; // 5042002
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const USDC_DECIMALS = 6;

// Minimal ERC-20 transfer function selector + ABI encoding, no ethers.js needed
function encodeTransfer(toAddress, amount) {
  const methodId = "a9059cbb"; // transfer(address,uint256)
  const cleanTo = toAddress.replace("0x", "").toLowerCase().padStart(64, "0");
  const amountHex = BigInt(amount).toString(16).padStart(64, "0");
  return "0x" + methodId + cleanTo + amountHex;
}

export default function Checkout({ checkoutToken }) {
  const [checkout, setCheckout] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState(false);

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

  async function handlePay() {
    setPayError("");
    setPaying(true);

    try {
      if (!window.ethereum) {
        throw new Error("No wallet found. Please open this page in Rabby or another Web3 browser.");
      }

      // 1. Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      const payerAddress = accounts[0];

      // 2. Confirm/switch to Arc Testnet
      const currentChainId = await window.ethereum.request({
        method: "eth_chainId"
      });

      if (currentChainId.toLowerCase() !== ARC_TESTNET_CHAIN_ID.toLowerCase()) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ARC_TESTNET_CHAIN_ID }]
        });
      }

      // 3. Build USDC transfer
      const merchantAddress = checkout.wallet_address || checkout.merchant_wallet_address;
      if (!merchantAddress) {
        throw new Error("Merchant wallet address missing from checkout data.");
      }

      const amountInBaseUnits = BigInt(
        Math.round(Number(checkout.amount) * 10 ** USDC_DECIMALS)
      );
      const data = encodeTransfer(merchantAddress, amountInBaseUnits);

      // 4. Send transaction
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

      // 5. Notify backend
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

      {paySuccess && <p>Payment submitted! It will confirm shortly.</p>}
      {payError && <p style={{ color: "red" }}>{payError}</p>}
    </section>
  );
}
