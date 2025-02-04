function langPrefix(req, res, next)  {
    const isStaticFile = req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|TTF|ttf|woff2)$/);
    
    if (isStaticFile) {
        return next();
    }

    if (!req.path.startsWith('/en') && !req.path.startsWith('/ru')) {
        return res.redirect(`/en${req.url}`);
    }
    
    next();
}
module.exports = langPrefix;