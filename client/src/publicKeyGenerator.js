import { hexToBytes } from "ethereum-cryptography/utils";
import { publicKeyCreate } from "ethereum-cryptography/secp256k1-compat.js";
import { toHex } from "ethereum-cryptography/utils.js";

export function generatePublicKey(privateKeyMapping) {
  let pubKeyMapping = {};
  for (const address in privateKeyMapping) {
    const privateKeyHex = privateKeyMapping[address];
    const privateKeyBytes = hexToBytes(privateKeyHex);
    pubKeyMapping[address] = toHex(publicKeyCreate(privateKeyBytes, false));
  }
  return pubKeyMapping;
}
