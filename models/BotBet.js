const mongoose = require('mongoose')

const BotBetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'BotSession', required: true },
    asset: { type: String, required: true },
    amount: { type: Number, default: 25 },
    initialBalance: { type: Number, required: true },
    finalBalance: { type: Number },
    openPrice: { type: Number },
    closePrice: { type: Number },
    position: { type: String, enum: ['call', 'put'], required: true },
    result: { type: String, enum: ['win', 'lose'] },
    startedAt: { type: Date, default: Date.now },
    closedAt: { type: Date }
});

module.exports = mongoose.model('BotBet', BotBetSchema);
