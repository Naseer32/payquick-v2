import crypto from "node:crypto";
import { query } from "../db/database.js";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function createSession(walletAddress) {
  if (!walletAddress) {
    throw new Error("Wallet address is required");
  }

  const token = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_MS
  );

  await query(
    `
      INSERT INTO sessions (
        token,
        wallet_address,
        created_at,
        expires_at
      )
      VALUES ($1, $2, NOW(), $3)
    `,
    [
      token,
      walletAddress.toLowerCase(),
      expiresAt
    ]
  );

  return token;
}

export async function getSession(token) {
  if (!token) {
    return null;
  }

  const result = await query(
    `
      SELECT
        token,
        wallet_address,
        created_at,
        expires_at
      FROM sessions
      WHERE token = $1
        AND expires_at > NOW()
      LIMIT 1
    `,
    [token]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const session = result.rows[0];

  return {
    walletAddress: session.wallet_address,
    createdAt: session.created_at,
    expiresAt: session.expires_at
  };
}

export async function destroySession(token) {
  if (!token) {
    return;
  }

  await query(
    `
      DELETE FROM sessions
      WHERE token = $1
    `,
    [token]
  );
}
