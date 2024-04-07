const { response } = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

class TransactionController {
    async getTransaction(req, res) {
        try{
            let simulateArray = [
                {
                    "img": "/assets/img/reff.jpg",
                    "item": "Refacción",
                    "id": "1",
                    "description": "Ejemplo 1"
                },
                {
                    "img": "/assets/img/reff.jpg",
                    "item": "Refacción",
                    "id": "2",
                    "description": "Ejemplo 1"
                },
                {
                    "img": "/assets/img/reff.jpg",
                    "item": "Refacción",
                    "id": "3",
                    "description": "Ejemplo 1"
                }
            ]
            res.send(simulateArray);
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
                res.send("Transacción aceptada")
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
        let simulateArray = [
            {
                "img": "/assets/img/reff.jpg",
                "title": "Refacción",
                "description": "Ejemplo 1",
                "precio": "69 $"
            },
            {
                "img": "/assets/img/reff.jpg",
                "title": "Refacción",
                "description": "Ejemplo 1",
                "precio": "69 $"
            },
            {
                "img": "/assets/img/reff.jpg",
                "title": "Refacción",
                "description": "Ejemplo 1",
                "precio": "69 $"
            },
            {
                "img": "/assets/img/reff.jpg",
                "title": "Refacción",
                "description": "Ejemplo 1",
                "precio": "69 $"
            }
        ]
        try {
            res.send(simulateArray)
        } catch (err) {
            console.error('Login error: ', err);
            res.status(500).send("Error interno");
        }
    }

    async createNewTransaction(res, req, error) {
        if (error.message == 'Unauthorized: User is not a Buyer'){
            res.status(401).send('Unauthorized');
        } else {
            req.status(201).send('Transacción creada!');
        }
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

module.exports = new TransactionController();