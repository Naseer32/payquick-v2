import { randomUUID } from "node:crypto";
import { query } from "../db/database.js";

export async function getOrCreateMerchant(walletAddress) {
  if (!walletAddress) {
    throw new Error("Wallet address is required");
  }

  const normalizedAddress = walletAddress.toLowerCase();
  const id = randomUUID();

  const result = await query(
    `
      INSERT INTO merchants (id, wallet_address)
      VALUES ($1, $2)
      ON CONFLICT (wallet_address)
        DO UPDATE SET wallet_address = EXCLUDED.wallet_address
      RETURNING id, wallet_address, display_name, created_at, (xmax = 0) AS inserted
    `,
    [id, normalizedAddress]
  );

  const row = result.rows[0];

  return {
    merchant: {
      id: row.id,
      wallet_address: row.wallet_address,
      display_name: row.display_name,
      created_at: row.created_at
    },
    created: row.inserted
  };
}
