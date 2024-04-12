const bsv = require('@bsv/sdk');
const kms = require('./KMS')
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
require('dotenv').config();

const docClient = new DynamoDBClient({ 
    region: process.env.AWS_REGION_B,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_B,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_B,
    },
});

async function main() {
    const privateKey = bsv.PrivKey.fromRandom();
    const publicKey = bsv.PubKey.fromPrivKey(privateKey);
    const privateKeyWIF = privateKey.toWif();
    const address = bsv.Address.fromPubKey(publicKey, 'livenet'); // Cambia a 'testnet' si es necesario

    console.log('Clave privada (WIF):', privateKeyWIF);
    console.log('Dirección BSV P2PKH:', address.toString());

    try {
        const encryptedPrivateKey = await kms.encrypt(Buffer.from(privateKeyWIF));

        const params = {
            TableName: "WalletSencilla",
            Item: {
                WalletSencillaCripto: "1",
                ID: "1", 
                add: address.toString(),
                privateKeyEncrypted: encryptedPrivateKey,
                pubKey:  publicKey.toBuffer().toString('base64'),
            },
        };

        await docClient.send(new PutCommand(params));
        console.log("Item insertado con éxito en DynamoDB");
    } catch (error) {
        console.error("Error en la operación:", error);
    }
}

main();