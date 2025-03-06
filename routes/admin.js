const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');


router.get('/:lang/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', `public/views/en`, 'admin.html'));
});

router.get('/:lang/admin/users', async (req, res) => {
    let users = await User.find({});

    return res.json(users)
})

router.get('/:lang/admin-key', (req, res) => {
    res.json({ key: "tt-xx-thf-dhe" })
})

router.post('/:lang/admin-login', (req, res) => {
    const { password } = req.body;

    if (password == '49382773') {
        res.json({ success: true })
        return;
    }
    res.json({ success: false })
})

module.exports = router;