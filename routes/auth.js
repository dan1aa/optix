const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middlewares/authenticateToken');
const User = require('../models/User');
const checkNoAuth = require('../middlewares/checkNoAuth');
const saltRounds = 10;


const getLangFromUrl = (req) => {
    const lang = req.params.lang;
    if (lang === 'ru' || lang === 'en') {
        return lang;
    }
    return 'en';
};


router.get('/:lang/registration', checkNoAuth, (req, res) => {
    const lang = getLangFromUrl(req)
    res.sendFile(path.join(__dirname, '..', `public/views/${lang}`, 'registration.html'));
});

router.post('/:lang/registration', async (req, res) => {
    try {
        const { firstname, lastname, year, month, day, country, email, telegram, password, timezone, gender } = req.body;
        const birthDate = new Date(`${year}-${month}-${day}`);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists", exist: true, success: false });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            name: firstname,
            surname: lastname,
            birth: birthDate,
            country,
            email,
            telegram,
            pass: hashedPassword,
            timezone,
            gender,
            demoBalance: 0,
            realBalance: 0,
            phone: ""
        });

        await newUser.save();

        res.status(200).json({ message: "User registered successfully", success: true });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Server error", success: false });
    }
});

router.post('/:lang/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found', notFound: true });
        }

        const isMatch = await bcrypt.compare(password, user.pass);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password', invalidPassword: true });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'Strict'
        });

        res.json({ message: 'Logged in successfully', success: true });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});



router.get('/:lang/me', authenticateToken, async (req, res) => {
    const id = req.user.id;

    const user = await User.findOne({_id: id});
    return res.json(user)
});

router.get('/:lang/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/en')

});

module.exports = router;