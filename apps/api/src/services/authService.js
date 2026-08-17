import crypto from "node:crypto";

const challenges = new Map();

export function createChallenge(walletAddress) {
  if (!walletAddress) {
    throw new Error("Wallet address is required");
  }

  const nonce = crypto.randomBytes(24).toString("hex");

  challenges.set(walletAddress.toLowerCase(), {
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

  return challenge;
}
