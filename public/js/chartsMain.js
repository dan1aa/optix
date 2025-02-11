var ChartsMain = (function () {
    function ChartsMain() {
        this.skin_name = 'light';
        this.type = 'normal';
        this.max_amount = 0;
        this.min_amount = 0;
        this.max_time = 0;
        this.min_time = 0;
        this.amount_padding_top = 60;
        this.amount_padding_bottom = 60;
        this.time_padding = 15; //в процентном отношение
        this.bottom_padding = 40;
        this.amount_range = 0;
        this.amount_coef = 0;
        this.digits = 0;
        this.save_range = 5; //время в секундах через которое сохраняет котировку на графике
        this.defaultAllowedTimeToShowQuotes = 300;
    }
    ChartsMain.prototype.setParams = function (obj) {
        this.parent = obj.parent;
        if (obj.type != undefined) {
            this.type = obj.type;
        }
        this.skin_name = obj.skin != undefined ? obj.skin : 'default';
        this.skin = Skins.get(this.skin_name);
        this.x = obj.x;
        this.y = obj.y;
        this.width = obj.width - this.parent.right_padding;
        this.height = obj.height - this.bottom_padding;
        this.ctx = obj.context;
    };
    ChartsMain.prototype.background = function () {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = this.skin.backgroundColor;
        this.ctx.rect(this.x, this.y, this.width + this.parent.right_padding, this.height + this.bottom_padding);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();
        //контур вокруг графика
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.skin.graficBorderColor;
        this.ctx.rect(this.x, this.y, this.width + 0.5, this.height + 0.5);
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    };
    ChartsMain.prototype.buildDeals = function () {
        if (!this.parent.deals)
            return false;
        for (var key in this.parent.deals) { }
        var deal = this.parent.deals[key];
        if (deal.closeprice) {
            this.parent.activeDeals = false;
            return false;
        }
        var x = this.getX(deal.opentime) + this.x;
        var y = this.getY(deal.openprice) + this.y;
        var start_x = x;
        var i = 0;
        var position = 0;
        var amount = deal.amount / 100;
        var end_x = this.getX(deal.closetime);
        //ярлык с суммой ставки
        this.ctx.save();
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = "#fdc100";
        this.ctx.strokeStyle = "#6f5a11";
        this.ctx.beginPath();
        this.ctx.moveTo(start_x - 9, y);
        this.ctx.lineTo(start_x - 9 - 5, y - 10);
        this.ctx.lineTo(start_x - 9 - 40, y - 10);
        this.ctx.lineTo(start_x - 9 - 40, y + 10);
        this.ctx.lineTo(start_x - 9 - 5, y + 10);
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.fillStyle = "white";
        this.ctx.font = "bolder 8pt Arial";
        var text = amount.toFixed(2) + "$";
        var length = this.ctx.measureText(text);
        this.ctx.translate(x - 45 + 5 + length.width, y + 9);
        this.ctx.textAlign = "left";
        this.ctx.fillText(text, length.width * -1 - 5, -5.5);
        this.ctx.closePath();
        this.ctx.restore();
        //треугольник в конце в зависимости от позиции сделки
        this.ctx.save();
        this.ctx.fillStyle = "#fdc100";
        this.ctx.beginPath();
        if (position == 1) {
            this.ctx.moveTo(end_x, y + 1);
            this.ctx.lineTo(end_x - 8, y + 1);
            this.ctx.lineTo(end_x, y - 8 + 2);
            this.ctx.lineTo(end_x + 8, y + 1);
        }
        else {
            this.ctx.moveTo(end_x, y - 1);
            this.ctx.lineTo(end_x - 8, y - 1);
            this.ctx.lineTo(end_x, y + 8 + 2);
            this.ctx.lineTo(end_x + 8, y - 1);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
        //кружечек на сделке
        this.ctx.save();
        this.ctx.fillStyle = "#fdc100";
        this.ctx.beginPath();
        this.ctx.arc(x, y, 4, 0, 2 * Math.PI, false);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
        //отрисовуем пунктир
        this.ctx.save();
        this.ctx.lineWidth = 2;
        while (start_x < end_x) {
            if (i % 2 == 0) {
                this.ctx.strokeStyle = '#fdc100';
            }
            else {
                this.ctx.strokeStyle = "transparent";
            }
            this.ctx.beginPath();
            this.ctx.moveTo(start_x, y);
            if (start_x + 6 > end_x) {
                this.ctx.lineTo(end_x, y);
            }
            else {
                this.ctx.lineTo(start_x + 6, y);
            }
            this.ctx.closePath();
            this.ctx.stroke();
            i++;
            start_x += 6;
        }
        this.ctx.restore();
        //отрисовуем
        this.ctx.save();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = this.skin.expirationLineColor;
        this.ctx.beginPath();
        this.ctx.moveTo(end_x + this.x, this.y + 0.5);
        this.ctx.lineTo(end_x + this.x, this.height + this.y + 0.5);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.restore();
    };
    ChartsMain.prototype.buildCandles = function () {
        var key;
        var step = 14;
        var width;
        var blocks = (this.max_time - this.min_time) / step;
        
        width = (this.width - (this.width / 100 * this.time_padding)) / blocks; //ширину на кількість блоків
        width = width - width / 100 * 30; // віднімаємо від ширини блока трохи, щоб свічки не були впритул
        var start = parseInt(this.aData[0].date);
        var end = parseInt(this.aData[this.aData.length - 1].date);
        var i = 0;
        var arr = new Object();
        
    
        while (start < end) {
            
            arr[start] = new Array();
            
            if (arr[start - step] != undefined) {
                arr[start].push(arr[start - step][arr[start - step].length - 1]);
            }
            
    
            for (key in this.aData) {
                if (this.aData[key].date > start && this.aData[key].date < start + step) {
                    arr[start].push(this.aData[key].amount);
                }
            }
    
            i++;
            start += step;
        }
    
    
        this.candleData = new Object();
    
    
        for (key in arr) {
            key = parseInt(key);
            this.candleData[key + step / 2] = new Array();
    
    
            this.candleData[key + step / 2].start = arr[key][0];
            this.candleData[key + step / 2].end = arr[key][arr[key].length - 1];
            this.candleData[key + step / 2].max = 0;
            this.candleData[key + step / 2].min = 0;
    
            for (var key2 in arr[key]) {
                if (this.candleData[key + step / 2].max == 0 || arr[key][key2] > this.candleData[key + step / 2].max) {
                    this.candleData[key + step / 2].max = arr[key][key2];
                }
                if (this.candleData[key + step / 2].min == 0 || arr[key][key2] < this.candleData[key + step / 2].min) {
                    this.candleData[key + step / 2].min = arr[key][key2];
                }
            }
        }
    
    
        // Тепер малюємо свічки
        for (key in this.candleData) {
            this.candleData[key].x = this.getX(key);
            this.candleData[key].y_start = this.getY(this.candleData[key].start);
            this.candleData[key].y_end = this.getY(this.candleData[key].end);
            this.candleData[key].y_max = this.getY(this.candleData[key].max);
            this.candleData[key].y_min = this.getY(this.candleData[key].min);
    
            // Малюємо лінії
            this.ctx.save();
            this.ctx.lineWidth = 1;
            if (this.candleData[key].y_start != this.candleData[key].y_end) {
                if (this.candleData[key].y_start > this.candleData[key].y_end) {
                    this.ctx.fillStyle = "#57c580";
                    this.ctx.strokeStyle = "#57c580";
                } else {
                    this.ctx.fillStyle = "#e57878";
                    this.ctx.strokeStyle = "#e57878";
                }
    
                // Малюємо мінімум і максимум
                this.ctx.beginPath();
                this.ctx.moveTo(this.candleData[key].x + this.x, this.candleData[key].y_max + this.y);
                this.ctx.lineTo(this.candleData[key].x + this.x, this.candleData[key].y_min + this.y);
                this.ctx.closePath();
                this.ctx.stroke();
    
                // Малюємо блок (свічку)
                this.ctx.rect(this.candleData[key].x - width / 2 + this.x, this.candleData[key].y_start + this.y, width, this.candleData[key].y_end - this.candleData[key].y_start);
                this.ctx.fill();
            } else {
                this.ctx.strokeStyle = "#e57878";
    
                // Якщо немає зміни
                this.ctx.beginPath();
                this.ctx.moveTo(this.candleData[key].x + this.x - width / 2, this.candleData[key].y_start + this.y);
                this.ctx.lineTo(this.candleData[key].x + this.x + width / 2, this.candleData[key].y_start + this.y);
                this.ctx.closePath();
                this.ctx.stroke();
            }
            this.ctx.restore();
        }
    };
    ChartsMain.prototype.drawCurrentPositionElement = function () {
        var element = this.aData[this.aData.length - 1];
        var height = 20;
        var arrow = 15;
        var start_x = this.width - 40;
        //рисуем стрелочку для текста
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.skin.currentAmountPositionBorderColor;
        this.ctx.fillStyle = this.skin.currentAmountPositionBackgroundColor;
        this.ctx.beginPath();
        this.ctx.moveTo(start_x + this.x + 0.5, element.y + this.y + 0.5);
        this.ctx.lineTo(start_x + this.x + arrow + 0.5, element.y + this.y - height / 2 + 0.5);
        this.ctx.lineTo(this.width + this.parent.right_padding + this.x + 0.5, element.y + this.y - height / 2 + 0.5);
        this.ctx.lineTo(this.width + this.parent.right_padding + this.x + 0.5, element.y + this.y + height / 2 + 0.5);
        this.ctx.lineTo(start_x + this.x + arrow, element.y + this.y + height / 2);
        this.ctx.lineTo(start_x + this.x, element.y + this.y);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.restore();
        //пишем текст в значение стрелочки
        this.ctx.save();
        this.ctx.fillStyle = this.skin.currentAmountPositionTextColor;
        this.ctx.font = "bold 12px Tahoma";
        var text = element.amount;
        this.ctx.textAlign = "left";
        this.ctx.fillText(text, this.width + this.x + 10, element.y + this.y + 4);
        this.ctx.restore();
        //рисуем линию
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.skin.currentAmountPositionLineColor;
        this.ctx.beginPath();
        this.ctx.moveTo(start_x + this.x + 0.5, element.y + this.y + 0.5);
        this.ctx.lineTo(this.x + 0.5, element.y + this.y + 0.5);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.restore();
    };
    ChartsMain.prototype.currentPositionDot = function () {
        var element = this.aData[this.aData.length - 1];
        var radius = 3;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = this.skin.currentAmountPositionDotColor;
        this.ctx.arc(element.x + this.x, element.y + this.y, radius, 0, 2 * Math.PI, false);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    };
    ChartsMain.prototype.graficBackground = function () {
        this.ctx.save();
        this.ctx.fillStyle = this.skin.graficBackgroundColor(this.ctx.createLinearGradient(0, 0, 0, this.height));
        this.ctx.beginPath();
        for (var key in this.aData) {
            if (key == '0') {
                this.ctx.moveTo(this.aData[key].x + this.x, this.aData[key].y + this.y);
                continue;
            }
            this.ctx.lineTo(this.aData[key].x + this.x, this.aData[key].y + this.y);
        }
        this.ctx.lineTo(this.aData[key].x + this.x, this.height + this.y);
        this.ctx.lineTo(this.x, this.height + this.y);
        this.ctx.lineTo(this.x, this.y + this.height);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    };
    ChartsMain.prototype.getTime = function (x) {
        return Math.floor(x / this.time_coef + this.min_time);
    };
    ChartsMain.prototype.getX = function (time) {
        return Math.floor((Math.floor(time) - this.min_time) * this.time_coef) + 0.5;
    };
    ChartsMain.prototype.getY = function (amount) {
        return Math.floor(this.height - ((amount - this.min_amount) * this.amount_coef)) + 0.5;
    };
    ChartsMain.prototype.buildExpirationLines = function () {
        var x = this.getX(this.parent.end_expiration);
        //отрисовуем
        this.ctx.save();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = this.skin.expirationLineColor;
        this.ctx.beginPath();
        this.ctx.moveTo(x + this.x, this.y + 0.5);
        this.ctx.lineTo(x + this.x, this.height + this.y + 0.5);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.restore();
        this.ctx.save();
        this.ctx.fillStyle = this.skin.expirationTextColor;
        this.ctx.font = this.skin.expirationTextFont;
        var text = 'Expiration Time';
        var length = this.ctx.measureText(text);
        this.ctx.translate(x + this.x + 0.5, this.y + 0.5);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.textAlign = "left";
        this.ctx.fillText(text, length.width * -1 - 5, -5.5);
        this.ctx.restore();
        x = this.getX(this.parent.stop_expiration);
        var start_y = this.height;
        var step = 3;
        var i = 1;
        //отрисовуем
        this.ctx.save();
        this.ctx.lineWidth = 2;
        while (start_y > 0) {
            if (i % 2 == 0) {
                this.ctx.strokeStyle = this.skin.stopExpirationLineColor;
            }
            else {
                this.ctx.strokeStyle = "transparent";
            }
            this.ctx.beginPath();
            this.ctx.moveTo(x + this.x, start_y + this.y + 0.5);
            start_y -= step;
            this.ctx.lineTo(x + this.x, start_y + this.y + 0.5);
            this.ctx.closePath();
            this.ctx.stroke();
            i++;
        }
        this.ctx.restore();
    };
    ChartsMain.prototype.buildLines = function () {
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.skin.graficLinesColor;
        var key;
        for (key in this.aData) {
            key *= 1; //to INT
            if (this.aData[key + 1] == undefined)
                break;
            this.ctx.beginPath();
            this.ctx.moveTo(this.aData[key].x + this.x + 0.5, this.aData[key].y + this.y + 0.5);
            this.ctx.lineTo(this.aData[key + 1].x + this.x + 0.5, this.aData[key + 1].y + this.y + 0.5);
            this.ctx.closePath();
            this.ctx.stroke();
        }
        this.ctx.restore();
    };
    ChartsMain.prototype.getAmountStep = function (start, end) {
        var step = 14;
        var incr = 1; //если целое число
        if (this.digits > 0) {
            var incr = Math.pow(10, this.digits);
        }
        var range = Math.floor((start - end) * incr);
        var period = Math.floor(range / step / 5) * 5;
        if (period < 1)
            period = 5;
        period = (period / incr).toFixed(this.digits);
        return period;
    };
    ChartsMain.prototype.buildAmountGrid = function () {
        var start = (this.height / this.amount_coef) + this.min_amount * 1;
        var end = 0 / this.amount_coef + this.min_amount;
        var step = this.getAmountStep(start, end);
        start = Math.ceil(start / step) * step; //пересчитываем старт
        var y = 0;
        while (start > end) {
            y = Math.floor(this.height - ((start - this.min_amount) * this.amount_coef));
            if (y < 0) {
                start -= step;
                continue;
            }
            //отрисовуем
            this.ctx.save();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = this.skin.amountLinesColor;
            this.ctx.beginPath();
            this.ctx.moveTo(this.x + 0.5, y + this.y + 0.5);
            this.ctx.lineTo(this.x + this.width + 0.5, this.y + y + 0.5);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.restore();
            //черточка сбоку
            this.ctx.save();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = this.skin.amountStripesColor;
            this.ctx.beginPath();
            this.ctx.moveTo(this.x + this.width + 0.5, this.y + y + 0.5);
            this.ctx.lineTo(this.x + this.width + 0.5 + 5, this.y + y + 0.5);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.restore();
            //надпись
            this.ctx.save();
            this.ctx.fillStyle = this.skin.amountTextColor;
            this.ctx.font = "normal 12px Tahoma";
            var text = start.toFixed(this.digits);
            //var length = this.ctx.measureText(text);
            this.ctx.textAlign = "left";
            this.ctx.fillText(text, this.x + this.width + 0.5 + 7, this.y + y + 0.5 + 4);
            this.ctx.restore();
            start -= step;
        }
    };
    ChartsMain.prototype.buildTimeGrid = function () {
        var hours, minutes, seconds, d, text, length;
        //получаем первый елемент    и смотрим время
        var time = this.aData.date;
        var date = new Date(time * 1000);
        date.setSeconds(0); //обнуляем секунды
        var start = date.getTime() / 1000; //начальное число
        var end = Math.floor((this.width / this.time_coef) + Math.floor(this.min_time));
        //определяем через сколько секунд будут промежутки
        var positions = Math.floor((end - start) / 30);
        var interval = this.parent.width / positions;
        var step = 0;
        if (interval > 60) {
            step = 30;
        }
        else if (interval < 60 && interval > 40) {
            step = 60;
        }
        else if (interval <= 40 && interval > 30) {
            step = 120;
        }
        else if (interval <= 30 && interval > 20) {
            step = 180;
        }
        else if (interval <= 20 && interval > 10) {
            step = 210;
        }
        else if (interval <= 10 && interval > 5) {
            step = 300;
        }
        else if (interval <= 5 && interval > 3) {
            step = 420;
        }
        else {
            step = 120;
        }
        var x = 0;
        while (start < end) {
            x = Math.floor((start - this.min_time) * this.time_coef) + 0.5; //0.5 Canvas FIX
            if (x < 0) {
                start += step;
                continue;
            }
            //отрисовуем
            this.ctx.save();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = this.skin.timeLinesColor;
            this.ctx.beginPath();
            this.ctx.moveTo(x + this.x, this.height + this.y + 0.5);
            this.ctx.lineTo(x + this.x, this.y + 0.5);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.restore();
            //черточка снизу
            this.ctx.save();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = this.skin.timeStripesColor;
            this.ctx.beginPath();
            this.ctx.moveTo(x + this.x, this.height + this.y + 0.5);
            this.ctx.lineTo(x + this.x, this.height + this.y + 5 + 0.5);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.restore();
            d = new Date(start * 1000);
            hours = d.getHours();
            hours = hours < 10 ? '0' + hours : hours;
            minutes = d.getMinutes();
            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = d.getSeconds();
            seconds = seconds < 10 ? '0' + seconds : seconds;
            //надпись
            this.ctx.save();
            this.ctx.fillStyle = this.skin.timeTextColor;
            this.ctx.font = "normal 12px Tahoma";
            var text = hours + ':' + minutes + ':' + seconds;
            var length = this.ctx.measureText(text);
            this.ctx.textAlign = "left";
            this.ctx.fillText(text, x + this.x - (length.width / 2), this.height + this.y + 20 + 0.5);
            this.ctx.restore();
            start += step;
        }
    };
    ChartsMain.prototype.countDigits = function (data) {
        var amount = data[0].amount;
        var string = amount.toString();
        var total = string.length; //считаем всего символ
        var integer = (parseInt(string)).toString().length; //считаем всего символ
        this.digits = total - integer - 1;
        if (this.digits <= 0) {
            this.digits = 0;
        }
    };
    ChartsMain.prototype.setDataCoords = function (data) {
        for (var key in data) {
            data[key].y = this.height - ((data[key].amount - this.min_amount) * this.amount_coef); //this.height - нужно что бЫ перевернуть график так как y=0 тут сверху
            data[key].x = (data[key].date - this.min_time) * this.time_coef;
        }
    };
    ChartsMain.prototype.setMinMaxAmount = function (data) {
        this.max_amount = 0;
        this.min_amount = 0;
        for (var key in data) {
            ///AMOUNT
            if (data[key].amount > this.max_amount || !this.max_amount) {
                this.max_amount = data[key].amount;
            }
            if (data[key].amount < this.min_amount || !this.min_amount) {
                this.min_amount = data[key].amount;
            }
        }
        this.amount_range = this.max_amount - this.min_amount; //рендж без отступов
        //добавляем отступы с верху и снизу графика
        var pixel = this.amount_range / this.height;
        this.max_amount = this.max_amount * 1 + pixel * this.amount_padding_top;
        this.min_amount = this.min_amount * 1 - pixel * this.amount_padding_bottom;
        this.amount_range = this.max_amount - this.min_amount;
        this.amount_coef = this.height / this.amount_range;
    };
    ChartsMain.prototype.setMinMaxTime = function (data) {
        this.max_time = 0;
        this.min_time = 0;
        for (var key in data) {
            //TIME
            if (data[key].date > this.max_time || !this.max_time) {
                this.max_time = data[key].date;
            }
            if (data[key].date < this.min_time || !this.min_time) {
                this.min_time = data[key].date;
            }
        }
        this.max_time = this.parent.end_expiration; //определяем максимальное время
        this.time_range = this.max_time - this.min_time;
        this.time_coef = (this.width - (this.width - this.parent.right_padding) / 100 * this.time_padding) / this.time_range;
    };
    ChartsMain.prototype.getLastDeal = function () {
        if (this.deals) {
            for (var key in this.deals) { }
            ;
            var deal = this.deals[key];
        }
        else {
            return null;
        }
    };
    ChartsMain.prototype.generateAData = function (data) {
        if (data == undefined) return;
        if (data[0] == undefined) return;
    
        var aData = [];
        var time;
    
        // отримуємо час для порівняння
        if (this.newAsset) {
            time = (this.newAsset.date - this.defaultAllowedTimeToShowQuotes) - (this.zoom * this.zoom_step);
        } else {
            time = (data[data.length - 1].date - this.defaultAllowedTimeToShowQuotes) - (this.zoom * this.zoom_step);
        }
    
        var i = 0;
        for (var key in data) {
            if (data[key].date < time) {
                continue;
            }
            aData[i] = {};
            for (var key2 in data[key]) {
                aData[i][key2] = data[key][key2];
            }
            i++;
        }
    
        if (this.newAsset) {
            aData.push(this.newAsset);
            if (this.newAsset.temp === true || this.newAsset.temp === false) {
                if (this.newAsset.temp == false) {
                    data.push(this.newAsset);
                }
            } else {
                if (this.newAsset.date - data[data.length - 1].date >= this.save_range) {
                    data.push(this.newAsset);
                }
            }
        }
    
        return aData;
    };
    return ChartsMain;
}());
var Local = (function () {
    function Local() {
    }
    Local.ru = {
        total: 'Всего',
        investments: 'Инвестиций',
        expected: 'Ожидаемый',
        profit: 'Доход',
        timetoexpirate: "Время до покупки"
    };
    Local.en = {
        total: 'Total',
        investments: 'Investments',
        expected: 'Expected',
        profit: 'Profit',
        timetoexpirate: "Time to expirate"
    };
    return Local;
}());
var Skins = (function () {
    function Skins() {
    }
    Skins.get = function (name) {
        switch (name) {
            case 'light': return this.light;
            case 'dark': return this.dark;
            case 'default': return this.default;
        }
    };
    Skins.default = {
        backgroundColor: "transparent",
        graficBorderColor: "#999999",
        currentAmountPositionDotColor: '#5577d8',
        currentAmountPositionLineColor: "#8ed3a8",
        currentAmountPositionBackgroundColor: "#8ed3a8",
        currentAmountPositionBorderColor: "#8ed3a8",
        currentAmountPositionTextColor: "#ffffff",
        expirationFormTextColor: "#91bedd",
        expirationFormBackgroundColor: "rgba(170, 209, 235, 0.3)",
        expirationTextColor: '#ff7e00',
        expirationTextFont: "bolder 10pt Arial",
        expirationLineColor: "#ff7e00",
        stopExpirationLineColor: "#91bedd",
        mousePositionLineColor: "#a0b5e3",
        amountLinesColor: "#efefef",
        amountStripesColor: "#999999",
        amountTextColor: "#333333",
        amountPositionBlockBorderColor: "#a0b5e3",
        amountPositionBlockBackgroundColor: "#a0b5e3",
        amountPositionTextColor: "#ffffff",
        timeLinesColor: "#efefef",
        timeStripesColor: "#999999",
        timeTextColor: "#333333",
        timePositionBlockBorderColor: "#a0b5e3",
        timePositionBlockBackgroundColor: "#a0b5e3",
        timePositionTextColor: "#ffffff",
        graficLinesColor: "#a0b5e3",
        graficBackgroundColor: function (grd) {
            grd.addColorStop(0.1, "#bfcaed");
            grd.addColorStop(0.9, "white");
            return grd;
        }
    };
    Skins.light = {
        backgroundColor: "#fafafa",
        graficBorderColor: "#babab8",
        currentAmountPositionDotColor: '#3b455e',
        currentAmountPositionLineColor: "#3b455e",
        currentAmountPositionBackgroundColor: "#3b455e",
        currentAmountPositionBorderColor: "#3b455e",
        currentAmountPositionTextColor: "#ffffff",
        expirationFormTextColor: "#e5f0f6",
		expirationFormBackgroundColor:"rgba(59, 69, 94, 0.7)",
        expirationTextColor: '#fec659',
        expirationTextFont: "bolder 10pt Arial",
        expirationLineColor: "#ffb600",
        stopExpirationLineColor: "#2e79ba",
        mousePositionLineColor: "#f73e05",
        amountLinesColor: "#ededed",
        amountStripesColor: "#4b5262",
        amountTextColor: "#626c78",
        amountPositionBlockBorderColor: "#f73e05",
        amountPositionBlockBackgroundColor: "#f73e05",
        amountPositionTextColor: "#ffffff",
        timeLinesColor: "#ededed",
        timeStripesColor: "#4b5262",
        timeTextColor: "#626c78",
        timePositionBlockBorderColor: "#f73e05",
        timePositionBlockBackgroundColor: "#f73e05",
        timePositionTextColor: "#ffffff",
        graficLinesColor: "#ffe36e",
        graficBackgroundColor: function (grd) {
            grd.addColorStop(0.9, "rgba(255, 227, 110, 0.2)");
            return grd;
        }
    };
    Skins.dark = {
        backgroundColor: "#202731",
        graficBorderColor: "#4a5362",
        currentAmountPositionDotColor: '#24a65e',
        currentAmountPositionLineColor: "#26a560",
        currentAmountPositionBackgroundColor: "#26a560",
        currentAmountPositionBorderColor: "#26a560",
        currentAmountPositionTextColor: "#ffffff",
        expirationFormTextColor: "#dde2e8",
        expirationFormBackgroundColor: "rgba(23, 92, 153, 0.9)",
        expirationTextColor: '#e0a00a',
        expirationTextFont: "bolder 10pt Arial",
        expirationLineColor: "#ffb600",
        stopExpirationLineColor: "#2e79ba",
        mousePositionLineColor: "#2e79ba",
        amountLinesColor: "#343841",
        amountStripesColor: "#4a5362",
        amountTextColor: "#626c78",
        amountPositionBlockBorderColor: "rgba(23, 92, 153, 1)",
        amountPositionBlockBackgroundColor: "rgba(23, 92, 153, 1)",
        amountPositionTextColor: "#ffffff",
        timeLinesColor: "#343841",
        timeStripesColor: "#4a5362",
        timeTextColor: "#626c78",
        timePositionBlockBorderColor: "rgba(23, 92, 153, 1)",
        timePositionBlockBackgroundColor: "rgba(23, 92, 153, 1)",
        timePositionTextColor: "#ffffff",
        graficLinesColor: "#f0ca39",
        graficBackgroundColor: function (grd) {
            grd.addColorStop(0.9, "rgba(185, 185, 185, 0.2)");
            return grd;
        }
    };
    return Skins;
}());
