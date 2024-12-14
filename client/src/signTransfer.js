import { ecdsaSign } from "ethereum-cryptography/secp256k1-compat.js";
import { sha256 } from "ethereum-cryptography/sha256.js";
import { hexToBytes, utf8ToBytes } from "ethereum-cryptography/utils";

export function signTransaction(message, privatekeyHex) {
  const privateKey = hexToBytes(privatekeyHex);
  // Convert message to bytes and then hash it
  const messageBytes = utf8ToBytes(message);
  const messageHash = sha256(messageBytes);
  return ecdsaSign(messageHash, privateKey);
}
