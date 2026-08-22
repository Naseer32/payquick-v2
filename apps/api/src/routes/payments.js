import { Router } from "express";
import { query } from "../db/database.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await query(
      `
        SELECT
          p.id,
          p.invoice_id,
          p.tx_hash,
          p.payer_address,
          p.receiver_address,
          p.amount,
          p.currency,
          p.status,
          p.block_number,
          p.confirmed_at,
          p.created_at,
          i.invoice_number,
          i.description
        FROM payments p
        JOIN invoices i
          ON i.id = p.invoice_id
        JOIN merchants m
          ON m.id = i.merchant_id
        WHERE m.wallet_address = $1
        ORDER BY p.created_at DESC
      `,
      [req.auth.walletAddress]
    );

    res.json({
      ok: true,
      payments: result.rows
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;
