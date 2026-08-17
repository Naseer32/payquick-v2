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

export default router;
