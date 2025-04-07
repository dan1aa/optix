const jwt = require('jsonwebtoken');

function checkNoAuth(req, res, next) {
    const token = req.cookies.token;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (!err) {
                return res.redirect('/en/trade?asset=404');
            }
            return next(); 
        });
    } else {
        next();
    }
}

module.exports = checkNoAuth;