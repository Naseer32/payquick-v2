import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
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

router.post("/challenge", async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const normalizedAddress = walletAddress?.toLowerCase();

    if (!normalizedAddress) {
      return res.status(400).json({
        ok: false,
        error: "Wallet address is required"
      });
    }

    const nonce = createChallenge(normalizedAddress);

    res.json({
      ok: true,
      walletAddress: normalizedAddress,
      nonce
    });
  } catch (error) {
    console.error("PayQuick challenge error:", error);

    res.status(400).json({
      ok: false,
      error:
        error?.message ||
        "Failed to create authentication challenge"
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
    console.error(
      "PayQuick merchant authentication error:",
      error
    );

    res.status(500).json({
      ok: false,
      error:
        error?.message ||
        error?.code ||
        String(error) ||
        "Merchant authentication failed",
      detail: {
        name: error?.name || null,
        code: error?.code || null,
        message: error?.message || null
      }
    });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;
    const normalizedAddress = walletAddress?.toLowerCase();

    if (!normalizedAddress || !signature) {
      return res.status(400).json({
        ok: false,
        error: "Wallet address and signature are required"
      });
    }

    const challenge = consumeChallenge(normalizedAddress);

    if (!challenge) {
      return res.status(400).json({
        ok: false,
        error: "Authentication challenge expired or not found"
      });
    }

    const message =
      `Sign in to PayQuick\n\nNonce: ${challenge.nonce}`;

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

    const sessionToken =
      await createSession(normalizedAddress);

    res.json({
      ok: true,
      authenticated: true,
      walletAddress: normalizedAddress,
      sessionToken
    });
  } catch (error) {
    console.error(
      "PayQuick verification error:",
      error
    );

    res.status(400).json({
      ok: false,
      error:
        error?.message ||
        "Wallet verification failed"
    });
  }
});

export default router;
