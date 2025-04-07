const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');


router.get('/:lang/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', `public/views/en`, 'admin.html'));
});

router.get('/:lang/admin2', (req, res) => {
    res.sendFile(path.join(__dirname, '..', `public/views/en`, 'admin2.html'));
});

router.get('/:lang/admin/users', async (req, res) => {
    const { isOurs } = req.query;

    let filter = {};
    if (isOurs !== undefined) {
        filter.isOur = isOurs === 'true';
    }

    let users = await User.find(filter);
    
    return res.json(users);
});


router.get('/:lang/admin-key', (req, res) => {
    res.json({ key: "tt-xx-thf-dhe" })
})

router.post('/:lang/admin-login', (req, res) => {
    try {
        const { password } = req.body;

    if (password == '49382773') {
        res.json({ success: true })
        return;
    }
    res.json({ success: false })
    } catch(e) {
        return res.json({e})
    }
})

module.exports = router;