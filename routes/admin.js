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

module.exports = router;