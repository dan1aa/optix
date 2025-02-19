const express = require('express');
const router = express.Router();
const path = require('path');
const checkNoAuth = require('../middlewares/checkNoAuth')
const axios = require('axios')

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

router.get('/:lang/ohlc', async (req, res) => {
    const { pair } = req.query;
    const url = `https://api.kraken.com/0/public/OHLC?pair=${pair}&interval=1`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        res.json(data);
    } catch (error) {
        console.error("Error fetching data from Kraken:", error);
        res.status(500).json({ error: 'Failed to fetch data from Kraken' });
    }
});

module.exports = router;