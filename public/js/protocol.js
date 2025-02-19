const currAsset = assetsData.filter(e => e.id == +pairQuery)[0]
const asset = currAsset.id;
const assetName = currAsset.name;

const accountType = localStorage.getItem('account_type');

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



var Protocol = function(grafic,ssid,error){
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
    }

    Protocol.prototype = {
        socket:null,
        mode:2, //режим ... билдер классик итд

        engine:function(){
            this.socket.send('getAssets '+this.mode);  //запрос на получение списка активных катеровок для данного режима
        },

        submit:function(position,amount){
            var data = this.asset+' '+this.mode+' '+amount+' '+position+' '+accountType+' '+assetName;
            this.socket.send('createOption '+this.ssid+' '+data);
        },

        onOpen: function(){
            console.log("Соединение установлено.");
            this.socket.send('getAmountList');   //список значений ставок

            var self = this;
            
            self.socket.send('getDeals '+this.ssid+' '+this.mode);

            this.engine();
        },
        onTimeSync: function(callback) {
            this.timeSyncCallback = callback;
            this.timeSync = function (time) {
                if (this.timeSyncCallback) {
                    this.timeSyncCallback(time);
                }
            };
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
            const data = await getOHLCData(currAsset.name, 50)
            console.log(data)
            const currPriceInput = document.querySelector('.curr-price-input');
            if (currPriceInput) currPriceInput.value = data[data.length - 1].close;
            chart.render(data)
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
                    case 'timeSync': this.timeSync(json[key]);break; //done
                    case 'createOption': this.createOption(json[key]);break;
                    case 'closeOption': this.closeOption(json[key]);break;  
                    case 'Assets': this.setAssetList(json[key].data); break; //done 
                    case 'getDeals': this.setGetDeals(json[key]); break;     
                    case 'AmountList':this.setAmountList(json[key]);break; // done

                    default: console.log(json[key]);
                }
            }
        },
        
    }
