(function () {
    class KrakenWebSocket {
        constructor(pair = "ETH/USD", interval = 1) {
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

        // 🔄 Зміна торгової пари (чекаємо закриття сокета перед перепідключенням)
        setPair(newPair) {
            if (this.pair === newPair) return;
            this.pair = newPair;

            if (this.socket) {
                this.socket.onclose = () => {
                    console.log(`🔄 Переключаюсь на нову пару: ${newPair}`);
                    this.connect();
                };
                this.socket.close();
            } else {
                this.connect();
            }
        }
    }

    window.krakenWS = new KrakenWebSocket();
    
})();

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
    Chart.prototype.buildDealDots = function () {
        for (var key in this.parent.deals) {
            if (this.parent.deals[key].status == 1)
                continue;
            var x_open = this.getX(this.parent.deals[key].opentime);
            var y_open = this.getY(this.parent.deals[key].openprice);
            var x_close = this.getX(this.parent.deals[key].closetime);
            var y_close = this.getY(this.parent.deals[key].closeprice);
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
    Chart.prototype.renderNormal = function () {
        this.setMinMaxAmount(this.aData);
        this.setDataCoords(this.aData); //устанавливаем координаты
        this.buildTimeGrid();
        this.buildAmountGrid();
        this.graficBackground();
        this.buildLines();

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
        this.buildCandles(aData);
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
    Chart.prototype.render = function (aData, type) {
        this.background();
        this.type = 'candles'
        this.setMinMaxTime(aData);
        this.countDigits(aData); // Считаем знаки после запятой
        if (aData) {
            switch (this.type) {
                case 'normal':
                    this.renderNormal();
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

    Chart.prototype.onCloseOption = function (json) {

    };
    Chart.prototype.onCreateOption = function (json) {
        
    };
    return Chart;
}(ChartsMain));
