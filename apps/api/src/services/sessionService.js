import crypto from "node:crypto";

const sessions = new Map();

export function createSession(walletAddress) {
  if (!walletAddress) {
    throw new Error("Wallet address is required");
  }

  const token = crypto.randomBytes(32).toString("hex");

  sessions.set(token, {
    walletAddress: walletAddress.toLowerCase(),
    createdAt: Date.now()
  });

  return token;
}

export function getSession(token) {
  if (!token) {
    return null;
  }

  return sessions.get(token) || null;
}

export function destroySession(token) {
  if (token) {
    sessions.delete(token);
  }
}
