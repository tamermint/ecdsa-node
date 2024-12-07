import {
  createPrivateKeySync,
  ecdsaSign,
} from "ethereum-cryptography/secp256k1-compat.js";
import { toHex } from "ethereum-cryptography/utils.js";

const privateKeyArr = createPrivateKeySync();
const privateKey = toHex(privateKeyArr);
console.log(privateKey);
