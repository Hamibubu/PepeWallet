const { response } = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class BuyerController {
    async iniciarsesion(req,res) {
        try{
            let signer = "pepe@pepewallet.com"
            let password = "pepe123"
            const email = req.body.email;
            if (req.body.email != signer) {
                return res.status(400).send({ message: 'El email no está registrado' });
            } 
            if (req.body.password != password) {
                return res.status(400).send({ message: 'Contraseña incorrecta' });
            }
            const userType = "Buyer";
            const username = "pepe"
            const tokenPayload = {
                userType,
                username,
                email
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

module.exports = new BuyerController();