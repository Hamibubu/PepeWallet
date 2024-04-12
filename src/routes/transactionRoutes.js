const router = require('express').Router();
const auth = require('./../middlewares/login');
const authe = require('./../middlewares/login_esp');
const file = require('./../middlewares/upload');
const TransactionController = require('./../controllers/transactionController');
const secquery = require('./../middlewares/secquery'); 

router.get('/transactions', auth, secquery, TransactionController.getTransaction);
router.get('/money', auth, TransactionController.getCurrentMoney);
router.get('/transactions/accept/:tid', auth, secquery, TransactionController.acceptTransaction);
router.get('/transactions/decline/:tid', auth, secquery, TransactionController.declineTransaction);
router.get('/history', auth, secquery, TransactionController.getHistory);
router.post('/buy', authe, file.single('img'), TransactionController.createNewTransaction);

module.exports = router;