const { response } = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const kms = require('./KMS');
const bsv = require('@bsv/sdk');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, DeleteCommand,  UpdateCommand } = require("@aws-sdk/lib-dynamodb");
require('dotenv').config();

const docClient = new DynamoDBClient({ 
    region: process.env.AWS_REGION_B,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_B,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_B,
    },
});

class TransactionController {
    async getTransaction(req, res) {
        try{
            let data = await fetchAllData("To_buy")
            const DLLS = await getPrice();
            const formattedTransactions = data.filter(transaction => transaction.IsConfirmed === 'No').map(transaction => ({
                img: `/uploads/${transaction.Img}`,
                item: transaction.Item,
                id: transaction.ID,
                description: `Descripción >> ${transaction.Descripcion} cuesta ${transaction.Precio}$ (DLLS) en BSV ${transaction.Precio/DLLS}`
            }));
            res.send(formattedTransactions);
        }catch (err){
            console.error('Login error: ', err);
            res.sendStatus(500).send("Error interno"); 
        }
    }

    async getCurrentMoney(req, res) {
        try {
            let add = process.env.Address;
            const currentBSV = await getBsvAddressBalance(add);
            let current = currentBSV.confirmed / 1e8;
            let btcPriceInUSD = await getPrice();
            const dollars = btcPriceInUSD * current;
            res.send({ dollars, current }); 
        } catch (err) {
            console.error('Login error: ', err);
            res.status(500).send("Error interno");
        }
    }

    async acceptTransaction(req, res) {
        try {
            if (req.user.userType == 'Signer') {
                let transactionId = req.params.tid;
                const DLLS = await getPrice();
                let item = await getWallerPkey(Number(transactionId),"To_buy");
                const satoshis = (item.Items[0].Precio/DLLS) * 100000000;
                console.log(satoshis)
                let r= await sendMoney(item.Items[0].AddressPay, satoshis);
                if(r==0) {
                    res.status(400).send("No se pudo completar la transacción...")
                }
                await updateConfirmById("To_buy",Number(transactionId),"Yes");
                res.send(r)
            } else {
                res.status(401).send("Unauthorized");
            }
        } catch (err) {
            console.error('Login error: ', err);
            res.status(500).send("Error interno");
        }
    }

    async declineTransaction(req, res) {
        try {
            if (req.user.userType == 'Signer') {
                let transactionId = req.params.tid;
                await deleteById("To_buy", Number(transactionId))
                res.send("Transacción declinada")
            } else {
                res.status(401).send("Unauthorized");
            }
        } catch (err) {
            console.error('Login error: ', err);
            res.status(500).send("Error interno");
        }
    }

    async getHistory(req, res) {
        try {
            let data = await fetchAllData("To_buy")
            const formattedTransactions = data.filter(transaction => transaction.IsConfirmed === 'Yes').map(transaction => ({
                img: `/uploads/${transaction.Img}`,
                item: transaction.Item,
                id: transaction.ID,
                description: `Descripción >> ${transaction.Descripcion} cuesta ${transaction.Precio}$ (DLLS)`
            }));
            res.send(formattedTransactions);
        } catch (err) {
            console.error('Login error: ', err);
            res.status(500).send("Error interno");
        }
    }

    async createNewTransaction(req, res) {
        let current = await countItems("To_buy");
        const params = {
            TableName: "To_buy",
            Item: {
                BuyCripto: String(current+1),
                ID: current+1, 
                IsConfirmed: "No",
                AddressPay: req.body.Address,
                Item: req.body.Item,
                Descripcion: req.body.Descripcion,
                Precio: req.body.precio,
                Img: req.file.filename
            },
        };
        await docClient.send(new PutCommand(params));
        res.status(201).send('Transacción creada!');
    }
}

async function getPrice(){
    const cryptoApiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash-sv&vs_currencies=usd';
    const response = await axios.get(cryptoApiUrl);
    let btcPriceInUSD = response.data['bitcoin-cash-sv'].usd;
    return btcPriceInUSD;
}

async function getBsvAddressBalance(add) {
    const url = `https://api.whatsonchain.com/v1/bsv/main/address/${add}/balance`;
    try {
      const response = await axios.get(url);
      let data = response.data;
      return data;
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    }
}

async function countItems(tableName) {
    let totalItems = 0;
    let scanParams = {
      TableName: tableName,
      Select: "COUNT"  
    };
  
    let scanResults;
    do {
      scanResults = await docClient.send(new ScanCommand(scanParams));
      totalItems += scanResults.Count;  
      scanParams.ExclusiveStartKey = scanResults.LastEvaluatedKey;
    } while (scanResults.LastEvaluatedKey);
  
    return totalItems;
  }

  async function fetchAllData(tableName) {
    const params = {
        TableName: tableName,
    };

    try {
        const data = await docClient.send(new ScanCommand(params));
        return data.Items;
    } catch (error) {
        console.error("Error al recuperar datos:", error);
        return null;
    }
}

async function deleteById(tableName, id) {
    const scanParams = {
        TableName: tableName,
        FilterExpression: "ID = :ID",
        ExpressionAttributeValues: {
            ":ID": id
        }
    };

    try {
        const scanResult = await docClient.send(new ScanCommand(scanParams));
        if (scanResult.Items.length > 0) {
            scanResult.Items.forEach(async (item) => {
                const deleteParams = {
                    TableName: tableName,
                    Key: {
                        BuyCripto: item.BuyCripto
                    }
                };
                await docClient.send(new DeleteCommand(deleteParams));
            });
        }
    } catch (error) {
        console.error("Error al escanear o borrar items:", error);
    }
}

async function sendMoney(address2send, satoshis2send) {
    let info = await getWallerPkey("1", "WalletSencilla");
    info = info.Items; 
    plain = await kms.decrypt(Buffer.from(info[0].privateKeyEncrypted, 'base64'));
    add = info[0].add;
    const privkey = String.fromCharCode(...plain);
    const privKey = bsv.PrivateKey.fromWif(privkey)
    let utxos = await consult(add);
    const version = 1;
    let satoshish = 0;
    let inputs = await Promise.all(utxos.map(async utxo => {
        try {
            const transactionHex = await fetchTransaction(utxo.tx_hash);
            const sourceTransaction = bsv.Transaction.fromHex(transactionHex);
            satoshish += utxo.value;
            return {
                sourceTransaction,
                sourceOutputIndex: utxo.tx_pos,
                unlockingScriptTemplate: new bsv.P2PKH().unlock(privKey)
            };
        } catch (error) {
            console.error("Error while mapping utxos:", error);
            throw error; 
        }
    }));
    if (satoshis2send >= (satoshish-1000)){
        return 0;
    }
    const changeSatoshis = satoshish - satoshis2send - 500;
    const outputs = [
        {
            satoshis: parseInt(satoshis2send),
            lockingScript: new bsv.P2PKH().lock(address2send),
            change: false
        },
        {
            satoshis: changeSatoshis,
            lockingScript: new bsv.P2PKH().lock(add),
            change: true
        }
    ];
    const tx = new bsv.Transaction(version, inputs, outputs);
    await tx.fee()
    await tx.sign()
    let res = await tx.broadcast(new bsv.ARC('https://api.taal.com/arc', process.env.TAAL)).then(response => {
        return response;
      })
      .catch(error => {
        console.error('Error durante el broadcast:', error);
        return 0;
      });
    return res
}

async function getWallerPkey(ID, tableName) {
    try {
        const scanParams = {
            TableName: tableName,
            FilterExpression: "ID = :ID",
            ExpressionAttributeValues: {
                ":ID": ID
            }
        };
        const scanResult = await docClient.send(new ScanCommand(scanParams));
        return scanResult;
    } catch (error) {
        console.error('Error al buscar usuario por correo electrónico:', error);
        return null;
    }
}

async function consult(add) {
    const url = `https://api.whatsonchain.com/v1/bsv/main/address/${add}/unspent`;
    const response = await axios.get(url);
    return response.data;
}

async function fetchTransaction(txHash) {
    const url = `https://api.whatsonchain.com/v1/bsv/main/tx/${txHash}/hex`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

async function updateConfirmById(tableName, id, confirm) {
    const scanParams = {
        TableName: tableName,
        FilterExpression: "ID = :ID",
        ExpressionAttributeValues: {
            ":ID": id
        }
    };

    try {
        const scanResult = await docClient.send(new ScanCommand(scanParams));
        if (scanResult.Items.length > 0) {
            scanResult.Items.forEach(async (item) => {
                const updateParams = {
                    TableName: tableName,
                    Key: {
                        BuyCripto: item.BuyCripto 
                    },
                    UpdateExpression: "SET IsConfirmed = :IsConfirmed",
                    ExpressionAttributeValues: {
                        ":IsConfirmed": confirm
                    }
                };
                await docClient.send(new UpdateCommand(updateParams));
            });
        }
    } catch (error) {
        console.error("Error al escanear o actualizar items:", error);
    }
}

module.exports = new TransactionController();