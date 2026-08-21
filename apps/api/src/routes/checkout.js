import { Router } from "express";
import { query } from "../db/database.js";

const router = Router();

router.get("/:token", async (req, res) => {
  try {
    const result = await query(
      `
        SELECT
          i.id,
          i.invoice_number,
          i.amount,
          i.currency,
          i.description,
          i.status,
          i.due_at,
          i.paid_at,
          i.created_at,
          m.display_name
        FROM invoices i
        JOIN merchants m
          ON m.id = i.merchant_id
        WHERE i.checkout_token = $1
        LIMIT 1
      `,
      [req.params.token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Checkout not found"
      });
    }

    res.json({
      ok: true,
      checkout: result.rows[0]
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

router.post("/:token/pay", async (req, res) => {
  try {
    const { txHash, payerAddress } = req.body;

    if (!txHash || !payerAddress) {
      return res.status(400).json({
        ok: false,
        error: "txHash and payerAddress are required"
      });
    }

    const invoiceResult = await query(
      `
        SELECT i.id, i.amount, i.currency, i.status, m.wallet_address
        FROM invoices i
        JOIN merchants m ON m.id = i.merchant_id
        WHERE i.checkout_token = $1
        LIMIT 1
      `,
      [req.params.token]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Checkout not found" });
    }

    const invoice = invoiceResult.rows[0];

    if (invoice.status !== "pending") {
      return res.status(409).json({ ok: false, error: "Invoice is not pending" });
    }

    const paymentResult = await query(
      `
        INSERT INTO payments
          (id, invoice_id, tx_hash, payer_address, receiver_address, amount, currency, status)
        VALUES
          (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'pending')
        RETURNING id
      `,
      [
        invoice.id,
        txHash,
        payerAddress,
        invoice.wallet_address,
        invoice.amount,
        invoice.currency
      ]
    );

    await query(
      `
        INSERT INTO payment_events
          (id, payment_id, event_name, tx_hash, payload)
        VALUES
          (gen_random_uuid(), $1, 'submitted', $2, $3)
      `,
      [paymentResult.rows[0].id, txHash, JSON.stringify({ payerAddress })]
    );

    res.json({ ok: true, paymentId: paymentResult.rows[0].id });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

export default router;
