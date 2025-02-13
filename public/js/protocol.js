async function getOHLCData(pair, count) {
    const url = `/en/ohlc?pair=${pair}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error && data.error.length > 0) {
            console.error("Error getting data:", data.error);
            return [];
        }

        const ohlcData = data.result[pair];
        let lastCandles = ohlcData.slice(-count);
        
        lastCandles = lastCandles.map(candle => ({
            date: parseInt(candle[0]),
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
            amount: parseFloat(candle[4])
        }));
        return lastCandles
    } catch (error) {
        console.error("Request error:", error);
        return [];
    }
}



var Protocol = function(grafic,asset,ssid,account,error){
    try{
        this.socket = new WebSocket('ws://localhost:8080');
    }catch(e){
        error();
        return;
    }
        this.grafic = grafic;
        this.asset = asset;
        
        this.assets = new Array();
        this.assets.push(asset);
        this.ssid = ssid;
        this.account = account;

        this.historyData()

        var self = this;
        this.socket.onopen = function(){
            self.onOpen();
        }

        this.socket.onerror  = error;
    

        this.socket.onmessage = function(event){
            self.onMessage(event);
        } 
        
        this.socket.onclose = function(event){
            setInterval(function(){error();},5000);
        }

        window.krakenWS.onTradeUpdate((candle) => {
                console.log(candle)
        });
    }

    Protocol.prototype = {
        socket:null,
        timerange:30,
        mode:2, //режим ... билдер классик итд
        account:0,

        engine:function(){
            this.socket.send('getAssets '+this.mode+' '+this.account);  //запрос на получение списка активных катеровок для данного режима

            //отправляем запрос для получения данных графика
            this.socket.send('optionChartData '+this.ssid+' '+this.asset+' '+this.timerange+' '+this.mode+' '+this.account);
        },

        submit:function(position,amount){
            console.log(position);
            var data = this.asset+' '+this.mode+' '+amount+' '+position+' '+this.account;
            console.log('createOption '+this.ssid+' '+data);
            this.socket.send('createOption '+this.ssid+' '+data);
        },

        changeAsset:function(asset){
            this.asset = asset;
            this.addAsset(asset);
            
            this.setActives();
            
            this.socket.send('optionChartData '+this.ssid+' '+this.asset+' '+this.timerange+' '+this.mode+' '+this.account);
        },
        setActives : function(){
            var str = '';
            for(var key in this.assets){
                str += this.assets[key]+',';
            }
            str = str.substr(0,str.length-1);
            
            this.socket.send('setActives '+str);
        },
        addAsset: function(asset){
            if(this.assets.indexOf(asset) != -1) return;
            this.assets.push(asset);
        },

        onOpen: function(){
            console.log("Соединение установлено.");
            this.socket.send('getAmountList '+this.account);   //список значений ставок

            var self = this;
            setInterval(function(){ //PING
                self.socket.send("ping "+self.ssid);   //отправляем пинг и получаем таймстамп
            },60000);
            
            self.socket.send('getDeals '+this.ssid+' '+this.mode +' '+this.account);

            this.setActives();
            this.engine();
        },
        onDataReceive:function(callback){
            this.optionChartDataCallback = callback;
        },
        onTimeSync: function(callback) {
            this.timeSyncCallback = callback;
            this.timeSync = function (time) {
                if (this.timeSyncCallback) {
                    this.timeSyncCallback(time);
                }
            };
        },
        onUpdate:function(callback){
            this.newChartDataCallback = callback;
        },
        onAsset:function(callback){
            this.assetCallback = callback;
        },
        onCreateOption:function(callback){
            this.createOptionCallback = callback;
        },
        onCloseOption:function(callback){
            this.closeOptionCallback = callback;
        },
        createOption:function(json){
            if(this.createOptionCallback == undefined) return;
            this.createOptionCallback(json);
        },
        closeOption:function(json){
            if(this.closeOptionCallback == undefined) return;
            this.closeOptionCallback(json);            
        },
        historyData: async function() {
            const chart = this.grafic.charts[0];
            const data = await getOHLCData('ETH/USD', 50)
            chart.render(data)
        },
        addNewPosition: function(json){
            if(this.newChartDataCallback == undefined) return;
            var element = new Object();
            element.date = json.time;
            element.amount = json.close;
            element.asset = 1;
            this.newChartDataCallback(element);
        },
        
        setAssetList:function(data){        //добавляем елементы в список ассетов
            if(this.assetCallback == undefined) return;
            this.assetCallback(data,this.asset);            
        },
        onGetDeals:function(callback){            
            this.getDealsCallback = callback;
        },
        setGetDeals:function(json){
            if(this.getDealsCallback == undefined) return;
            this.getDealsCallback(json.deals);            
        },
        timeSync:function(json){
            if(this.timeSyncCallback == undefined) return;
            this.timeSyncCallback(json.time);
        },
        initGrafic:function(json){
            if(this.optionChartDataCallback == undefined) return;
            this.optionChartDataCallback(json);
        },
        quotesLine:function(json){
        },

        onAmountList:function(callback){
            this.amountListCallback = callback;
        },
        setAmountList:function(json){
            if(this.amountListCallback == undefined) return;
            this.amountListCallback(json);
        },
        onMessage:function(event){
            var json = JSON.parse(event.data);  
            for(var key in json){
                switch(key){
                    case 'newChartData': {this.addNewPosition(json[key]);}break;
                    case 'timeSync': this.timeSync(json[key]);break;
                    case 'optionChartData': this.initGrafic(json[key]);break;
                    case 'createOption': this.createOption(json[key]);break;    //делаем ставку
                    case 'closeOption': this.closeOption(json[key]);break;    //ответ о закрытие опциона
                    case 'Assets': this.setAssetList(json[key].data); break;     //список катеровок для списка выбора 
                    case 'getDeals': this.setGetDeals(json[key]); break;     //список катеровок для списка выбора 
                    case 'quotesLine':this.quotesLine(json[key]);break;
                    case 'AmountList':this.setAmountList(json[key]);break;

                    default: console.log(json[key]);
                }
            }
        },
        
    }
