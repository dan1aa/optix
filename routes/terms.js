const express = require('express');
const router = express.Router();
const path = require('path');

const getLangFromUrl = (req) => {
    const lang = req.params.lang;
    if (lang === 'ru' || lang === 'en') {
        return lang;
    }
    return 'en';
};

router.get('/:lang/termsandconditions', (req, res) => {
    const lang = getLangFromUrl(req)
    res.sendFile(path.join(__dirname, '..', `public/views/${lang}`, 'termsandconditions.html'));
});

module.exports = router;