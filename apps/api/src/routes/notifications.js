import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { query } from "../db/database.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await query(
      `
        SELECT
          n.id,
          n.type,
          n.title,
          n.body,
          n.read_at,
          n.created_at
        FROM notifications n
        JOIN merchants m
          ON m.id = n.merchant_id
        WHERE m.wallet_address = $1
        ORDER BY n.created_at DESC
      `,
      [req.auth.walletAddress]
    );

    res.json({
      ok: true,
      notifications: result.rows
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

router.post("/:id/read", requireAuth, async (req, res) => {
  try {
    const result = await query(
      `
        UPDATE notifications n
        SET read_at = NOW()
        FROM merchants m
        WHERE n.id = $1
          AND n.merchant_id = m.id
          AND m.wallet_address = $2
        RETURNING
          n.id,
          n.read_at
      `,
      [req.params.id, req.auth.walletAddress]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Notification not found"
      });
    }

    res.json({
      ok: true,
      notification: result.rows[0]
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;
