const bsv = require('bsv');
const kms = require('./KMS');
const bcrypt = require('bcryptjs');
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

async function main () {
    try {
        const Buyer = "MainEnterpriseBuyer"
        const password = process.env.Buyer_Password
        const Mail = process.env.Buyer_Mail
        let buyerid = 1;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const params = {
            TableName: "Buyer",
            Item: {
                ProyectoCriptoBuyer: buyerid.toString(),
                ID: buyerid,
                Mail: Mail,
                Signername: Buyer,
                password: hashedPassword,
            },
        };
        await docClient.send(new PutCommand(params));
        console.log("Item insertado con éxito en DynamoDB");
    } catch (err) {
        console.log(err)
    }
}

main();