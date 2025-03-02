const topUpService = require('../services/topUpService');
const User = require('../models/User');

const TopUp = require('../models/TopUp');

async function proceedPayment(req, res) {
  const { AMOUNT, MERCHANT_ORDER_ID } = req.body;
  try {
    await topUpService.proceed(AMOUNT, MERCHANT_ORDER_ID)
  } catch (error) {
    console.error('Ошибка при сохранении запроса:', error);
  }
}

async function getMyPayments(req, res) {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const payments = await TopUp.find({ userId }).sort({ createdAt: -1 });

    res.json({ payments });
  } catch (error) {
    console.error('Ошибка при получении платежей пользователя:', error.message);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

async function createTopUp(req, res) {
  const { amount, currency, paymentGatewayId } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    const paymentUrl = await topUpService.createTopUp(user, amount, currency, paymentGatewayId, req.ip);

    res.json({ paymentUrl });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

async function createWithdrawalRequest(req, res) {
  const userId = req.user.id;
  const { amount, currency, paymentSystemId, account } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const response = await topUpService.createWithdrawalRequest(user._id,amount,currency,paymentSystemId,account);
    res.json({response})

  } catch (error) {
    console.error('Ошибка при получении платежей пользователя:', error.message);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

module.exports = { createTopUp, proceedPayment, getMyPayments,createWithdrawalRequest };
