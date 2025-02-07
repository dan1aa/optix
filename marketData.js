let candles = [];
let currentCandle = null;

// Функція генерації випадкової ціни (імітація біржі)
function getRandomPrice(lastPrice) {
    const change = (Math.random() - 0.5) * 2; // Випадкове відхилення від останньої ціни
    return parseFloat((lastPrice + change).toFixed(2));
}

// Генерація стартової історії (100 свічок)
function generateInitialCandles() {
    let now = Math.floor(Date.now() / 1000); // Поточний UNIX-час
    let price = 100; // Початкова ціна
    for (let i = 100; i > 0; i--) {
        let timestamp = now - i * 60; // Мінус 1 хвилина за кожну свічку
        let open = price;
        let close = getRandomPrice(open);
        let high = Math.max(open, close, getRandomPrice(close + 1));
        let low = Math.min(open, close, getRandomPrice(close - 1));

        candles.push({ time: timestamp, open, high, low, close });
        price = close; // Наступна свічка починається з ціни закриття попередньої
    }
}

// Функція для створення та оновлення 1-хвилинних свічок
function startMarketData() {
    const now = new Date();
    const timestamp = Math.floor(now.getTime() / 1000); // Unix-час

    // Щоразу, коли секунда змінюється на нуль, створюємо нову свічку
    if (!currentCandle || now.getSeconds() === 0) {
        if (currentCandle) {
            candles.push(currentCandle); // Додаємо закриту свічку в історію
            if (candles.length > 100) candles.shift(); // Обмежуємо історію 100 свічками
        }

        const price = getRandomPrice(currentCandle ? currentCandle.close : 100);
        currentCandle = {
            time: timestamp,
            open: price,
            high: price,
            low: price,
            close: price
        };
    } else {
        const newPrice = getRandomPrice(currentCandle.close);
        currentCandle.close = newPrice;
        if (newPrice > currentCandle.high) currentCandle.high = newPrice;
        if (newPrice < currentCandle.low) currentCandle.low = newPrice;
    }

    // Оновлюємо час і дані для більш живого вигляду
    currentCandle.time = timestamp; // Оновлюємо поточний час свічки

    return currentCandle;
}

// Функція для отримання історичних даних
function getHistoricalData() {
    return candles.map(candle => ({
        date: candle.time, // UNIX-час
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
    }));
}

module.exports = { startMarketData, getHistoricalData, generateInitialCandles };
