const router = require('express').Router();
const auth = require('./../middlewares/login');
const file = require('./../middlewares/onlyBuy');
const TransactionController = require('./../controllers/transactionController');
const secquery = require('./../middlewares/secquery'); 

router.get('/transactions', auth, secquery, TransactionController.getTransaction);
router.get('/money', auth, TransactionController.getCurrentMoney);
router.get('/transactions/accept/:tid', auth, secquery, TransactionController.acceptTransaction);
router.get('/transactions/decline/:tid', auth, secquery, TransactionController.declineTransaction);
router.get('/history', auth, secquery, TransactionController.getHistory);
router.post('/buy', auth, file.single('img'), async (req, res, error) => {
    await TransactionController.createNewTransaction(error, res, req);
});

module.exports = router;