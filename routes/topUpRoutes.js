const express = require('express');
const router = express.Router();
const topUpController = require('../controllers/topUpController');
const authenticateTokenFromHeader = require('../middlewares/authenticateTokenHeader');


router.post('/:lang/create-top-up', authenticateTokenFromHeader, topUpController.createTopUp);

router.post('/:lang/record', topUpController.proceedPayment);

router.get('/:lang/payments', authenticateTokenFromHeader,topUpController.getMyPayments);
router.post('/:lang/withdraw', authenticateTokenFromHeader,topUpController.createWithdrawalRequest);

module.exports = router;
