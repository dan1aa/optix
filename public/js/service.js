var Forms = (function () {
    function Forms(parent) {
        this.parent = parent;
        this.local = Local[this.parent.parent.lang];
        this.ws = parent.ctx;
        this.ctx = parent.ctx;
        this.initImages();
    }
    Forms.prototype.initImages = function () {
        this.clock_blue = new Image(); //часики на таймере
        this.clock_blue.src = '/images/clock_blue.png';
    };
    Forms.prototype.betText = function () {
        if (!this.parent.parent.deals)
            return false;
        for (var key in this.parent.parent.deals) { }
        var deal = this.parent.parent.deals[key];
        var amount = deal.amount;
        var profit = (((amount / 100) * 76 + amount) / 100).toFixed(2);
        amount = (amount / 100).toFixed(2);
        var x = 50.5;
        var y = 50.5;
        //сумма ставки
        this.ctx.save();
        this.ctx.fillStyle = '#a39f9f';
        this.ctx.font = "normal 22px Tahoma";
        var length = this.ctx.measureText('$' + profit);
        var width = length.width + 5;
        var text = '$' + amount;
        this.ctx.textAlign = "left";
        this.ctx.fillText(text, this.parent.x + x, this.parent.y + y);
        this.ctx.restore();
        //label
        this.ctx.save();
        this.ctx.fillStyle = '#a39f9f';
        this.ctx.font = "normal 13px Tahoma";
        var text = this.local.total;
        this.ctx.textAlign = "left";
        this.ctx.fillText(text, x + width, y - 10);
        var text = this.local.investments;
        this.ctx.fillText(text, x + this.parent.x + width, this.parent.y + y + 4);
        this.ctx.restore();
        //сумма ожидаемой прибыли
        this.ctx.save();
        this.ctx.fillStyle = '#a39f9f';
        this.ctx.font = "normal 22px Tahoma";
        var text = '$' + profit;
        this.ctx.textAlign = "left";
        this.ctx.fillText(text, x + this.parent.y, y + this.parent.y + 35);
        this.ctx.restore();
        //label
        this.ctx.save();
        this.ctx.fillStyle = '#a39f9f';
        this.ctx.font = "normal 13px Tahoma";
        var textstring = this.local.expected;
        this.ctx.textAlign = "left";
        this.ctx.fillText(text, x + this.parent.x + width, y + this.parent.y - 10 + 35);
        var text = this.local.profit;
        this.ctx.fillText(text, x + this.parent.x + width, y + this.parent.y + 4 + 35);
        this.ctx.restore();
    };
    Forms.prototype.TimeToExpirate = function () {
        var position_time;
        if (this.parent.parent.activeDeals && this.parent.parent.deals) {
            //получаем поеследнюю сделку
            for (var key in this.parent.parent.deals)
                var deal = this.parent.parent.deals[key];
            position_time = deal.closetime;
        }
        else {
            position_time = this.parent.parent.stop_expiration;
        }
        //var position_time = this.parent.parent.stop_expiration;
        var x = (position_time - this.parent.min_time) * this.parent.time_coef;
        if (!position_time || !this.parent.parent.serverTime)
            return;
        //var seconds:any = position_time - this.parent.serverTime;
        var seconds = this.parent.parent.seconds_left;
        var minutes = Math.floor(seconds / 60);
        //this.parent.seconds_left = seconds;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds - (minutes * 60);
        seconds = seconds < 10 ? '0' + seconds : seconds;
        var width = 190;
        var height = 60;
        var padding_top = 20;
        var padding_right = 10;
        this.ctx.save();
        this.ctx.translate(this.parent.x + x - width - padding_right, this.parent.y + 0.5);
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = this.parent.skin.expirationFormBackgroundColor;
        this.ctx.rect(0.5, padding_top, width, height);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
        this.ctx.save();
        this.ctx.translate(this.parent.x + x - width - padding_right, this.parent.y + 0.5);
        this.ctx.fillStyle = this.parent.skin.expirationFormTextColor;
        this.ctx.font = "bold 22px Tahoma";
        var text = minutes + ':' + seconds;
        this.ctx.textAlign = "left";
        this.ctx.fillText(text, 70 + 0.5, 47);
        this.ctx.restore();
        this.ctx.save();
        this.ctx.translate(this.parent.x + x - width - padding_right, this.parent.y + 0.5);
        this.ctx.fillStyle = this.parent.skin.expirationFormTextColor;
        this.ctx.font = "bold 12px Tahoma";
        //var text = deal ? this.local[this.localisation].timeToClose : this.local[this.localisation].timeToBie;
        var text = this.local.timetoexpirate;
        this.ctx.textAlign = "left";
        this.ctx.fillText(text, 15 + 0.5, 67);
        this.ctx.restore();
        this.ctx.save();
        this.ctx.translate(this.parent.x + x - width - padding_right, this.parent.y + 0.5);
        this.ctx.drawImage(this.clock_blue, width - 40, 33);
        this.ctx.restore();
    };
    return Forms;
}());
var Mouse = (function () {
    function Mouse(parent) {
        this.unbind = false;
        this.parent = parent;
        this.ws = $('canvas#mouse')[0];
        this.ctx = this.ws.getContext('2d');
        this.ws.width = this.parent.parent.width;
        this.ws.height = this.parent.parent.height;
        var self = this;
        $('canvas#mouse').mousemove(function (e) {
            var rect = $('canvas#mouse')[0].getBoundingClientRect();
            self.offsetX = rect.x;
            self.offsetY = rect.y;
            if (self.unbind == true)
                return;
            //canvas_width
            self.x_coef = self.ws.width / $('canvas#mouse').width();
            self.y_coef = self.ws.height / $('canvas#mouse').height();
            if (e.layerX) {
                self.mouse_x = e.layerX - self.offsetX;
                self.mouse_y = e.layerY - self.offsetY;
            }
            else {
                self.mouse_x = e.clientX - self.offsetX;
                self.mouse_y = e.clientY - self.offsetY;
            }
            self.mouse_x *= self.x_coef;
            self.mouse_y *= self.y_coef;
            $('#y_offset').val(self.offsetY);
            $('#y_pos').val(self.mouse_y);
            var length1 = Math.sqrt(Math.pow((self.parent.x - self.mouse_x), 2) + Math.pow((self.parent.y - self.mouse_y), 2));
            var length2 = Math.sqrt(Math.pow((self.parent.x - self.parent.x), 2) + Math.pow((self.parent.y + self.parent.height + self.parent.bottom_padding - self.mouse_y), 2));
            //проверяем или мы над своим графиком
            if ((self.mouse_x > self.parent.x && length1 < self.parent.width + self.parent.parent.right_padding) && (self.mouse_y < (self.parent.y + self.parent.height + self.parent.bottom_padding) && (self.parent.height + self.parent.bottom_padding > length2))) {
                self.drawMousePositionLines();
            }
        });
    }
    Mouse.prototype.stop = function () {
        this.unbind = true;
    };
    Mouse.prototype.drawMousePositionLines = function () {
        if (this.mouse_y > this.parent.y + this.parent.height)
            return;
        if (this.mouse_x > this.parent.x + this.parent.width)
            return;
        this.ctx.clearRect(0, 0, this.ws.width, this.ws.height);
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.parent.skin.mousePositionLineColor;
        this.ctx.beginPath();
        this.ctx.moveTo(this.mouse_x + 0.5, this.parent.y);
        this.ctx.lineTo(this.mouse_x + 0.5, this.parent.y + this.parent.height);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(this.parent.x, this.mouse_y + 0.5);
        this.ctx.lineTo(this.parent.x + this.parent.width + 0.5, this.mouse_y + 0.5);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.restore();
        this.drawPositionAmount();
        this.drawPositionTime();
    };
    Mouse.prototype.drawPositionTime = function () {
        var width = 60;
        var height = 16;
        var margin_top = 8;
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.parent.skin.timePositionBlockBorderColor;
        this.ctx.fillStyle = this.parent.skin.timePositionBlockBackgroundColor;
        this.ctx.beginPath();
        this.ctx.moveTo(this.mouse_x + 0.5 - (width / 2), this.parent.height + this.parent.y + 0.5 + margin_top);
        this.ctx.lineTo(this.mouse_x + 0.5 + (width / 2), this.parent.height + this.parent.y + 0.5 + margin_top);
        this.ctx.lineTo(this.mouse_x + 0.5 + (width / 2), this.parent.height + this.parent.y + 0.5 + margin_top + height);
        this.ctx.lineTo(this.mouse_x + 0.5 - (width / 2), this.parent.height + this.parent.y + 0.5 + margin_top + height);
        this.ctx.lineTo(this.mouse_x + 0.5 - (width / 2), this.parent.height + this.parent.y + 0.5 + margin_top);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.restore();
        var time = Math.floor((this.mouse_x - this.parent.x) / this.parent.time_coef) + Math.floor(this.parent.min_time);
        var d = new Date(time * 1000);
        var hours = d.getHours();
        hours = hours < 10 ? '0' + hours : hours;
        var minutes = d.getMinutes();
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var seconds = d.getSeconds();
        seconds = seconds < 10 ? '0' + seconds : seconds;
        //пишем текст в значение стрелочки
        this.ctx.save();
        this.ctx.fillStyle = this.parent.skin.timePositionTextColor;
        this.ctx.font = "bold 11px Tahoma";
        var text = hours + ':' + minutes + ':' + seconds;
        var length = this.ctx.measureText(text);
        //text = text.toFixed(this.parent.grafic.digits);
        this.ctx.textAlign = "left";
        this.ctx.fillText(text, this.mouse_x + 0.5 - length.width / 2, this.parent.height + this.parent.y + 0.5 + margin_top + 11);
        this.ctx.restore();
    };
    Mouse.prototype.drawPositionAmount = function () {
        var width = 50;
        var height = 14;
        var arrow = 10;
        var start_x = this.parent.width + this.parent.x - arrow;
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.parent.skin.amountPositionBlockBorderColor;
        this.ctx.fillStyle = this.parent.skin.amountPositionBlockBackgroundColor;
        this.ctx.beginPath();
        this.ctx.moveTo(start_x, this.mouse_y);
        this.ctx.lineTo(start_x + arrow, this.mouse_y - height / 2);
        this.ctx.lineTo(start_x + arrow + width, this.mouse_y - height / 2);
        this.ctx.lineTo(start_x + arrow + width, this.mouse_y + height / 2);
        this.ctx.lineTo(start_x + arrow, this.mouse_y + height / 2);
        this.ctx.lineTo(start_x, this.mouse_y);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.restore();
        //пишем текст в значение стрелочки
        this.ctx.save();
        this.ctx.fillStyle = this.parent.skin.amountPositionTextColor;
        this.ctx.font = "bold 8px Tahoma";
        var text = (this.parent.height - (this.mouse_y - this.parent.y)) / this.parent.amount_coef + this.parent.min_amount;
        text = text.toFixed(this.parent.digits);
        this.ctx.textAlign = "left";
        this.ctx.fillText(text, this.parent.width + this.parent.x + 2, this.mouse_y + 3);
        this.ctx.restore();
    };
    return Mouse;
}());
var Hover = (function () {
    function Hover(parent) {
        this.parent = parent;
        this.ws = $('#bets')[0];
        this.ctx = this.ws.getContext('2d');
        this.ws.width = this.parent.parent.width;
        this.ws.height = this.parent.parent.height;
    }
    Hover.prototype.getCurrentY = function () {
        return this.parent.aData[this.parent.aData.length - 1].y;
    };
    Hover.prototype.getCurrentX = function () {
        return this.parent.aData[this.parent.aData.length - 1].x;
    };
    Hover.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.ws.width, this.ws.height);
    };
    Hover.prototype.buildPutField = function () {
        var y = this.getCurrentY();
        var x = this.getCurrentX();
        this.ctx.clearRect(this.parent.x, this.parent.y, this.parent.width + this.parent.parent.right_padding, this.parent.height + this.parent.bottom_padding);
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = 'rgba(255,0,0,0.1)';
        this.ctx.rect(this.parent.x, this.parent.y + y, this.parent.width + this.parent.parent.right_padding, this.parent.height - y + this.parent.bottom_padding);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = 'red';
        this.ctx.translate(x + 40, this.parent.y + 0.5);
        y = y + 40 + 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(0, y - 11);
        this.ctx.lineTo(8, y - 11);
        this.ctx.lineTo(8, y - 11 + 24);
        this.ctx.lineTo(8 - 24, y - 11 + 24);
        this.ctx.lineTo(8 - 24, y - 11 + 24 - 8);
        this.ctx.lineTo(8 - 24 + 11, y - 11 + 24 - 8);
        this.ctx.lineTo(8 - 24 + 11 - 22, y - 11 + 24 - 8 - 22);
        this.ctx.lineTo(8 - 24 + 11 - 22 + 6, y - 11 + 24 - 8 - 22 - 6);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    };
    Hover.prototype.buildCallField = function () {
        var y = this.getCurrentY();
        var x = this.getCurrentX();
        //this.ctx.clearRect(this.parent.y, this.parent.x, this.ws.width, this.parent.height);
        this.ctx.clearRect(this.parent.x, this.parent.y, this.parent.width + this.parent.parent.right_padding, this.parent.height + this.parent.bottom_padding);
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = 'rgba(0,255,0,0.1)';
        this.ctx.rect(this.parent.x, this.parent.y, this.parent.width + this.parent.parent.right_padding, y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = '#5ca905';
        this.ctx.translate(x + this.parent.x + 40, this.parent.y + 0.5);
        y = y - 40 + 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(-11, y);
        this.ctx.lineTo(-11, y - 8);
        this.ctx.lineTo(13, y - 8);
        this.ctx.lineTo(13, y + 16);
        this.ctx.lineTo(5, y + 16);
        this.ctx.lineTo(5, y + 5);
        this.ctx.lineTo(-17, y + 27);
        this.ctx.lineTo(-23, y + 22);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    };
    return Hover;
}());