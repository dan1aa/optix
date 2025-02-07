var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path="./chartsMain.ts"/>
///<reference path="./service.ts"/>
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
        this.indicators = new Indicators(this, this.ctx);
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

        if (this.indicators.statusBolinger == true)
            this.indicators.bolingerBands();
        if (this.indicators.statusSampleSMA == true)
            this.indicators.sampleSMA();
        if (this.indicators.statusAlligator == true)
            this.indicators.alligator();
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
        this.setDataCoords(aData); //устанавливаем координаты
        this.buildAmountGrid();
        this.buildTimeGrid();
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
    Chart.prototype.renderMACD = function () {
        this.setMinMaxAmount(this.aData);
        this.setDataCoords(this.aData); //устанавливаем координаты
        this.buildTimeGrid();
        var amount = this.getAVGAmount(this.aData);
        this.drawAVGLine(amount);
        this.buildPositions(amount, this.aData);
        this.buildTimeGrid();
    };
    Chart.prototype.renderRSI = function () {
        //переопределяем
        this.setMinMaxAmount(this.parent.data);
        this.setDataCoords(this.aData); //устанавливаем координаты
        this.buildTimeGrid();
        var data = this.indicators.sampleSMA(this.indicators.colorSMA, this.indicators.periodRSI);
        this.indicators.buildRSILines(data);
    };
    Chart.prototype.getAVGAmount = function (data) {
        var sum = 0;
        var cnt = 0;
        for (var key in data) {
            sum += data[key].amount * 1;
            cnt++;
        }
        var avg = sum / cnt;
        return avg;
    };
    Chart.prototype.drawAVGLine = function (amount) {
        var y = this.getY(amount);
        //рисуем отметки 
        //ВЕРХНЯЯ ПОЗИЦИЯ
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.skin.amountStripesColor;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x + 0.5, this.y + y + 0.5);
        this.ctx.lineTo(this.x + this.width + 0.5 + 5, this.y + y + 0.5);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.restore();
        //надпись
        this.ctx.save();
        this.ctx.fillStyle = this.skin.amountTextColor;
        this.ctx.font = "normal 12px Tahoma";
        var text = amount;
        this.ctx.textAlign = "left";
        this.ctx.fillText(text, this.x + this.width + 0.5 + 7, this.y + y + 0.5 + 4);
        this.ctx.restore();
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
        console.log('RENDER', aData);
        
        // Якщо aData не передано або воно порожнє, вийдемо з функції
        if (!aData || aData.length === 0) return;
    
        this.aData = aData;  // Якщо потрібно, можна присвоїти значення в this.aData
    
        this.background();
        this.setMinMaxTime(this.aData);
        // this.countDigits(this.aData); // Считаем знаки после запятой
        this.type = 'candles'
        switch (this.type) {
            case 'normal':
                this.renderNormal();
                break;
            case 'candles':
                this.renderCandles(this.aData);
                break;
            case 'macd':
                this.renderMACD();
                break;
            case 'rsi':
                this.renderRSI();
                break;
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
