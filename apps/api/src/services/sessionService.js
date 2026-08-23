import crypto from "node:crypto";

const SESSION_TTL_MS = 60 * 60 * 1000;

const sessions = new Map();

export function createSession(walletAddress) {
  if (!walletAddress) {
    throw new Error(
      "Wallet address is required"
    );
  }

  const token =
    crypto.randomBytes(32).toString("hex");

  sessions.set(token, {
    walletAddress:
      walletAddress.toLowerCase(),

    createdAt: Date.now()
  });

  return token;
}

export function getSession(token) {
  if (!token) {
    return null;
  }

  const session =
    sessions.get(token);

  if (!session) {
    return null;
  }

  const expired =
    Date.now() - session.createdAt >
    SESSION_TTL_MS;

  if (expired) {
    sessions.delete(token);
    return null;
  }

  return session;
}

export function destroySession(token) {
  if (token) {
    sessions.delete(token);
  }
}
