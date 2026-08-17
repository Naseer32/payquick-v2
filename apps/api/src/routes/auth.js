import { Router } from "express";
import { getOrCreateMerchant } from "../services/merchantService.js";
import {
  createChallenge,
  consumeChallenge
} from "../services/authService.js";

const router = Router();

router.get("/status", (_req, res) => {
  res.json({
    authenticated: false
  });
});
router.post("/challenge", (req, res) => {
  try {
    const { walletAddress } = req.body;

    const nonce = createChallenge(walletAddress);

    res.json({
      ok: true,
      walletAddress,
      nonce
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

router.post("/merchant", async (req, res) => {
  try {
    const { walletAddress } = req.body;

    const merchant = await getOrCreateMerchant(walletAddress);

    res.json({
      ok: true,
      merchant
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;
