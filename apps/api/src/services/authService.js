import crypto from "node:crypto";

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

const challenges = new Map();

export function createChallenge(walletAddress) {
  if (!walletAddress) {
    throw new Error("Wallet address is required");
  }

  const key = walletAddress.toLowerCase();
  const nonce = crypto.randomBytes(24).toString("hex");

  challenges.set(key, {
    nonce,
    createdAt: Date.now()
  });

  return nonce;
}

export function consumeChallenge(walletAddress) {
  const key = walletAddress?.toLowerCase();

  if (!key) {
    throw new Error("Wallet address is required");
  }

  const challenge = challenges.get(key);

  if (!challenge) {
    throw new Error("Authentication challenge not found");
  }

  challenges.delete(key);

  if (Date.now() - challenge.createdAt > CHALLENGE_TTL_MS) {
    throw new Error("Authentication challenge expired");
  }

  return challenge;
}
