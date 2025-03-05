const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();
const TopUp = require('../models/TopUp');
const User = require('../models/User');

const FK_API_URL = 'https://api.fk.life/v1';
const SHOP_ID = process.env.merchant_id;
const SECRET_KEY = process.env.freekassa_secret1;


function generateOrderId() {
  return Math.random().toString(36).substr(2, 16) + Date.now().toString(36).substr(2, 8);
}

function generateSignature(data) {
  const sortedKeys = Object.keys(data).sort();
  const dataString = sortedKeys.map(key => data[key]).join('|');
  return crypto.createHmac('sha256', SECRET_KEY).update(dataString).digest('hex');
}

async function createTopUp(user, amount, currency = 'USD', paymentGatewayId, ip) {
  const orderId = generateOrderId();

  const requestData = {
    shopId: SHOP_ID,
    nonce: Date.now(),
    paymentId: orderId,
    i: paymentGatewayId,
    email: user.email,
    ip: ip,
    amount,
    currency,
  };

  requestData.signature = generateSignature(requestData);

  try {
    const response = await axios.post(FK_API_URL + "/orders/create", requestData, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.data.type !== 'success') {
      throw new Error(`FreeKassa error: ${response.data.message}`);
    }

    const paymentUrl = response.data.location;

    const newTopUp = new TopUp({
      userId: user._id,
      amount,
      currency,
      paymentId: orderId,
      transactionType: 'topUp',
      status: 'pending',
      gateway: paymentGatewayId
    });

    await newTopUp.save();

    return paymentUrl;
  } catch (error) {
    console.error('Ошибка при создании платежа:', error);
    throw new Error('Ошибка при создании платежа');
  }
}

async function proceed(AMOUNT, MERCHANT_ORDER_ID) {
  try {
    const topUp = await TopUp.findOne({ paymentId: MERCHANT_ORDER_ID });
    if (!topUp) {
      throw new Error('Пополнение не найдено');
    }

    topUp.status = 'completed';
    await topUp.save();

    const user = await User.findById(topUp.userId);
    if (!user) {
      throw new Error('Пользователь не найден');
    }

    const amount = parseFloat(AMOUNT); 
    const realBalance = parseFloat(user.realBalance); 

    if (isNaN(amount) || isNaN(realBalance)) {
      throw new Error('Неверный формат данных для пополнения');
    }

    user.realBalance = realBalance + amount;
    await user.save();

    console.log(`Пополнение ${MERCHANT_ORDER_ID} завершено. Баланс пользователя обновлен.`);
  } catch (error) {
    console.error('Ошибка при обработке пополнения:', error.message);
  }
}


async function createWithdrawalRequest(userId, amount, currency, paymentSystemId, account) {
  try {
    const requestData = {
      shopId: SHOP_ID,
      nonce: Date.now(),
      paymentId: generateOrderId(),
      i: String(paymentSystemId),
      account,
      amount,
      currency
    };
    requestData.signature = generateSignature(requestData);
    const response = await axios.post(FK_API_URL + "/withdrawals/create", requestData);

    if (response.data.type !== 'success') {
      throw new Error(response.data.message || 'Ошибка при создании заявки');
    }

    const withdrawal = new TopUp({
      userId,
      amount,
      currency,
      status: 'withdrawal_pending',
      paymentId: requestData.paymentId,
      transactionType: 'withdrawal',
      gateway: paymentSystemId,
      createdAt: new Date()
    });

    await withdrawal.save();

    return { success: true, withdrawalId: response.data.data.id };
  } catch (error) {
    console.error('Ошибка при общении с платежной системой:', error.message);
    throw new Error('Ошибка при создании заявки на вывод');
  }
}

module.exports = { createTopUp, proceed,createWithdrawalRequest };
