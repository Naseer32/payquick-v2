import { randomUUID } from "node:crypto";
import { query } from "../db/database.js";

export async function createCustomer({
  merchantId,
  name,
  email
}) {
  if (!merchantId) {
    throw new Error("Merchant ID is required");
  }

  if (!name && !email) {
    throw new Error("Customer name or email is required");
  }

  const id = randomUUID();

  const result = await query(
    `
      INSERT INTO customers (
        id,
        merchant_id,
        name,
        email
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        merchant_id,
        name,
        email,
        created_at
    `,
    [
      id,
      merchantId,
      name || null,
      email || null
    ]
  );

  return result.rows[0];
}
