import { randomUUID } from "node:crypto";
import { query } from "../db/database.js";

export async function getOrCreateMerchant(walletAddress) {
  if (!walletAddress) {
    throw new Error("Wallet address is required");
  }

  const normalizedAddress = walletAddress.toLowerCase();

  const existing = await query(
    `
      SELECT id, wallet_address, display_name, created_at
      FROM merchants
      WHERE wallet_address = $1
      LIMIT 1
    `,
    [normalizedAddress]
  );

  if (existing.rows.length > 0) {
    return {
      merchant: existing.rows[0],
      created: false
    };
  }

  const id = randomUUID();

  const created = await query(
    `
      INSERT INTO merchants (
        id,
        wallet_address
      )
      VALUES ($1, $2)
      RETURNING id, wallet_address, display_name, created_at
    `,
    [id, normalizedAddress]
  );

  return {
    merchant: created.rows[0],
    created: true
  };
}
