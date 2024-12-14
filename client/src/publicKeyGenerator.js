import { hexToBytes } from "ethereum-cryptography/utils";

const { publicKeyCreate } = require("ethereum-cryptography/secp256k1-compat");
const { toHex } = require("ethereum-cryptography/utils.js");

export function generatePublicKey(privateKeyMapping) {
  let pubKeyMapping = {};
  for (const address in privateKeyMapping) {
    const privateKeyHex = privateKeyMapping[address];
    const privateKeyBytes = hexToBytes(privateKeyHex);
    pubKeyMapping[address] = toHex(publicKeyCreate(privateKeyBytes, false));
  }
  return pubKeyMapping;
}
