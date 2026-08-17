import { verifyMessage } from "ethers";

export function verifyWalletSignature(walletAddress, message, signature) {
  if (!walletAddress || !message || !signature) {
    throw new Error("Wallet address, message, and signature are required");
  }

  const recoveredAddress = verifyMessage(message, signature);

  return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
}
