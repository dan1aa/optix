const User = require('../models/User');
const BotSession = require('../models/BotSession');
const { tradeLoop } = require('./tradeLogic');

async function startBot(req, res) {
    try {
        const { userId, accType } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
        const session = await BotSession.create({ userId, accType, expiresAt });

        tradeLoop(session._id, user, accType);

        res.json({ message: "Bot started", sessionId: session._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { startBot };
