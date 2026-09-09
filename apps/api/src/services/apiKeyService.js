import crypto from "node:crypto";
import { query } from "../db/database.js";

function hashKey(rawKey) {
  return crypto
    .createHash("sha256")
    .update(rawKey)
    .digest("hex");
}

export async function createApiKey(merchantId, name) {
  if (!merchantId) {
    throw new Error("Merchant ID is required.");
  }

  const rawKey = "pq_" + crypto.randomBytes(24).toString("hex");
  const keyHash = hashKey(rawKey);
  const keyPrefix = rawKey.slice(0, 10);

  const id = crypto.randomUUID();

  await query(
    `
      INSERT INTO api_keys (
        id,
        merchant_id,
        key_hash,
        key_prefix,
        name,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
    `,
    [id, merchantId, keyHash, keyPrefix, name || null]
  );

  return {
    id,
    rawKey,
    keyPrefix
  };
}

export async function listApiKeys(merchantId) {
  const result = await query(
    `
      SELECT id, key_prefix, name, created_at, revoked_at
      FROM api_keys
      WHERE merchant_id = $1
      ORDER BY created_at DESC
    `,
    [merchantId]
  );

  return result.rows;
}

export async function revokeApiKey(merchantId, keyId) {
  await query(
    `
      UPDATE api_keys
      SET revoked_at = NOW()
      WHERE id = $1 AND merchant_id = $2 AND revoked_at IS NULL
    `,
    [keyId, merchantId]
  );
}

export async function validateApiKey(rawKey) {
  if (!rawKey || !rawKey.startsWith("pq_")) {
    return null;
  }

  const keyHash = hashKey(rawKey);

  const result = await query(
    `
      SELECT api_keys.merchant_id, merchants.wallet_address
      FROM api_keys
      JOIN merchants ON merchants.id = api_keys.merchant_id
      WHERE api_keys.key_hash = $1 AND api_keys.revoked_at IS NULL
      LIMIT 1
    `,
    [keyHash]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return {
    merchantId: result.rows[0].merchant_id,
    walletAddress: result.rows[0].wallet_address
  };
}
