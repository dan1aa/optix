const express = require('express');
const router = express.Router();
const path = require('path');
const checkNoAuth = require('../middlewares/checkNoAuth')
const axios = require('axios')
const User = require('../models/User')
const { startBot } = require('../controllers/botController')
const BotBet = require('../models/BotBet')
const BotSession = require('../models/BotSession');
const { activeBots, stopBot } = require('../controllers/botManager'); // Імпортуємо activeBots

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

router.post('/:lang/update-real', async (req, res) => {
    const { id, amount } = req.body;

    await User.updateOne(
        { _id: id },
        { $set: { realBalance: amount } }

    );

})

router.post('/:lang/update-demo', async (req, res) => {
    const { id, amount } = req.body;

    await User.updateOne(
        { _id: id },
        { $set: { demoBalance: amount } }
    );

})

router.post('/en/create-user-admin', async (req, res) => {
    const { name, surname, password, demo, real, email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "Почта уже есть!", success: false });
    }

    const newUser = new User({
        name,
        surname,
        email,
        pass: password,
        demoBalance: demo,
        realBalance: real,
    });

    await newUser.save();

    return res.status(200).json({ message: "Успешно!", success: true });

})

router.post('/:lang/updateBot', async (req, res) => {
    const { id } = req.body;

    let futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);

    let formattedDate = futureDate.toISOString().split('T')[0];

    return await User.updateOne({ _id: id }, { $set: { isBot: true, keyDate: formattedDate } });
});


router.post('/:lang/start-bot', startBot);

router.get('/:lang/bot-bets/:userId', async (req, res) => {
    const { userId } = req.params;
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    const bets = await BotBet.find({ startedAt: { $lt: twoMinutesAgo }, userId });

    return res.status(200).json({ bets });
})

router.get('/:lang/active-bot/:userId', async (req, res) => {
    const { userId } = req.params;

    const bot = await BotSession.findOne({userId, isActive: true});

    return res.json({ bot })
})

router.post('/:lang/stop-bot', async (req, res) => {
    const { userId } = req.body;

    const id = await BotSession.findOne({userId, isActive: true}).select('_id');

    if (!id._id || !activeBots[id._id]) {
        return res.status(400).json({ success: false, message: 'Бот не знайдено або вже зупинений' });
    }

    await BotSession.updateOne({ _id: id._id }, { $set: { isActive: false } });

    stopBot(id._id);

    return res.json({ success: true, message: `Бот ${id._id} зупиняється` });
})

module.exports = router;