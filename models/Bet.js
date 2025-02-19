const mongoose = require('mongoose');

const BetSchema = new mongoose.Schema({
    ssid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    accType: { type: String, required: true },
    asset: { type: String, required: true }, // Bitcoin
    amount: { type: Number, required: true }, // Investments ($10.00, $25.00)
    position: { type: String, enum: ['call', 'put'], required: true }, // Buy/Sell
    createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) }, // Unix timestamp в секундах
    expiredAt: { type: Number, required: true }, // Unix timestamp в секундах
    openPrice: { type: Number, required: true }, // Open Price (96055)
    closePrice: { type: Number }, // Close Price (95996)
    result: { type: String, enum: ['win', 'lose', 'pending'], default: 'pending' },
    profit: { type: Number, default: 0 } // Profit ($44.00)
});

module.exports = mongoose.model('Bet', BetSchema);