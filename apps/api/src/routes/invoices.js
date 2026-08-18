import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { createInvoice } from "../services/invoiceService.js";
import { query } from "../db/database.js";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const {
  customerId,
  invoiceNumber,
  amount,
  currency,
  description,
  dueAt
} = req.body;

    const merchantResult = await query(
      `
        SELECT id
        FROM merchants
        WHERE wallet_address = $1
        LIMIT 1
      `,
      [req.auth.walletAddress]
    );

    if (merchantResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Merchant not found"
      });
    }

    const invoice = await createInvoice({
  merchantId: merchantResult.rows[0].id,
  customerId,
  invoiceNumber,
  amount,
  currency,
  description,
  dueAt
});

    res.status(201).json({
      ok: true,
      invoice
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await query(
      `
        const result = await query(
  `
    SELECT
      i.id,
      i.invoice_number,
      i.amount,
      i.currency,
      i.description,
      i.status,
      i.checkout_token,
      i.due_at,
      i.paid_at,
      i.created_at,
      c.id AS customer_id,
      c.name AS customer_name,
      c.email AS customer_email
    FROM invoices i
    JOIN merchants m
      ON m.id = i.merchant_id
    LEFT JOIN customers c
      ON c.id = i.customer_id
    WHERE m.wallet_address = $1
    ORDER BY i.created_at DESC
  `,
  [req.auth.walletAddress]
);
      [req.auth.walletAddress]
    );

    res.json({
      ok: true,
      invoices: result.rows
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});
router.get("/:id", requireAuth, async (req, res) => {
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
          i.checkout_token,
          i.due_at,
          i.paid_at,
          i.created_at
        FROM invoices i
        JOIN merchants m
          ON m.id = i.merchant_id
        WHERE i.id = $1
          AND m.wallet_address = $2
        LIMIT 1
      `,
      [req.params.id, req.auth.walletAddress]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Invoice not found"
      });
    }

    res.json({
      ok: true,
      invoice: result.rows[0]
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;
