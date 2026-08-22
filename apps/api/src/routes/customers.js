import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { createCustomer } from "../services/customerService.js";
import { query } from "../db/database.js";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, email } = req.body;

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

    const customer = await createCustomer({
      merchantId: merchantResult.rows[0].id,
      name,
      email
    });

    res.status(201).json({
      ok: true,
      customer
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
        SELECT
          c.id,
          c.name,
          c.email,
          c.created_at
        FROM customers c
        JOIN merchants m
          ON m.id = c.merchant_id
        WHERE m.wallet_address = $1
        ORDER BY c.created_at DESC
      `,
      [req.auth.walletAddress]
    );

    res.json({
      ok: true,
      customers: result.rows
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

router.get("/:id/payments", requireAuth, async (req, res) => {
  try {
    const result = await query(
      `
        SELECT
          i.id AS invoice_id,
          i.invoice_number,
          i.amount,
          i.currency,
          i.status AS invoice_status,
          i.created_at AS invoice_created_at,
          p.id AS payment_id,
          p.tx_hash,
          p.status AS payment_status,
          p.confirmed_at
        FROM invoices i
        JOIN merchants m
          ON m.id = i.merchant_id
        LEFT JOIN payments p
          ON p.invoice_id = i.id
        WHERE m.wallet_address = $1
          AND i.customer_id = $2
        ORDER BY i.created_at DESC
      `,
      [req.auth.walletAddress, req.params.id]
    );

    res.json({
      ok: true,
      history: result.rows
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;
