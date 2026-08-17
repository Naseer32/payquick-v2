import { requireAuth } from "../middleware/authMiddleware.js";
import { Router } from "express";
import { getOrCreateMerchant } from "../services/merchantService.js";
import {
  createChallenge,
  consumeChallenge
} from "../services/authService.js";
import { verifyWalletSignature } from "../services/signatureService.js";
import { createSession } from "../services/sessionService.js";

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

router.post("/merchant", requireAuth, async (req, res) => {
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
router.post("/verify", (req, res) => {
  try {
    const {
      walletAddress,
      signature
    } = req.body;

    const challenge = consumeChallenge(walletAddress);

    const valid = verifyWalletSignature(
      walletAddress,
      challenge.nonce,
      signature
    );

    if (!valid) {
      return res.status(401).json({
        ok: false,
        error: "Invalid wallet signature"
      });
    }

    const sessionToken = createSession(walletAddress);

    res.json({
      ok: true,
      authenticated: true,
      walletAddress,
      sessionToken
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});
export default router;
