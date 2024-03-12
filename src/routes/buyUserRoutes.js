const router = require('express').Router();
const auth = require('./../middlewares/login');
const BuyerController = require('./../controllers/buyerController');
const secquery = require('./../middlewares/secquery');

router.post('/login/buy', secquery, BuyerController.iniciarsesion);

module.exports = router;