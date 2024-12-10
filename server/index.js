const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { sha256 } = require("ethereum-cryptography/sha256");
const { utf8ToBytes, hexToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { ecdsaRecover } = require("ethereum-cryptography/secp256k1-compat");

//Receive Sign
//Recover public key
//verify the signature came from this private key
//if yes, let the transfer go through, otherwise revert

app.use(cors());
app.use(express.json());

const balances = {
  "0x1": 100,
  "0x2": 50,
  "0x3": 75,
};

app.get("/balances", (req, res) => {
  res.json(balances);
});

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature } = req.body;

  //reconstruct message hash as we cannot trust the sender
  const message =
    JSON.stringify(sender) + JSON.stringify(recipient) + JSON.stringify(amount);
  const messageHash = sha256(utf8ToBytes(message));

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
