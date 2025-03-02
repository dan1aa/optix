const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const mongoose = require('mongoose');
const WebSocket = require('ws');
const Bet = require('./models/Bet')
const { createBet, closeBet, getDeals, scheduleBetClosure , getCurrentPrice, getOpenBets } = require('./controllers/betsController');
const { formatAssets, displayAssets } = require('./data')
const port = 3000;
// let host = '127.1.4.137';


async function restorePendingBets() {
    const pendingBets = await Bet.find({ result: 'pending' });
    pendingBets.forEach(bet => {
        scheduleBetClosure(bet._id, bet.expiredAt);
    });
}

restorePendingBets();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 

app.use(cors());
app.use(express.json());
app.use(cookieParser());


const wss = new WebSocket.Server({ port: 8080 });
console.log("WebSocket сервер запущений на порту 8080");

// Обробка підключень
wss.on('connection', function connection(ws) {
    console.log('Клієнт підключився');

    const timeSyncMessage = JSON.stringify({ timeSync: Math.floor(Date.now() / 1000) });
    ws.send(timeSyncMessage);
    
    setInterval(() => {
        const timeSyncUpdate = JSON.stringify({ timeSync: Math.floor(Date.now() / 1000) });
        ws.send(timeSyncUpdate);
    }, 1000);

    const amountListMessage = JSON.stringify({
        AmountList: {
            data: [10, 50, 250, 1000, 5000, 25000]
        }
    });
    ws.send(amountListMessage);

    let transformedData = {};

    displayAssets.forEach(item => {
        transformedData[item.id] = [
            item.id,
            item.name,
            item.name,
            item.start,
            item.end,
            
        ];
    });

    const assetsMessage = JSON.stringify({
        Assets: {
            data: transformedData
        }
    });

    ws.send(assetsMessage);

    ws.on('message', async (message) => {
        const [command, ssid, ...args] = message.toString().split(' ');

        switch (command) {
            case 'createOption':
                const bet = await createBet(ssid, args);
                ws.send(JSON.stringify({ createOption: bet }));
                break;

            case 'closeOption':
                const closedBet = await closeBet(ssid, args);
                ws.send(JSON.stringify({ closeOption: closedBet }));
                break;

            case 'getDeals':
                const bets = await getDeals(ssid);
                if (bets) {
                    let betsCopy = bets.map(bet => ({
                        ...bet.toObject(),  // Видаляємо метадані Mongoose
                        quotename: displayAssets.find(d => d.id == +bet.asset)?.name || "Unknown"
                    }));
                    ws.send(JSON.stringify({ getDeals: { deals: betsCopy } }));
                }
                break;
        }
    });
});



const home = require('./routes/home');
const about = require('./routes/about');
const faq = require('./routes/faq');
const terms = require('./routes/terms');
const auth = require('./routes/auth');
const trade = require('./routes/trade');
const robot = require('./routes/robot');
const account = require('./routes/account');
const admin = require('./routes/admin');
const payment = require('./routes/payment');
const topUp = require('./routes/topUpRoutes')

const langPrefix = require('./middlewares/langPrefix');

app.use(langPrefix);

app.use('/', home);
app.use('/', about);
app.use('/', faq);
app.use('/', terms);
app.use('/', auth);
app.use('/', trade);
app.use('/', robot);
app.use('/', account);
app.use('/', admin);
app.use('/', payment);
app.use('/',topUp);

app.use(express.static(path.join(__dirname, 'public')));

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });

        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};
connectDB();

function checkAndCloseBets() {

    Bet.find({ result: 'pending' }).then(async (bets) => {
        if (!bets.length) return;
        for (const bet of bets) {
            const now = Math.floor(Date.now() / 1000);
            if (bet.expiredAt - now == 1 || bet.expiredAt - now == 0) {
                const asset = formatAssets.find(d => d.id == +bet.asset);
                if (!asset) continue;

                const closePrice = await getCurrentPrice(asset.name);
                const closedBet = await closeBet(bet.ssid, [bet._id, closePrice]);

                const message = JSON.stringify({ closeOption: closedBet });
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(message);
                    }
                });
            }
        }
    });
}

setInterval(() => {
    const now = new Date();
    if (now.getSeconds() === 59 ) {
        checkAndCloseBets();
    }
}, 1000);