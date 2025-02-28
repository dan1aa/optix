const express = require('express');
const router = express.Router();
const path = require('path');
const checkNoAuth = require('../middlewares/checkNoAuth')


router.get('/:lang/payment/success', (req, res) => {
    res.sendFile(path.join(__dirname, '..', `public/views/ru`, 'payment_success.html'));
});


router.get('/:lang/payment/failure', (req, res) => {
    res.sendFile(path.join(__dirname, '..', `public/views/ru`, 'payment_failure.html'));
});

module.exports = router;