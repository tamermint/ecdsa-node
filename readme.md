## ECDSA Node

This project is an example of using a client and server to facilitate transfers between different addresses. Since there is just a single server on the back-end handling transfers, this is clearly very centralized. We won't worry about distributed consensus for this project.

However, something that we would like to incoporate is Public Key Cryptography. By using Elliptic Curve Digital Signatures we can make it so the server only allows transfers that have been signed for by the person who owns the associated address.

### Video instructions

For an overview of this project as well as getting started instructions, check out the following video:

https://www.loom.com/share/0d3c74890b8e44a5918c4cacb3f646c4

### Client

The client folder contains a [react app](https://reactjs.org/) using [vite](https://vitejs.dev/). To get started, follow these steps:

1. Open up a terminal in the `/client` folder
2. Run `npm install` to install all the depedencies
3. Run `npm run dev` to start the application
4. Now you should be able to visit the app at http://127.0.0.1:5173/

### Server

The server folder contains a node.js server using [express](https://expressjs.com/). To run the server, follow these steps:

1. Open a terminal within the `/server` folder
2. Run `npm install` to install all the depedencies
3. Run `node index` to start the server

The application should connect to the default server port (3042) automatically!

_Hint_ - Use [nodemon](https://www.npmjs.com/package/nodemon) instead of `node` to automatically restart the server on any changes.

### Changes made

#### On the client side :

- `privateKeyGenerator.js`: module which generates private key
- `publicKeyGenerator.js`: module which generates public key from the private key
- `signTransfer()` : takes message and a hex of private key to generate signature using `ecdsaSign` from the @paulmillr's ethereum-cryptography js library
- We are using React's useEffect hooks to retain the private keys, public keys and Signature:

```js
const [privateKeys, setPrivateKeys] = useState({});
const [publicKeys, setPublicKeys] = useState({});
const [signature, setSignature] = useState(null);
```

- The `sign()` function, signs the message using public - private keypair :

```js
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
```

- The `handleSignClick()` is used for handling the `sign` button click event

- Added a sign button using existing `scss` to the `Transfer` form :

```jsx
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
```

- And finally, passing signature and public key in the `POST` message :

  ```js
  const {
    data: { balance },
  } = await server.post(`send`, {
    sender: address,
    amount: parseInt(sendAmount),
    recipient,
    signature: toHex(signature),
    pubkey: pubKeyHex,
  });
  ```

#### On the server side :

- Modified the request body to accomodate the signature and the public key

  ```js
  const { sender, recipient, amount, signature, pubkey } = req.body;
  ```

- Added logic to reconstruct client message hash:

  ```js
  const message =
    JSON.stringify(sender) + JSON.stringify(recipient) + JSON.stringify(amount);
  const messageHash = sha256(utf8ToBytes(message));
  ```

- Added logic to deconstruct the signature to recover the public key:

  ```js
  const recoveredPubKey = ecdsaRecover(
    Buffer.concat([r, s]),
    v,
    messageHash,
    false
  );
  const recoveredPubKeyHex = toHex(recoveredPubKey);
  ```

- Added logic to verify the public key sent vs the public key recovered :

  ```js
  if (recoveredPubKeyHex !== pubkey) {
    return res
      .status(400)
      .send({ error: "Public key doesn't match signature" });
  }
  ```

### Closing thoughts

- This is not exactly a secure design as we are generating key pairs and sending to server. A good design would be to derive the public key from the signature and compare.

- One modification that can be done is utilizing a "from" field and passing in the public key of the sender. This way, the server can verify the signature without the client having to generate key pairs.
