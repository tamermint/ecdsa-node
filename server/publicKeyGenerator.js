const { publicKeyCreate } = require("ethereum-cryptography/secp256k1-compat");
const { toHex } = require("ethereum-cryptography/utils.js");

export function generatePublicKey(privateKey) {
  return toHex(publicKeyCreate(privateKey, false));
}
