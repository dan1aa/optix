var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path="./chartsMain.ts"/>
///<reference path="./service.ts"/>
var Chart = (function (_super) {
    __extends(Chart, _super);
    //statusSampleSMA: boolean = false;
    function Chart(obj) {
        _super.call(this);
        this.hoverPut = false;
        this.hoverCall = false;
        this.deleted = false;
        this.setParams(obj);
        //this.initZoom();
        this.hover = new Hover(this);
        this.forms = new Forms(this);
        this.mouse = new Mouse(this);
        this.indicators = new Indicators(this, this.ctx);
        //if(this.data != undefined)this.render();
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
            //console.log(this.parent.deals[key]);
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
        //this.buildDealDots();
        //Indicators
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
    Chart.prototype.renderCandles = function () {
        this.setMinMaxAmount(this.aData);
        this.setDataCoords(this.aData); //устанавливаем координаты
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
        //this.buildLines(); 
        //переопределяем
        //this.setMinMaxAmount(this.data);
        var amount = this.getAVGAmount(this.aData);
        this.drawAVGLine(amount);
        this.buildPositions(amount, this.aData);
        this.buildTimeGrid();
        /*this.setDataCoords(this.aData); //устанавливаем координаты
        //this.buildLines();
        
        //this.buildAmountGrid();
        
        var data = this.indicators.sampleSMA();
        this.indicators.buildRSILines(data);
        
        this.forms.TimeToExpirate();*/
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
            //this.ctx.stroke();
            this.ctx.restore();
            start += 3;
        }
    };
    Chart.prototype.render = function () {
        this.aData = this.generateAData(this.parent.data);
		if(this.aData == undefined)return; 
		if(this.aData.length == 0) return;
        //this.getMaxZoom();
        this.background();
        this.setMinMaxTime(this.aData);
        //this.setDataCoords(this.aData); //устанавливаем координаты
        this.countDigits(this.aData); //считаем знаки после запятой
        switch (this.type) {
            case 'normal':
                this.renderNormal();
                break;
            case 'candles':
                this.renderCandles();
                break;
            case 'macd':
                this.renderMACD();
                break;
            case 'rsi':
                this.renderRSI();
                break;
        }
        /*
        this.checkIndicators();

        */
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
    /*updateBalance(amount){
        $('.header-nav .balance').text('$'+(amount/100).toFixed(2));
    }*/
    Chart.prototype.onCloseOption = function (json) {
        /*for(var key in json.deals){
            //this.updateBalance(json.deals[key].balance);

            $('.bid_history .element[data-id='+key+'] .expire').remove();
            if(json.deals[key].status == 2){
                $('.bid_history .element[data-id='+key+']').addClass('win');
                $('.bid_history .element[data-id='+key+'] .bottom .price').text('+ $'+(json.deals[key].win_amount/100).toFixed(2));
            }else if(json.deals[key].status == 3){
                $('.bid_history .element[data-id='+key+']').addClass('lose');
                $('.bid_history .element[data-id='+key+'] .bottom .price').text('- $'+(json.deals[key].amount/100).toFixed(2));
            }else if(json.deals[key].status == 4){
                $('.bid_history .element[data-id='+key+'] .bottom .price').text('+ $'+(json.deals[key].amount/100).toFixed(2));
            }
        }
        */
        //        this.closeDeal(json.deals);
    };
    Chart.prototype.onCreateOption = function (json) {
        /*if(json.status == 'error'){ //если ошибка
            //this.optionError(json.id);
            return false;
        }else{
            $('.trading aside .error').empty();
        }*/
        //this.updateBalance(json.balance);
        //$('.page .page-container').animate({"padding-top":'182px'},400);
        //$('.bid_history .last_deals').animate({"height":'65px'},400);
        //this.incomeDeal(json);
        /*var d:any = new Date(json.opentime*1000);
        var month:any = d.getMonth()+1;
        month = month < 10?'0'+month:month;
        var year:any = d.getYear()+1900;
        var minutes:any = d.getMinutes();
        minutes = minutes < 10?'0'+minutes:minutes;
        var seconds:any = d.getSeconds();
        seconds = seconds < 10?'0'+seconds:seconds;
        var time = month+'-'+year+' '+minutes+':'+seconds;

        var asset = $('#asset_list li[data-id='+json.quote_id+'] .name').text();
        var position = json.position == 1?'up':'down';
        var amount = (json.amount/100).toFixed(2);

        var expire = json.closetime - this.parent.serverTime;

        $('.bid_history .last_deals').prepend(
            '<div class="element" data-id="'+json.id+'">'
                +'<div class="content">'
                    +'<div class="date">'+time+'</div>'
                    +'<div class="expire">'+expire+'</div>'
                    +'<div class="bottom">'
                        +'<div class="quote">'+asset+'<div class="icon '+position+'_arr"></div></div>'
                        +'<div class="price">$'+amount+'</div>'
                    +'</div>'
                +'</div>'
                +'<div class="tail"></div>'
            +'</div>'
        );*/
    };
    return Chart;
}(ChartsMain));
