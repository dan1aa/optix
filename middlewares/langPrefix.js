function langPrefix(req, res, next) {
    const isStaticFile = req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|ttf|woff2)$/i);

    if (isStaticFile) {
        return next();
    }

    // Перевіряємо, чи є у шляху префікс /en або /ru
    const hasLangPrefix = req.path.startsWith('/en') || req.path.startsWith('/ru');

    if (!hasLangPrefix) {
        // Визначаємо попередню мову за заголовком Referer
        const referer = req.headers.referer || '';
        const previousLang = referer.includes('/ru') ? 'ru' : 'en';

        return res.redirect(`/${previousLang}${req.url}`);
    }

    next();
}

module.exports = langPrefix;
