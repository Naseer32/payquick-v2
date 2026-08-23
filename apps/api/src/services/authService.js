import crypto from "node:crypto";
import { query } from "../db/database.js";

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

export async function createChallenge(walletAddress) {
  if (!walletAddress) {
    throw new Error("Wallet address is required");
  }

  const key = walletAddress.toLowerCase();

  const nonce = crypto.randomBytes(24).toString("hex");

  await query(
    `
      INSERT INTO auth_challenges (
        wallet_address,
        nonce,
        created_at
      )
      VALUES ($1, $2, NOW())
      ON CONFLICT (wallet_address)
      DO UPDATE SET
        nonce = EXCLUDED.nonce,
        created_at = NOW()
    `,
    [key, nonce]
  );

  return nonce;
}

export async function consumeChallenge(walletAddress) {
  const key = walletAddress?.toLowerCase();

  if (!key) {
    throw new Error("Wallet address is required");
  }

  const result = await query(
    `
      SELECT
        wallet_address,
        nonce,
        created_at
      FROM auth_challenges
      WHERE wallet_address = $1
      LIMIT 1
    `,
    [key]
  );

  if (result.rows.length === 0) {
    throw new Error("Authentication challenge not found");
  }

  const challenge = result.rows[0];

  await query(
    `
      DELETE FROM auth_challenges
      WHERE wallet_address = $1
    `,
    [key]
  );

  const createdAt = new Date(
    challenge.created_at
  ).getTime();

  if (
    Date.now() - createdAt >
    CHALLENGE_TTL_MS
  ) {
    throw new Error(
      "Authentication challenge expired"
    );
  }

  return {
    nonce: challenge.nonce,
    createdAt
  };
}
