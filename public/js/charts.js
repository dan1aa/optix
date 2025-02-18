const assetsData = [
    { id: 1, name: "AUD/CAD", start: 1739404800, end: 1739483940 },
    { id: 3, name: "AUD/JPY", start: 1739404800, end: 1739491140 },
    { id: 4, name: "AUD/NZD", start: 1739404800, end: 1739491140 },
    { id: 6, name: "AUD/USD", start: 1739404800, end: 1739491140 },
    { id: 7, name: "EUR/AUD", start: 1739404800, end: 1739491140 },
    { id: 8, name: "EUR/CAD", start: 1739404800, end: 1739491140 },
    { id: 10, name: "EUR/GBP", start: 1739404800, end: 1739491140 },
    { id: 11, name: "EUR/JPY", start: 1739404800, end: 1739491140 },
    { id: 13, name: "EUR/USD", start: 1739404800, end: 1739491140 },
    { id: 14, name: "GBP/AUD", start: 1739404800, end: 1739491140 },
    { id: 15, name: "GBP/CAD", start: 1739404800, end: 1739491140 },
    { id: 16, name: "GBP/CHF", start: 1739404800, end: 1739491140 },
    { id: 17, name: "GBP/JPY", start: 1739404800, end: 1739491140 },
    { id: 19, name: "GBP/USD", start: 1739404800, end: 1739491140 },
    { id: 21, name: "NZD/CHF", start: 1739404800, end: 1739491140 },
    { id: 23, name: "NZD/USD", start: 1739404800, end: 1739491140 },
    { id: 24, name: "USD/CAD", start: 1739404800, end: 1739491140 },
    { id: 25, name: "USD/CHF", start: 1739404800, end: 1739491140 },
    { id: 27, name: "USD/JPY", start: 1739404800, end: 1739491140 },
    { id: 400, name: "BTC/USD", start: 1739404800, end: 1739491140 },
    { id: 402, name: "LTC/USD", start: 1739404800, end: 1739491140 },
    { id: 404, name: "ETH/USD", start: 1739404800, end: 1739491140 },
    { id: 407, name: "XRP/USD", start: 1739404800, end: 1739491140 }
]
const pageUrl = new URL(window.location.href);

const params = new URLSearchParams(pageUrl.search);

const pairQuery = params.get('asset');

(function () {
    class KrakenWebSocket {
        constructor(pair, interval = 1) {
            if (!KrakenWebSocket.instance) {
                this.wsUrl = "wss://ws.kraken.com";
                this.pair = pair;  // Торгова пара
                this.interval = interval;
                this.socket = null;
                this.ohlcData = [];
                this.currentCandle = null;
                this.reconnectTimeout = 5000;

                this.onTradeCallback = null;
                this.onOHLCUpdateCallback = null;

                this.connect(); 
                KrakenWebSocket.instance = this;

                // 🔄 Оновлюємо свічку кожні 3 секунди без перевірок
                setInterval(() => this.updateCandleManually(), 3000);
            }
            return KrakenWebSocket.instance;
        }

        // 📡 Підключення WebSocket
        connect() {
            this.socket = new WebSocket(this.wsUrl);

            this.socket.onopen = () => {
                console.log("✅ Підключено до Kraken WebSocket");
                this.subscribeToTrade();
            };

            this.socket.onmessage = (event) => this.handleMessage(event);

            this.socket.onclose = () => {
                console.warn("⚠ WebSocket відключено! Перепідключення...");
                setTimeout(() => this.connect(), this.reconnectTimeout);
            };

            this.socket.onerror = (error) => {
                console.error("❌ Помилка WebSocket:", error);
            };
        }

        // 📩 Підписка на торгові оновлення
        subscribeToTrade() {
            const message = {
                event: "subscribe",
                pair: [this.pair],
                subscription: { name: "trade" },
            };
            this.socket.send(JSON.stringify(message));
        }

        // 📥 Обробка повідомлень від WebSocket
        handleMessage(event) {
            const data = JSON.parse(event.data);

            if (Array.isArray(data) && data[2] === "trade") {
                for (const trade of data[1]) {
                    this.updateCurrentCandle(trade);
                }
            }
        }

        // 🔄 Оновлення поточної свічки
        updateCurrentCandle(trade) {
            const price = parseFloat(trade[0]);
            const timestamp = Math.floor(parseFloat(trade[2]));
            const intervalTime = Math.floor(timestamp / (this.interval * 60)) * (this.interval * 60);

            if (!this.currentCandle || this.currentCandle.time !== intervalTime) {
                if (this.currentCandle) {
                    this.ohlcData.push(this.currentCandle);
                    if (this.onOHLCUpdateCallback) {
                        this.onOHLCUpdateCallback(this.currentCandle);
                    }

                }

                this.currentCandle = {
                    time: intervalTime,
                    open: price,
                    high: price,
                    low: price,
                    close: price,
                    amount: price
                };
            } else {
                this.currentCandle.high = Math.max(this.currentCandle.high, price);
                this.currentCandle.low = Math.min(this.currentCandle.low, price);
                this.currentCandle.close = price;
                this.currentCandle.amount = price;
            }
        }

        // 🔄 Оновлення свічки кожні 3 секунди без перевірок змін
        updateCandleManually() {
            if (!this.currentCandle) return;

            if (this.onTradeCallback) {
                console.log("⏳ Виводимо поточну свічку кожні 3 секунди:", this.currentCandle);
                this.onTradeCallback(this.currentCandle);
            }
        }

        // 🔗 Підключення функції оновлення графіка
        onTradeUpdate(callback) {
            this.onTradeCallback = callback;
        }
    }

    const currAsset = assetsData.filter(e => e.id == +pairQuery)[0]

    window.krakenWS = new KrakenWebSocket(currAsset.name);
    
})();

class ChartWebSocketBridge {
    constructor(chart) {
        this.chart = chart;
        this.ws = window.krakenWS;
        this.ws.onTradeUpdate(this.updateChartData.bind(this));
        console.log("WebSocket Bridge initialized");

    }

    updateChartData(candle) {
        console.log("Received trade update:", candle);
        if (!this.chart.aData) this.chart.aData = [];
    
        const timestamp = candle.time;
        const currPriceInput = document.querySelector('.curr-price-input');
    
        // Отримуємо попереднє значення
        const prevPrice = parseFloat(currPriceInput.value) || 0;
        const newPrice = candle.close;
    
        // Оновлюємо значення в полі
        currPriceInput.value = newPrice;
    
        // Змінюємо колір залежно від зміни ціни
        currPriceInput.style.color = newPrice > prevPrice ? "green" : newPrice < prevPrice ? "red" : currPriceInput.style.color;
    
        let existingCandle = this.chart.aData.find(c => c.date === timestamp);
        const lastCandleIndex = this.chart.aData.length - 1;
    
        if (existingCandle) {
            // Оновлюємо поточну свічку
            existingCandle.high = Math.max(existingCandle.high, candle.high);
            existingCandle.low = Math.min(existingCandle.low, candle.low);
            existingCandle.close = newPrice;
            existingCandle.amount = newPrice;
    
            // Синхронізуємо останній елемент у aData
            this.chart.aData[lastCandleIndex] = { ...existingCandle };
    
            // Оновлюємо графік
            this.chart.updateSingleCandle(existingCandle);
        } else {
            // Додаємо стару свічку в історію
            const lastCandle = this.chart.aData[lastCandleIndex];
            if (lastCandle) {
                this.chart.aData.push({ ...lastCandle });
            }
    
            // Створюємо нову поточну свічку
            const newCandle = {
                date: timestamp,
                open: lastCandle ? lastCandle.close : candle.open,
                high: candle.high,
                low: candle.low,
                close: newPrice,
                amount: newPrice
            };
            this.chart.aData.push(newCandle);
    
            // Зсуваємо графік
            this.chart.shiftChart();
            this.chart.updateSingleCandle(newCandle);
        }
    
        // Викликаємо drawCurrentPositionElement лише один раз наприкінці
        this.chart.drawCurrentPositionElement();
    }
    
    
    
    
}


var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

var Chart = (function (_super) {
    __extends(Chart, _super);
    function Chart(obj) {
        _super.call(this);
        this.hoverPut = false;
        this.hoverCall = false;
        this.deleted = false;
        this.setParams(obj);
        this.hover = new Hover(this);
        this.forms = new Forms(this);
        this.mouse = new Mouse(this);
    }
    Chart.prototype.setX = function (x) {
        this.x = x;
    };
    Chart.prototype.setY = function (y) {
        this.y = y;
    };
    Chart.prototype.setWidth = function (width) {
        this.width = width - this.parent.right_padding;
    };
    Chart.prototype.setHeight = function (height) {
        this.height = height - this.bottom_padding;
    };
    Chart.prototype.updateSingleCandle = function (candle) {
        const ctx = this.ctx;
        const x = this.getX(candle.date);
        const yOpen = this.getY(candle.open);
        const yClose = this.getY(candle.close);
        const yHigh = this.getY(candle.high);
        const yLow = this.getY(candle.low);

        ctx.clearRect(x - 6, yHigh - 6, 12, yLow - yHigh + 15);
    
        // Визначаємо колір
        ctx.fillStyle = candle.close > candle.open ? "#57C580" : "#E57878";
        ctx.strokeStyle = ctx.fillStyle;
    
        // Малюємо тінь (хвіст)
        ctx.beginPath();
        ctx.moveTo(x, yHigh);
        ctx.lineTo(x, yLow);
        ctx.stroke();
    
        // Малюємо тіло свічки
        const candleWidth = 3;
        ctx.fillRect(x - candleWidth / 2, yOpen, candleWidth, yClose - yOpen);
    };
    
    
    
    Chart.prototype.shiftChart = function () {
        if (this.aData.length > 50) { // Обмежуємо кількість відображених свічок
            this.aData.shift();
        }
        this.setMinMaxTime(this.aData);
        this.setMinMaxAmount(this.aData);
        this.setDataCoords(this.aData);
        this.ctx.clearRect(0, 0, this.width, this.height); // Очищуємо перед перемальовкою
        this.renderCandles(this.aData);
    };
    Chart.prototype.addNewCandle = function (candle) {
        console.log("Adding new candle to chart", candle);
    
        this.setMinMaxTime(this.aData);
        this.setMinMaxAmount(this.aData);
        this.setDataCoords(this.aData);
    
        this.updateSingleCandle(candle);
    };
    Chart.prototype.buildDealDots = function () {
        for (var key in this.parent.deals) {
            if (this.parent.deals[key].status == 1)
                continue;
            var x_open = this.getX(this.parent.deals[key].createdAt);
            var y_open = this.getY(this.parent.deals[key].openPrice);
            var x_close = this.getX(this.parent.deals[key].expiredAt);
            var y_close = this.getY(this.parent.deals[key].closePrice);
            var color;
            if (this.parent.deals[key].status == 2) {
                color = 'green';
            }
            else if (this.parent.deals[key].status == 3) {
                color = 'red';
            }
            else if (this.parent.deals[key].status == 4) {
                color = 'orange';
            }
            //кружечек на открытие сделки
            this.ctx.save();
            if (this.parent.deals[key].position == 1) {
                this.ctx.fillStyle = "green";
            }
            else {
                this.ctx.fillStyle = "red";
            }
            this.ctx.beginPath();
            this.ctx.arc(this.x + x_open, this.y + y_open, 4, 0, 2 * Math.PI, false);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
            //линия от начала до конца сделки
            this.ctx.save();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = color;
            this.ctx.beginPath();
            this.ctx.moveTo(this.x + x_open + 0.5, this.y + y_open + 0.5);
            this.ctx.lineTo(this.x + x_close + 0.5, this.y + y_open + 0.5);
            this.ctx.lineTo(this.x + x_close + 0.5, this.y + y_close + 0.5);
            this.ctx.stroke();
            this.ctx.restore();
            //кружечек на сделке
            this.ctx.save();
            this.ctx.fillStyle = "red";
            this.ctx.beginPath();
            this.ctx.arc(this.x + x_close, this.y + y_close, 4, 0, 2 * Math.PI, false);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
        }
    };
    Chart.prototype.renderNormal = function (aData) {
        this.setMinMaxAmount(aData);
        this.setDataCoords(aData); //устанавливаем координаты
        this.buildTimeGrid(aData);
        this.buildAmountGrid();
        this.graficBackground();
        this.buildLines(aData);

        if (this.parent.activeDeals == false) {
            this.buildExpirationLines();
        }
        else {
            this.forms.betText();
            this.buildDeals();
        }
        this.drawCurrentPositionElement();
        this.currentPositionDot();
        this.forms.TimeToExpirate();
        if (this.hoverPut == true) {
            this.hover.buildPutField();
        }
        else if (this.hoverCall == true) {
            this.hover.buildCallField();
        }
        else {
            this.hover.clear();
        }
    };
    Chart.prototype.renderCandles = function (aData) {
        this.setMinMaxAmount(aData);
        this.setDataCoords(aData); 
        this.buildAmountGrid();
        this.buildTimeGrid(aData);
        this.buildCandles();
        if (this.parent.activeDeals == false) {
            this.buildExpirationLines();
        }
        else {
            this.forms.betText();
            this.buildDeals();
        }
        this.drawCurrentPositionElement();
        this.forms.TimeToExpirate();
        if (this.hoverPut == true) {
            this.hover.buildPutField();
        }
        else if (this.hoverCall == true) {
            this.hover.buildCallField();
        }
        else {
            this.hover.clear();
        }
    };
    Chart.prototype.buildPositions = function (amount, data) {
        var x, y;
        var middle_y = this.getY(amount);
        ;
        var start = this.min_time;
        var k = 0;
        while (start < this.max_time) {
            if (data[k].date < start) {
                k++;
                if (data[k] == undefined)
                    break;
                y = this.getY(data[k].amount);
            }
            if (data[k].amount * 1 < amount) {
                if (data[k - 1] != undefined && data[k - 1].amount * 1 <= data[k].amount * 1) {
                    this.ctx.fillStyle = 'red';
                }
                else {
                    this.ctx.fillStyle = 'green';
                }
            }
            else {
                if (data[k - 1] != undefined && data[k - 1].amount * 1 >= data[k].amount * 1) {
                    this.ctx.fillStyle = 'red';
                }
                else {
                    this.ctx.fillStyle = 'green';
                }
            }
            this.ctx.save();
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            x = this.getX(start);
            this.ctx.rect(this.x + x + 0.5, this.y + middle_y + 0.5, 6, y - middle_y);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
            start += 3;
        }
    };
    Chart.prototype.render = function (aData) {
        this.background();
        this.type = 'candles'
        this.setMinMaxTime(aData);
        this.countDigits(aData);
        if (aData) {
            switch (this.type) {
                case 'normal':
                    this.renderNormal(aData);
                    break;
                case 'candles':
                    this.renderCandles(aData);
                    break;
            }
        }
    };
    Chart.prototype.closeDeal = function (data) {
        if (!this.deals)
            return;
        for (var key in this.deals) { }
        if (data[key]) {
            this.parent.activeDeals = false;
            this.render();
        }
    };

    Chart.prototype.initializeWebSocket = function () {
        this.webSocketBridge = new ChartWebSocketBridge(this);
    };
    
    const originalChartConstructor = Chart;
    Chart = function(obj) {
        originalChartConstructor.call(this, obj);
        console.log("Initializing WebSocket Bridge for Chart instance");
        this.webSocketBridge = new ChartWebSocketBridge(this);
    };
    Chart.prototype = originalChartConstructor.prototype;

    return Chart;

    
}(ChartsMain));


