import {
  createPrivateKeySync,
  ecdsaSign,
} from "ethereum-cryptography/secp256k1-compat.js";
import { toHex } from "ethereum-cryptography/utils.js";

//generate private key based on wallet address

const mapping = {
  "0x1": toHex(createPrivateKeySync()),
  "0x2": toHex(createPrivateKeySync()),
  "0x3": toHex(createPrivateKeySync()),
};

console.log(mapping);
