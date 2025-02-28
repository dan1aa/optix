const mongoose = require('mongoose');

const topUpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'withdrawal_pending', 'withdrawal_completed', 'withdrawal_failed'],
    default: 'pending' 
  },
  paymentId: { type: String, required: true },
  cardNumber: { type: String, required: false },
  transactionType: { 
    type: String, 
    enum: ['topUp', 'withdrawal'], 
    required: true 
  },
  gateway:{type:Number},
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TopUp', topUpSchema);
