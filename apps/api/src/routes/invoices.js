import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { createInvoice } from "../services/invoiceService.js";
import { query } from "../db/database.js";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const {
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

export default router;
