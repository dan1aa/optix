///<reference path="./charts.ts"/>
var $;
var Canvas = (function () {
    function Canvas(obj) {
        this.lang = 'ru';
        this.skin_name = 'light';
        this.activeDeals = false;
        this.seconds_left = 0;
        this.right_padding = 60;
        this.zoom_step = 60;
        this.zoom = 0;
        this.max_zoom = 0;
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
            this.charts[key].render(this.charts[0].aData);
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
    Canvas.prototype.setPutOnHover = function () {
        console.log(this.charts[0].aData)
        for (var key in this.charts) {
            this.charts[key].hoverPut = true;
            this.charts[key].render(this.charts[0].aData);
        }
    };
    Canvas.prototype.setCallOnHover = function () {
        for (var key in this.charts) {
            this.charts[key].hoverCall = true;
            this.charts[key].render(this.charts[0].aData);
        }
    };
    Canvas.prototype.unsetOnHover = function () {
        for (var key in this.charts) {
            this.charts[key].hoverPut = false;
            this.charts[key].hoverCall = false;
            this.charts[key].render(this.charts[0].aData);
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
            this.end_expiration = parseInt(this.deals[key].expiredAt);
        }
    };
    Canvas.prototype.getSecondsLeft = function () {
        // Отримуємо поточний час
        var now = new Date();
        var seconds = now.getSeconds();
        var targetTime = 30; // півхвилини (30 секунд)
    
        // Якщо зараз більше ніж 30 секунд, ми маємо порахувати залишок до наступної півхвилини
        if (seconds >= targetTime) {
            this.seconds_left = 60 - seconds + targetTime; // залишок до наступної півхвилини
        } else {
            this.seconds_left = targetTime - seconds; // залишок до поточної півхвилини
        }
    
        return this.seconds_left;
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
        $('#personal .balance').text('$' + (amount).toFixed(2));
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
        this.updateBalance(json.balance);
        console.log(this.deals)
        if (!this.deals)
            return;
        for (var key in this.deals) { }
        this.activeDeals = false;
        this.render();
        //for (var key in this.charts) this.charts[key].onCloseOption(json);
    };
    Canvas.prototype.addPosition = function (element) {
        console.log(1)
        for (var key in this.charts)
            this.charts[key].newAsset = element;
        this.setExpirationTime();
        this.render();
    };
    Canvas.prototype.pushDealsToData = function (deals, data) {
        for (var key in deals) {
            for (var key2 in data) {
                if (data[key2].date > deals[key].createdAt) {
                    data.splice(key2, 0, { "amount": deals[key].openPrice, "date": deals[key].createdAt });
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
        this.render();
        //this.initZoom();
    };
    Canvas.prototype.checkActiveDeal = function () {
        if (!this.deals)
            return;
        for (var key in this.deals) { }
        if (this.deals[key].expiredAt > this.serverTime) {
            this.activeDeals = true;
        }
    };
    Canvas.prototype.incomeDeal = function (data) {
        if (!this.deals)
            this.deals = [];
        this.deals[data.id] = data;
        if (!this.data) this.data = [];
        this.data.push({ 'amount': data.openPrice, 'date': data.createdAt });
        this.activeDeals = true;
    };
    Canvas.prototype.syncTime = function (time) {
        this.serverTime = parseInt(time);
        this.getSecondsLeft();
        for (var key in this.charts) {
            var d = new Date(this.end_expiration * 1000);
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