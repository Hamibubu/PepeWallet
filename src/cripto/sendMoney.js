const bsv = require('@bsv/sdk');
const kms = require('./KMS');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const axios = require('axios')
require('dotenv').config();


const docClient = new DynamoDBClient({ 
    region: process.env.AWS_REGION_B,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_B,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_B,
    },
});

async function main() {
    info = await getWallerPkey("1");
    plain = await kms.decrypt(Buffer.from(info[0].privateKeyEncrypted, 'base64'));
    add = info[0].add;
    console.log(info)
    const privkey = String.fromCharCode(...plain);
    const privKey = bsv.PrivateKey.fromWif(privkey)
    let data4utxo = await consult(add);
    const txHex = await fetchTransaction(data4utxo.tx_hash);
    const sourceTransaction = bsv.Transaction.fromHex(txHex)
    const version = 1;
    const input = {
        sourceTransaction,
        sourceOutputIndex: data4utxo.tx_pos,
        unlockingScriptTemplate: new bsv.P2PKH().unlock(privKey)
    };
    const totalOutputSatoshis = data4utxo.value - 1000; 
    const output = {
        lockingScript: multi,
        satoshis: totalOutputSatoshis
    };
    const tx = new bsv.Transaction(version, [input], [output])
    await tx.fee()
    await tx.sign()
    const apiKey = process.env.TAAL;
    await tx.broadcast(new bsv.ARC('https://api.taal.com/arc', apiKey)).then(response => {
        console.log('Broadcast exitoso:', response);
      })
      .catch(error => {
        console.error('Error durante el broadcast:', error);
      });
}

async function getWallerPkey(id) {
    try {
        const command = new ScanCommand({
            TableName: "WalletSencilla",
            FilterExpression: "#ID = :ID",
            ExpressionAttributeNames: {
                "#ID": "ID"
            },
            ExpressionAttributeValues: {
                ":ID": id
            }
        });
        const { Items } = await docClient.send(command);
        return Items;
    } catch (error) {
        console.error('Error al buscar usuario por correo electrónico:', error);
        return null;
    }
}

async function consult(add) {
    const url = `https://api.whatsonchain.com/v1/bsv/main/address/${add}/unspent`;
    const response = await axios.get(url);
    return response.data[0];
}

async function fetchTransaction(txHash) {
    const url = `https://api.whatsonchain.com/v1/bsv/main/tx/${txHash}/hex`;
    try {
      const response = await axios.get(url);
      return response.data;  // Devuelve el hex de la transacción
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

main();