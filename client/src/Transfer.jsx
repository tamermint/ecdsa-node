import { useState } from "react";
import server from "./server";
import { createKey } from "./privateKeyGenerator.js";
import { generatePublicKey } from "./publicKeyGenerator.js";
import { signTransaction } from "./signTransfer.js";
import { toHex } from "ethereum-cryptography/utils.js";

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKeys, setPrivateKeys] = useState({});
  const [publicKeys, setPublicKeys] = useState({});
  const [signature, setSignature] = useState(null);

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function sign() {
    //request the balances from the server and create mapping
    let keys = privateKeys;
    let pubKeys = publicKeys;
    if (Object.keys(keys).length === 0) {
      try {
        const { data: fetchedBalances } = await server.get("/balances");
        console.log(JSON.stringify(fetchedBalances));
        keys = createKey(fetchedBalances);
        setPrivateKeys(keys);
        pubKeys = generatePublicKey(keys);
        setPublicKeys(pubKeys);
      } catch (ex) {
        console.error("Error during transfer:", ex);
        alert(ex.response?.data?.message || ex.message || "An error occurred");
        return;
      }
    }
    //retreive private key from mapping
    const privateKeyHex = keys[address];

    if (!privateKeyHex) {
      alert("Private key not found");
      return null;
    }

    //retreive the public key from the mapping
    const pubKeyHex = pubKeys[address];
    if (!pubKeyHex) {
      alert("Public key not found");
      return null;
    }

    //build the message
    //sign the message
    const amountNumber = parseInt(sendAmount);

    //sign transfer using private key
    const msg =
      JSON.stringify(address) +
      JSON.stringify(recipient) +
      JSON.stringify(amountNumber);
    const { signature: sigBytes, recid } = signTransaction(msg, privateKeyHex);
    const fullSignature = new Uint8Array(sigBytes.length + 1);
    fullSignature.set(sigBytes);
    fullSignature.set([recid], sigBytes.length);
    return fullSignature;
  }

  async function handleSignClick() {
    const sig = await sign();
    if (sig) {
      setSignature(sig);
      alert("Transaction signed!");
    } else {
      alert("Unable to sign transaction");
    }
  }

  async function transfer(evt) {
    evt.preventDefault();

    try {
      if (!signature) {
        alert("Please sign the transaction first!");
      }
      const pubKeyHex = publicKeys[address];
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signature: toHex(signature),
        pubkey: pubKeyHex,
      });
      setBalance(balance);
    } catch (ex) {
      console.error("Error during transfer:", ex);
      alert(
        ex.response?.data?.message ||
          ex.response?.data?.error ||
          ex.message ||
          "An error occurred"
      );
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
      <button
        type="button"
        className="button"
        id="sign-button"
        onClick={handleSignClick}
      >
        Sign
      </button>
      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
