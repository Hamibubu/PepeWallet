const { KMSClient, EncryptCommand } = require('@aws-sdk/client-kms');
const KMS = require('@aws-sdk/client-kms')
require('dotenv').config();

class KeyManagementServices {
    async encrypt(buffer) {
        const kms = new KMSClient({
            region: process.env.AWS_REGION_A,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID_A,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_A,
            },
        });
        const input = {
            "KeyId": process.env.KeyId,
            "Plaintext": buffer
          };
        const command = new EncryptCommand(input);
        const response = await kms.send(command);
        let cipher = Buffer.from(response.CiphertextBlob).toString('base64');
        return cipher
        
    }
    async decrypt(buffer) {
        const kms = new KMSClient({
            accessKeyId: process.env.accessKeyKMS,
            secretAccessKey: process.env.secretAccessKeyAws,
            region: process.env.awsRegion
        });
       
    }
}

module.exports = new KeyManagementServices();