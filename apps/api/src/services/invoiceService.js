import { randomUUID } from "node:crypto";
import { query } from "../db/database.js";

export async function createInvoice({
  merchantId,
  invoiceNumber,
  amount,
  currency,
  description,
  dueAt
}) {
  if (!merchantId) {
    throw new Error("Merchant ID is required");
  }

  if (!invoiceNumber) {
    throw new Error("Invoice number is required");
  }

  if (!amount) {
    throw new Error("Invoice amount is required");
  }

  if (!currency) {
    throw new Error("Invoice currency is required");
  }

  const id = randomUUID();
  const checkoutToken = randomUUID();

  const result = await query(
    `
      INSERT INTO invoices (
        id,
        merchant_id,
        invoice_number,
        amount,
        currency,
        description,
        checkout_token,
        due_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        merchant_id,
        invoice_number,
        amount,
        currency,
        description,
        status,
        checkout_token,
        due_at,
        paid_at,
        created_at
    `,
    [
      id,
      merchantId,
      invoiceNumber,
      amount,
      currency,
      description || null,
      checkoutToken,
      dueAt || null
    ]
  );

  return result.rows[0];
}
