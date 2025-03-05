const BotBet = require('../models/BotBet');
const BotSession = require('../models/BotSession');
const { getCurrentPrice } = require('../controllers/betsController');
const { activeBots } = require('./botManager'); 

const ASSETS = ['XRPUSD', 'LTCUSD','BTCUSD', 'ETHUSD', 'EURUSD', 'GBPUSD'];


async function tradeLoop(sessionId, user, accType) {
    activeBots[sessionId] = true;

    const endTime = Date.now() + 2 * 24 * 60 * 60 * 1000;
    const startBalance = accType === 'demo' ? user.demoBalance : user.realBalance;

    while (Date.now() < endTime) {
        if (!activeBots[sessionId]) break;

        const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
        const position = Math.random() > 0.5 ? 'call' : 'put';
        const openPrice = await getCurrentPrice(asset);
        
        if (Date.now() >= endTime || !activeBots[sessionId]) break;

        const isWin = Math.random() < 0.8;
        let closePrice = isWin
            ? (position === 'call' ? openPrice * 1.001 : openPrice * 0.999)
            : (position === 'call' ? openPrice * 0.999 : openPrice * 1.001);

        const profit = isWin ? 44 : -25;
        const finalBalance = (accType === 'demo' ? user.demoBalance : user.realBalance) + profit;

        await BotBet.create({
            userId: user._id, sessionId, asset, amount: 25,
            initialBalance: startBalance, finalBalance, openPrice, closePrice,
            position, result: isWin ? 'win' : 'lose', closedAt: new Date()
        });

        if (accType === 'demo') user.demoBalance = finalBalance;
        else user.realBalance = finalBalance;
        await user.save();

        if (Date.now() >= endTime || !activeBots[sessionId]) break;

        const remainingTime = endTime - Date.now();
        const delay = Math.min((1 + Math.random()) * 60 * 1000, remainingTime);
        await new Promise(res => setTimeout(res, delay));
    }

    console.log(`🛑 Бот ${sessionId} зупинений`);
    delete activeBots[sessionId];

    await finishBot(user, sessionId, accType, startBalance);
}

async function finishBot(user, sessionId, accType, startBalance) {
    await BotSession.findByIdAndUpdate(sessionId, { isActive: false });

    const currentBalance = accType === 'demo' ? user.demoBalance : user.realBalance;
    const profitDuringSession = currentBalance - startBalance;
    const bonusAmount = 2000 - profitDuringSession;

    if (bonusAmount > 0) {
        if (accType === 'demo') user.demoBalance += bonusAmount;
        else user.realBalance += bonusAmount;
        await user.save();
    }
}


module.exports = { tradeLoop, finishBot };