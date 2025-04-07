const express = require('express');
const router = express.Router();
const path = require('path');
const checkAuth = require('../middlewares/checkAuth');
const User = require('../models/User')
const { getOpenBets } = require('../controllers/betsController');

const getLangFromUrl = (req) => {
    const lang = req.params.lang;
    if (lang === 'ru' || lang === 'en') {
        return lang;
    }
    return 'en';
};


router.get('/:lang/account/personalinfo', checkAuth, (req, res) => {
    const lang = getLangFromUrl(req)
    res.sendFile(path.join(__dirname, '..', `public/views/${lang}`, 'personal-info.html'));
});

router.get('/:lang/account/transactions', checkAuth, (req, res) => {
    const lang = getLangFromUrl(req)
    res.sendFile(path.join(__dirname, '..', `public/views/${lang}`, 'transactions.html'));
});

router.get('/:lang/account/history', checkAuth, (req, res) => {
    const lang = getLangFromUrl(req)
    res.sendFile(path.join(__dirname, '..', `public/views/${lang}`, 'analytics.html'));
});

router.get('/:lang/account/deposit/:payment', checkAuth, (req, res) => {
    const lang = getLangFromUrl(req)
    res.sendFile(path.join(__dirname, '..', `public/views/${lang}`, 'deposit.html'));
});

router.get('/:lang/account/withdrawal/:payment', checkAuth, (req, res) => {
    const lang = getLangFromUrl(req)
    res.sendFile(path.join(__dirname, '..', `public/views/${lang}`, 'withdrawal.html'));
});

router.get('/:lang/account/bonuses', checkAuth, (req, res) => {
    const lang = getLangFromUrl(req)
    res.sendFile(path.join(__dirname, '..', `public/views/${lang}`, 'account-bonuses.html'));
});

router.post('/:lang/account/change-data', async (req, res) => {
    try {
        const { phone, code, pass, id, country } = req.body;

        const user = await User.findOne({ _id: id }).select('pass');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        if (pass != user.pass) {
            return res.status(400).json({ message: 'Invalid password', invalidPassword: true });
        }
        let updatedData;

        if (phone) {
             updatedData = {
                phone: `${code} ${phone}`,
                country: country
            };
        } else {
            updatedData = {
                country: country
            };
        }

 

        await User.updateOne({ _id: id }, { $set: updatedData });

        res.json({ message: 'User updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:lang/account/change-pass', async (req, res) => {
    try {
        const { currPass, newPass, id } = req.body;

    const user = await User.findOne({_id: id});


    if (currPass != user.pass) {
        return res.status(400).json({ message: 'Invalid password', invalidPassword: true });
    }


    await User.updateOne({ _id: id }, { $set: { pass: newPass } });

    res.json({ message: 'User updated successfully' });
    } catch(e) {
        return res.json({e})
    }
})

router.get('/:lang/account/open-bets/:sessionId', async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
    if (!sessionId) return res.status(400).json({ error: "Session ID is required" });

    const openBets = await getOpenBets(sessionId);
    res.json(openBets);
    } catch(e) {
        return res.json({e})
    }
});

module.exports = router;