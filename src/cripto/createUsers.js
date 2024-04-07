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
        // Generar las llaves privadas
        const privateKey1 = bsv.PrivKey.fromRandom();
        const privateKey2 = bsv.PrivKey.fromRandom();
        const privateKey3 = bsv.PrivKey.fromRandom();
        const privateKey4 = bsv.PrivKey.fromRandom();
        const privateKey5 = bsv.PrivKey.fromRandom();

        const privKeys = [privateKey1,privateKey2,privateKey3,privateKey4,privateKey5];

        // Generar las llaves públicas a partir de las privadas
        const publicKey1 = bsv.PubKey.fromPrivKey(privateKey1);
        const publicKey2 = bsv.PubKey.fromPrivKey(privateKey2);
        const publicKey3 = bsv.PubKey.fromPrivKey(privateKey3);
        const publicKey4 = bsv.PubKey.fromPrivKey(privateKey4);
        const publicKey5 = bsv.PubKey.fromPrivKey(privateKey5);

        // Las guardamos en un array
        const pubKeys = [publicKey1, publicKey2, publicKey3, publicKey4, publicKey5];

        // Guardamos las firmas que son requeridas para autorizar la transacción
        const requiredSignatures = 3;

        // Crear una instancia de Script
        let script = new bsv.Script();

        // Utilizar el método proporcionado para crear el script multifirma
        script = script.fromPubKeys(requiredSignatures, pubKeys, true);

        // La función fromPubKeys modifica el objeto script en su lugar y devuelve el objeto modificado
        console.log("Script Multifirma:", script.toString());
        console.log("Script Multifirma:", script.toAsmString());

        Signers = ["Pepe","Abraham","Juan Pablo","Emiliano", "Jesus"];
        Passwords = [process.env.Pepe_password,process.env.Abraham_Password,process.env.JP_Password,process.env.Emiliano_Password,process.env.Jesus_Password];
        Mails = [process.env.Pepe_Mail,process.env.Abraham_Mail,process.env.JP_Mail,process.env.Emiliano_Mail,process.env.Jesus_Mail]

        for (let i = 0; i < 5; i++) {
            let signerid = i+1;
            let signername = Signers[i];
            let password = Passwords[i];
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            let mail = Mails[i];
            let pubkey = pubKeys[i];
            let privkey = privKeys[i].toWif();
            console.log(privkey)
            const encryptedPrivateKey = await kms.encrypt(Buffer.from(privkey));
            const params = {
                TableName: "Usuarios",
                Item: {
                    ProyectoCriptoUsuarios: signerid.toString(),
                    ID: signerid,
                    Mail: mail,
                    Signername: signername,
                    privateKeyEncrypted: encryptedPrivateKey,
                    pubKey:  pubkey.toBuffer().toString('base64'),
                    password: hashedPassword,
                    multisignstring: script.toString(),
                    mutisignasm: script.toAsmString()
                },
            };
            await docClient.send(new PutCommand(params));
            console.log("Item insertado con éxito en DynamoDB");
        }
    } catch (err) {
        console.log(err)
    }
}

main();