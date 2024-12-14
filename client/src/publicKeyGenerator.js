const { publicKeyCreate } = require("ethereum-cryptography/secp256k1-compat");
const { toHex } = require("ethereum-cryptography/utils.js");

export function generatePublicKey(privateKeyMapping) {
  let pubKeyMapping = {};
  for (const address in privateKeyMapping) {
    pubKeyMapping[address] = toHex(publicKeyCreate(privateKey, false));
  }
  return pubKeyMapping;
}
