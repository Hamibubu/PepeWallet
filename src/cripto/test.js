const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
require('dotenv').config();

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({ 
    region: process.env.AWS_REGION_B,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_B,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_B,
    },
}));

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

// Llamada a la función para buscar un usuario por correo electrónico
getUserByEmail("")
    .then(users => console.log('Usuarios encontrados:', users))
    .catch(error => console.error('Error:', error));
