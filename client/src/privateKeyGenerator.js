import { createPrivateKeySync } from "ethereum-cryptography/secp256k1-compat.js";
import { toHex } from "ethereum-cryptography/utils.js";

//generate private key based on wallet address

export function createKey(balances) {
  let mapping = {};
  for (const address in balances) {
    mapping[address] = toHex(createPrivateKeySync());
  }
  return mapping;
}
