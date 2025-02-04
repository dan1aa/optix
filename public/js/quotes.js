///<reference path="./charts.ts"/>
var $;
//var canvas_width:number = 1800;
//var canvas_height:number = 800;
/*var canvas_width:number = 690;//690
var canvas_height:number = 450;*/
var Canvas = (function () {
    //constructor(block:string = 'canvas'){
    function Canvas(obj) {
        this.lang = 'ru';
        this.skin_name = 'light';
        this.activeDeals = false;
        this.seconds_left = 0;
        this.right_padding = 60;
        this.zoom_step = 60;
        this.zoom = 0;
        this.max_zoom = 0;
        this.indicators = {
            statusSMA: 0
        }; //ÐºÐ»Ð°ÑÑ Ð´Ð»Ñ Ñ€Ð°Ð±Ð¾Ñ‚Ñ‹ Ñ Ð¸Ð½Ð´Ð¸ÐºÐ°Ñ‚Ð¾Ñ€Ð°Ð¼Ð¸
        this.charts = [];
        this.deals = {}; //ÑÐ´ÐµÐ»ÐºÐ¸
        var block = obj.block;
        this.width = obj.width;
        this.height = obj.height;
        if (obj.lang != undefined) {
            this.lang = obj.lang;
        }
        if (obj.skin != undefined) {
            this.skin_name = obj.skin;
        }
        this.createCanvasElement(block);
        this.init(block);
    }
    Canvas.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.ws.width, this.ws.height);
    };
    Canvas.prototype.resize = function (width, height) {
        this.width = width;
        this.height = height;
        //this.ws.width = this.width;
        //this.ws.height = this.height;
        $('#canvas #grafic').attr('width', (width + this.right_padding) + 'px').attr('height', (height + 40) + 'px');
        $('#canvas #bets').attr('width', (width + this.right_padding) + 'px').attr('height', (height + 40) + 'px');
        ;
        $('#canvas #mouse').attr('width', (width + this.right_padding) + 'px').attr('height', (height + 40) + 'px');
        ;
        for (var key in this.charts) {
            this.charts[key].width = this.width;
            this.charts[key].height = this.height;
        }
    };
    Canvas.prototype.render = function () {
        if (this.data == undefined)
            return;
        this.getMaxZoom();
        this.clear();
        this.setExpirationTime();
        for (var key in this.charts)
            this.charts[key].render();
    };
    Canvas.prototype.init = function (block) {
        this.ws = $('#grafic', '#' + block)[0];
        this.ctx = this.ws.getContext('2d');
        this.ws.width = this.width;
        this.ws.height = this.height;
        this.initZoom();
        this.charts.push(new Chart({
            type: 'normal',
            skin: this.skin_name,
            x: 0,
            y: 0,
            width: this.width,
            height: this.height,
            context: this.ctx,
            parent: this
        }));
    };
    Canvas.prototype.initZoom = function () {
        var self = this;
        $('#canvas')[0].addEventListener("mousewheel", function (e) {
            //e.detail < 0 ? self.zoomUp():self.zoomDown();
            e.deltaY < 0 ? self.zoomUp() : self.zoomDown();
            e.preventDefault();
        }, false);
        $('#canvas')[0].addEventListener("DOMMouseScroll", function (e) {
            e.detail < 0 ? self.zoomUp() : self.zoomDown();
            e.preventDefault();
        }, false);
    };
    Canvas.prototype.setZoom = function (zoom) {
        this.zoom = zoom;
        this.render();
    };
    Canvas.prototype.zoomUp = function () {
        if (this.max_zoom == this.zoom)
            return;
        this.zoom++;
        this.render();
    };
    Canvas.prototype.zoomDown = function () {
        this.zoom--;
        if (this.zoom < 0) {
            this.zoom = 0;
        }
        this.render();
    };
    Canvas.prototype.getMaxZoom = function () {
        if (!this.data[0])
            return;
        var start = this.data[0].date;
        var end = this.data[this.data.length - 1].date;
        this.max_zoom = Math.ceil((end - start) / this.zoom_step);
    };
    Canvas.prototype.changeToCandlesView = function () {
        this.charts[0].type = 'candles';
        this.render();
    };
    Canvas.prototype.changeToNormalView = function () {
        this.charts[0].type = 'normal';
        this.render();
    };
    Canvas.prototype.setAlligatorIndicator = function (jaw, teeth, lips) {
        this.charts[0].indicators.statusAlligator = true;
        this.charts[0].indicators.alligatorJaw = jaw;
        this.charts[0].indicators.alligatorTeeth = teeth;
        this.charts[0].indicators.alligatorLips = lips;
        this.render();
    };
    Canvas.prototype.startAlligatorIndicator = function () {
        this.charts[0].indicators.statusAlligator = true;
        this.render();
    };
    Canvas.prototype.stopAlligatorIndicator = function () {
        this.charts[0].indicators.statusAlligator = false;
        this.render();
    };
    Canvas.prototype.setBolingerIndicator = function (period, deviation, colors) {
        this.charts[0].indicators.periodBolinger = period;
        this.charts[0].indicators.deviationBolinger = deviation;
        this.charts[0].indicators.colorsBolinger = colors;
        this.charts[0].indicators.statusBolinger = true;
        this.charts[0].render();
    };
    Canvas.prototype.startBolingerIndicator = function () {
        this.charts[0].indicators.statusBolinger = true;
        this.render();
    };
    Canvas.prototype.stopBolingerIndicator = function () {
        this.charts[0].indicators.statusBolinger = false;
        this.render();
    };
    Canvas.prototype.setMACDIndicator = function (fast, slow, period) {
        this.charts[0].setY(0);
        this.charts[0].setX(0);
        this.charts[0].setHeight(this.height / 2);
        this.charts[1] = new Chart({
            type: 'macd',
            skin: 'dark',
            x: 0,
            y: this.height / 2,
            width: this.width,
            height: this.height / 2,
            context: this.ctx,
            data: this.data,
            time: this.serverTime,
            parent: this
        });
        this.render();
    };
    Canvas.prototype.startMACDindicator = function () {
        this.charts[0].setY(0);
        this.charts[0].setX(0);
        this.charts[0].setHeight(this.height / 2);
        this.charts[1] = new Chart({
            type: 'macd',
            skin: 'dark',
            x: 0,
            y: this.height / 2,
            width: this.width,
            height: this.height / 2,
            context: this.ctx,
            data: this.data,
            time: this.serverTime,
            parent: this
        });
        this.render();
    };
    Canvas.prototype.stopMACDindicator = function () {
        this.charts[0].setY(0);
        this.charts[0].setX(0);
        this.charts[0].setHeight(this.height);
        this.charts[1].mouse.stop();
        //this.charts[1].delete();
        delete (this.charts[1]);
        this.render();
    };
    Canvas.prototype.setRSIindicator = function (period, overbought, oversold) {
        this.charts[0].setY(0);
        this.charts[0].setX(0);
        this.charts[0].setHeight(this.height / 2);
        this.charts[1] = new Chart({
            type: 'rsi',
            skin: 'dark',
            x: 0,
            y: this.height / 2,
            width: this.width,
            height: this.height / 2,
            context: this.ctx,
            data: this.data,
            time: this.serverTime,
            parent: this
        });
        this.charts[1].indicators.periodRSI = period;
        this.charts[1].indicators.overboughtRSI = overbought;
        this.charts[1].indicators.oversoldRSI = oversold;
        this.render();
    };
    Canvas.prototype.startRSIindicator = function () {
        this.charts[0].setY(0);
        this.charts[0].setX(0);
        this.charts[0].setHeight(this.height / 2);
        this.charts[1] = new Chart({
            type: 'rsi',
            skin: 'dark',
            x: 0,
            y: this.height / 2,
            width: this.width,
            height: this.height / 2,
            context: this.ctx,
            data: this.data,
            time: this.serverTime,
            parent: this
        });
        this.render();
    };
    Canvas.prototype.stopRSIindicator = function () {
        this.charts[0].setY(0);
        this.charts[0].setX(0);
        this.charts[0].setHeight(this.height);
        this.charts[1].mouse.stop();
        //this.charts[1].delete();
        delete (this.charts[1]);
        this.render();
    };
    Canvas.prototype.startSMAindicator = function () {
        this.charts[0].indicators.statusSampleSMA = true;
        this.render();
    };
    Canvas.prototype.stopSMAindicator = function () {
        this.charts[0].indicators.statusSampleSMA = false;
        this.render();
    };
    Canvas.prototype.setSMAindicator = function (period, color) {
        if (color != undefined) {
            this.charts[0].indicators.colorSMA = color;
        }
        this.charts[0].indicators.statusSampleSMA = true;
        ;
        this.charts[0].indicators.periodSMA = period;
        //this.indicators.statusSMA = 1;
        //this.charts[0].periodSMA = period;
        this.render();
    };
    Canvas.prototype.setPutOnHover = function () {
        for (var key in this.charts) {
            this.charts[key].hoverPut = true;
            this.charts[key].render();
        }
    };
    Canvas.prototype.setCallOnHover = function () {
        for (var key in this.charts) {
            this.charts[key].hoverCall = true;
            this.charts[key].render();
        }
    };
    Canvas.prototype.unsetOnHover = function () {
        for (var key in this.charts) {
            this.charts[key].hoverPut = false;
            this.charts[key].hoverCall = false;
            this.charts[key].render();
        }
    };
    Canvas.prototype.digitFix = function (data) {
        var total = 0;
        var length = 0;
        for (var key in data) {
            total += this.countDigits(data[key]);
            length++;
        }
        return Math.ceil(total / length);
    };
    Canvas.prototype.setExpirationTime = function () {
        if (this.activeDeals == false) {
            //Ð¾Ð¿Ñ€ÐµÐ´ÐµÐ»ÑÐµÐ¼ Ð³Ñ€Ð°Ð½Ð¸Ñ†Ñ‹ Ð·Ð°Ð²ÐµÑ€Ñ‰ÐµÐ½Ð¸Ñ ÑÑ‚Ð°Ð²ÐºÐ¸ Ð¸ Ð·Ð°Ð²ÐµÑ€ÑˆÐµÐ½Ð¸Ðµ Ð¿Ð¾ÐºÑƒÐ¿ÐºÐ¸ ÑÑ‚Ð°Ð²ÐºÐ¸
            var d = new Date(this.serverTime * 1000);
            var seconds = d.getSeconds();
            if (seconds < 30) {
                d.setSeconds(0);
                this.end_expiration = Math.floor(d.getTime() / 1000) + 60;
                this.stop_expiration = this.end_expiration - 30;
            }
            else {
                d.setSeconds(0);
                this.end_expiration = Math.floor(d.getTime() / 1000) + 120;
                this.stop_expiration = this.end_expiration - 30;
            }
        }
        else {
            for (var key in this.deals) { }
            this.end_expiration = parseInt(this.deals[key].closetime);
        }
    };
    Canvas.prototype.getSecondsLeft = function () {
        var position_time;
        if (this.activeDeals) {
            for (var key in this.deals)
                var deal = this.deals[key];
            position_time = deal.closetime;
        }
        else {
            position_time = this.stop_expiration;
        }
        ///var x = (position_time - this.parent.min_time)*this.parent.time_coef; 
        if (!position_time || !this.serverTime)
            return;
        this.seconds_left = position_time - this.serverTime;
    };
    Canvas.prototype.countDigits = function (amount) {
        var string = amount.toString();
        var total = string.length; //ÑÑ‡Ð¸Ñ‚Ð°ÐµÐ¼ Ð²ÑÐµÐ³Ð¾ ÑÐ¸Ð¼Ð²Ð¾Ð»
        var integer = (parseInt(string)).toString().length; //ÑÑ‡Ð¸Ñ‚Ð°ÐµÐ¼ Ð²ÑÐµÐ³Ð¾ ÑÐ¸Ð¼Ð²Ð¾Ð»
        var digits = total - integer - 1;
        if (digits <= 0) {
            digits = 0;
        }
        return digits;
    };
    Canvas.prototype.updateBalance = function (amount) {
        $('#personal .balance').text('$' + (amount / 100).toFixed(2));
    };
    Canvas.prototype.onCreateOption = function (json) {
        if (json.status == 'error') {
            console.log(json.msg);
            return;
        }
        this.updateBalance(json.balance);
        this.incomeDeal(json);
        this.render();
    };
    Canvas.prototype.onCloseOption = function (json) {
        for (var key in json.deals) {
            this.updateBalance(json.deals[key].balance);
        }
        if (!this.deals)
            return;
        for (var key in this.deals) { }
        if (json.deals[key]) {
            this.activeDeals = false;
        }
        this.render();
        //for (var key in this.charts) this.charts[key].onCloseOption(json);
    };
    Canvas.prototype.addPosition = function (element) {
        for (var key in this.charts)
            this.charts[key].newAsset = element;
        //this.setExpirationTime();
        //this.charts.render();
        this.render();
    };
    Canvas.prototype.pushDealsToData = function (deals, data) {
        for (var key in deals) {
            for (var key2 in data) {
                if (data[key2].date > deals[key].opentime) {
                    data.splice(key2, 0, { "amount": deals[key].openprice, "date": deals[key].opentime });
                    break;
                }
            }
        }
        return data;
    };
    Canvas.prototype.addData = function (json) {
        var count = this.digitFix(json.data);
        var arr = new Array();
        //this.setTraderChoice(json.tradersChoice);
        for (var key in json.data) {
            var obj = new Object();
            obj.amount = json.data[key].toFixed(count);
            obj.date = parseInt(key);
            arr.push(obj);
        }
        if (!arr)
            return;
        this.deals = null; ///Ð¾Ð±Ð½ÑƒÐ»ÑÐµÐ¼ ÑÐ´ÐµÐ»ÐºÐ¸ Ð¿Ñ€Ð¾ÑˆÐ»Ð¾Ð³Ð¾ Ð°ÑÑÐµÑ‚Ð°
        this.activeDeals = false;
        if (json.deals)
            this.deals = json.deals;
        //Ð²ÑÑ‚Ð°Ð²Ð»ÑÐµÐ¼ Ð² Ð´Ð¸Ð»ÑÑ‹
        arr = this.pushDealsToData(this.deals, arr);
        this.data = arr;
        for (var key in this.charts)
            this.charts[key].newAsset = null;
        this.checkActiveDeal();
        //this.setExpirationTime();        
        //for(var key in this.charts)this.charts[key].addData(this.data,json.deals);
        this.render();
        //this.initZoom();
    };
    Canvas.prototype.checkActiveDeal = function () {
        if (!this.deals)
            return;
        for (var key in this.deals) { }
        if (this.deals[key].closetime > this.serverTime) {
            this.activeDeals = true;
        }
    };
    Canvas.prototype.incomeDeal = function (data) {
        if (!this.deals)
            this.deals = new Object();
        this.deals[data.id] = data;
        this.data.push({ 'amount': data.openprice, 'date': data.opentime });
        this.activeDeals = true;
    };
    Canvas.prototype.syncTime = function (time) {
        this.serverTime = parseInt(time);
        this.getSecondsLeft();
        for (var key in this.charts) {
            var d = new Date(this.end_expiration * 1000);
            //var d = new Date(this.charts[key].end_expiration * 1000);
            var hours = d.getHours();
            hours = hours < 10 ? '0' + hours : hours;
            var minutes = d.getMinutes();
            minutes = minutes < 10 ? '0' + minutes : minutes;
            $('.time_to_end').text(hours + ':' + minutes);
        }
        this.render();
    };
    Canvas.prototype.createCanvasElement = function (block) {
        $("#" + block).html('<canvas style="width:100%;position:absolute;height:100%;z-index:3" id="mouse"></canvas>'
            + '<canvas style="width:100%;position:absolute; left:0px;top:0px; height:100%;z-index:2" id="bets"></canvas>'
            + '<canvas style="width:100%;height:100%;position:absolute;z-index:1;left:0px;" id="grafic"></canvas>');
    };
    return Canvas;
}());