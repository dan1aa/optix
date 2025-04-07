const mongoose = require('mongoose');

const BotSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    accType: { type: String, enum: ['demo', 'real'], required: true },
    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('BotSession', BotSessionSchema);
