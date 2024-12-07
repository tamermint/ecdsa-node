import {
  createPrivateKeySync,
  ecdsaSign,
} from "ethereum-cryptography/secp256k1-compat.js";
import { toHex } from "ethereum-cryptography/utils.js";

//generate private key based on wallet address

let mapping = {};

function createKey(balances) {
  for (const address in balances) {
    mapping[address] = toHex(createPrivateKeySync());
  }
  return mapping;
}

module.exports = createKey;
