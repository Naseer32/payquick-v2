import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { query } from "../db/database.js";
import {
  createApiKey,
  listApiKeys,
  revokeApiKey
} from "../services/apiKeyService.js";

const router = Router();

async function getMerchantId(walletAddress) {
  const result = await query(
    `
      SELECT id
      FROM merchants
      WHERE wallet_address = $1
      LIMIT 1
    `,
    [walletAddress]
  );

  if (result.rows.length === 0) {
    throw new Error("Merchant not found");
  }

  return result.rows[0].id;
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const merchantId = await getMerchantId(req.auth.walletAddress);
    const keys = await listApiKeys(merchantId);

    res.json({
      ok: true,
      keys
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const merchantId = await getMerchantId(req.auth.walletAddress);
    const { name } = req.body;

    const result = await createApiKey(merchantId, name);

    res.json({
      ok: true,
      key: result
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

router.post("/:id/revoke", requireAuth, async (req, res) => {
  try {
    const merchantId = await getMerchantId(req.auth.walletAddress);

    await revokeApiKey(merchantId, req.params.id);

    res.json({
      ok: true
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;
