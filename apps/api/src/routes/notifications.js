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

export default router;
