import { useState } from "react";
import server from "./server";
import { createKey } from "./privateKeyGenerator.js";
import { signTransaction } from "./signTransfer.js";
import { toHex } from "ethereum-cryptography/utils.js";

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

    //alert user to sign transaction
    //ask for a message, then ask for the wallet id i.e. 0x1, 0x2 etc
    //retreive the private key
    //sign the message

    //sign transfer using private key
    const msg = `${address}|${recipient}|${parseInt(sendAmount)}`;
    const signature = signTransaction(msg, privateKeyHex);

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
  /** Need to replace the transfer from functionality
   * this is taking time as I was thinking to launch a prompt i.e.a modal onCLick of transfer
   * but it is not conducive to proper code design
   */

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
