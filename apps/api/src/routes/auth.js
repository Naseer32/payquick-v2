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
    const normalizedAddress = walletAddress?.toLowerCase();

    const nonce = createChallenge(normalizedAddress);

    res.json({
      ok: true,
      walletAddress: normalizedAddress,
      nonce
    });
    } catch (error) {
    console.error("PayQuick merchant authentication error:", error);

    res.status(500).json({
      ok: false,
      error: error.message || "Merchant authentication failed"
    });
  }
});

router.post("/merchant", requireAuth, async (req, res) => {
  try {
    const walletAddress = req.auth.walletAddress;

    const result = await getOrCreateMerchant(walletAddress);

    res.json({
      ok: true,
      merchant: result.merchant,
      created: result.created
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
    const { walletAddress, signature } = req.body;
    const normalizedAddress = walletAddress?.toLowerCase();

    const challenge = consumeChallenge(normalizedAddress);

    const message = `Sign in to PayQuick\n\nNonce: ${challenge.nonce}`;

    const valid = verifyWalletSignature(
      normalizedAddress,
      message,
      signature
    );

    if (!valid) {
      return res.status(401).json({
        ok: false,
        error: "Invalid wallet signature"
      });
    }

    const sessionToken = createSession(normalizedAddress);

    res.json({
      ok: true,
      authenticated: true,
      walletAddress: normalizedAddress,
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
