import { useState } from "react";
import server from "./server";
import { createKey } from "./privateKeyGenerator.js";
import { ecdsaSign, sign } from "ethereum-cryptography/secp256k1-compat.js";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils.js";
import { sha256 } from "ethereum-cryptography/sha256.js";

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKeys, setPrivateKeys] = useState({});

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    //request the balances from the server and create mapping
    let keys = privateKeys;
    if (Object.keys(keys).length === 0) {
      try {
        const { data: fetchedBalances } = await server.get("/balances");
        keys = createKey(fetchedBalances);
        setPrivateKeys(keys);
        alert(JSON.stringify(keys));
      } catch (ex) {
        alert(ex.response.data.message);
        return;
      }
    }
    //retreive private key from mapping
    const privateKeyHex = keys[address];
    if (!privateKeyHex) {
      alert("Private key not found");
      return;
    }
    const privateKey = Uint8Array.from(Buffer.from(privateKeyHex, "hex"));

    //sign transfer using private key
    const msg = `${address}|${recipient}|${parseInt(sendAmount)}`;
    const messageHash = sha256(utf8ToBytes(msg));
    const signature = ecdsaSign(messageHash, privateKey);

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signature: toHex(signature),
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
