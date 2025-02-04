const jwt = require('jsonwebtoken');

function checkAuth(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/en');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.redirect('/en');
        }

        req.user = decoded;

        next();
    });
}

module.exports = checkAuth;