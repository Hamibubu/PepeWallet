const router = require('express').Router();
const auth = require('./../middlewares/login');
const SignerController = require('./../controllers/signersControllers');
const secquery = require('./../middlewares/secquery') 

router.post('/login/sign', secquery, SignerController.iniciarsesion)

module.exports = router;