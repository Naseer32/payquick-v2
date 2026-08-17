export async function getOrCreateMerchant(walletAddress) {
  if (!walletAddress) {
    throw new Error("Wallet address is required");
  }

  // Database-backed merchant creation will be implemented next.
  return {
    walletAddress,
    created: false
  };
}
