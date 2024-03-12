const router = require('express').Router();
const auth = require('./../middlewares/login');
const roles = require('./../middlewares/roles');
const SignerController = require('./../controllers/signersControllers');
const BuyerController = require('./../controllers/buyerController');

let rolesList = ['Signer','Buyer'];

const welcomeRouteHandlers = {
    'Signer': SignerController.welcome,
    'Buyer': BuyerController.welcome
}

router.get('/welcome',auth,roles(rolesList,welcomeRouteHandlers));

module.exports = router;