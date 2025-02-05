const express = require('express');
const router = express.Router();
const path = require('path');
const checkNoAuth = require('../middlewares/checkNoAuth')

const getLangFromUrl = (req) => {
    const lang = req.params.lang;
    if (lang === 'ru' || lang === 'en') {
        return lang;
    }
    return 'en';
};


router.get('/:lang', checkNoAuth, (req, res) => {
    const lang = getLangFromUrl(req)
    res.sendFile(path.join(__dirname, '..', `public/views/${lang}`, 'index.html'));
});

module.exports = router;