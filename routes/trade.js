const express = require('express');
const router = express.Router();
const path = require('path');
const checkAuth = require('../middlewares/checkAuth');
const User = require('../models/User');

const getLangFromUrl = (req) => {
    const lang = req.params.lang;
    if (lang === 'ru' || lang === 'en') {
        return lang;
    }
    return 'en';
};


router.get('/:lang/trade', checkAuth, async (req, res) => {
    const lang = getLangFromUrl(req)
    res.sendFile(path.join(__dirname, '..', `public/views/${lang}`, 'trade.html'));

});

module.exports = router;