const { response } = require('express');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({ 
    region: process.env.AWS_REGION_B,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_B,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_B,
    },
}));

class SignerController {
    async iniciarsesion(req,res) {
        try{
            let user = await getUserByEmail(req.body.email);
            user = user[0];
            let mail = user.Mail;
            if (!user.Mail) {
                return res.status(400).send({ message: 'El email no está registrado' });
            } 
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            if (!isMatch) {
                return res.status(400).send({ message: 'Contraseña incorrecta' });
            }
            const userType = "Signer";
            const username = user.Signername
            const tokenPayload = {
                userType,
                username,
                mail
            }
            const token = jwt.sign(tokenPayload, process.env.SECRET_KEY, { expiresIn: '1h' });
            res.send({ token });
        } catch (err) {
            console.error('Login error: ', err);
            res.sendStatus(500).send("Error interno"); 
        }
    }
    welcome(req, res) {
        const username = req.user.username;
        const userType = req.user.userType;
        res.send(`Bienvenido, ${username} (${userType})`);
    }

}

async function getUserByEmail(email) {
    try {
        const command = new ScanCommand({
            TableName: "Usuarios",
            FilterExpression: "#Mail = :Mail",
            ExpressionAttributeNames: {
                "#Mail": "Mail"
            },
            ExpressionAttributeValues: {
                ":Mail": email
            }
        });
        const { Items } = await docClient.send(command);
        return Items;
    } catch (error) {
        console.error('Error al buscar usuario por correo electrónico:', error);
        return null;
    }
}

module.exports = new SignerController();