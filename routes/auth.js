const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middlewares/authenticateToken');
const saltRounds = 10;

const getLangFromUrl = (req) => {
    const lang = req.params.lang;
    if (lang === 'ru' || lang === 'en') {
        return lang;
    }
    return 'en';
};


router.get('/:lang/registration', (req, res) => {
    const lang = getLangFromUrl(req)
    res.sendFile(path.join(__dirname, '..', `public/views/${lang}`, 'registration.html'));
});

router.post('/:lang/registration', (req, res) => {
    const {
        firstname,
        lastname,
        year,
        month,
        day,
        country,
        email,
        telegram,
        password,
        timezone,
        gender
    } = req.body;

    const birthDate = `${year}-${month}-${day}`;

    const checkUserQuery = `SELECT id FROM user WHERE email = ?`;

    db.query(checkUserQuery, [email], (err, results) => {
        if (err) {
            console.error("Error checking user:", err);
            return res.status(500).json({ message: "Database error", success: false });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: "User with this email already exists", exist: true, success: false });
        }

        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) {
                console.error("Error hashing password:", err);
                return res.status(500).json({ message: "Error hashing password", success: false });
            }

            const insertQuery = `
                INSERT INTO user (name, surname, birth, country, email, telegram, pass, timezone, gender)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                firstname,
                lastname,
                birthDate,
                country,
                email,
                telegram,
                hashedPassword,
                timezone,
                gender
            ];

            db.query(insertQuery, values, (err, _) => {
                if (err) {
                    console.error("Error inserting data:", err);
                    return res.status(500).json({ message: "Error inserting data", success: false });
                }
                res.status(200).json({ message: "User registered successfully", success: true });
            });
        });
    });
});

router.post('/:lang/login', (req, res) => {
    const { email, password } = req.body;
    console.log(email, password)

    const query = 'SELECT * FROM user WHERE email = ?';

    db.query(query, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (results.length === 0) return res.status(400).json({ message: 'User not found', notFound: true });

        const user = results[0];

        if (!bcrypt.compareSync(password, user.pass)) {
            return res.status(400).json({ message: 'Invalid password', invalidPassword: true });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'Strict'
        });

        res.json({ message: 'Logged in successfully', success: true });
    });
})



router.get('/:lang/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

router.get('/:lang/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/en')

});

module.exports = router;