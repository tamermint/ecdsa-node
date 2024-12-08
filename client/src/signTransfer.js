import { ecdsaSign } from "ethereum-cryptography/secp256k1-compat.js";
import { sha256 } from "ethereum-cryptography/sha256.js";

export function signTransaction(message, privatekeyHex) {
  const privateKey = Uint8Array.from(Buffer.from(privatekeyHex, "hex"));
  const messageHash = Uint8Array.from(Buffer.from(sha256(message)), "hex");
  return ecdsaSign(messageHash, privateKey);
}
