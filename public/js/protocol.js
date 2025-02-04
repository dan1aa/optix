var Protocol = function(grafic,asset,ssid,account,error){
    try{
        this.socket = new WebSocket('https:' == location.protocol ? 'wss://'+location.hostname+'/websocket' : 'ws://'+location.hostname+'/websocket');
    }catch(e){
        error();
        return;
//        alert('!!!!!!');
    }
        this.grafic = grafic;
        this.asset = asset;
        
        this.assets = new Array();
        this.assets.push(asset);
        
        this.ssid = ssid;
        this.account = account;

//        console.log('Account: '+this.account);
        var self = this;
        this.socket.onopen = function(){
            self.onOpen();
        }

        this.socket.onerror  = error;
        
/*        this.socket.onerror  = function(){
            $('#connectionModal').modal('show');
        }*/

        this.socket.onmessage = function(event){
            self.onMessage(event);
        } 
        
        this.socket.onclose = function(event){
//            self.onClose();
            setInterval(function(){error();},5000);
        }
    }

    Protocol.prototype = {
        socket:null,
        //asset:null,
        timerange:30,
        mode:2, //режим ... билдер классик итд
        account:0,

        engine:function(){
            //this.socket.send('getQuotesList 1');   //авторизируемся    //0 Выключить    //для получения каждый секунду значений ВСЕХ катеровок.. для списка
            this.socket.send('getAssets '+this.mode+' '+this.account);  //запрос на получение списка активных катеровок для данного режима
            //this.socket.send('quotesLine');   //авторизируемся  

            //отправляем запрос для получения данных графика
            //console.log('optionChartData '+this.ssid+' '+this.asset+' '+this.timerange+' '+this.mode+' '+this.account);
            this.socket.send('optionChartData '+this.ssid+' '+this.asset+' '+this.timerange+' '+this.mode+' '+this.account);
            //optionChartData ae7445415f000104804af4ce9283ad68 13 60 2 0
        },

        submit:function(position,amount){
            console.log(position);

            //var amount = $('#bet_amount').val();
            //var amount = $('#bet_amount').val()*100;
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
        
        removeAsset: function(){
            
        },
        onOpen: function(){
            console.log("Соединение установлено.");

            this.socket.send('getAmountList '+this.account);   //список значений ставок

            var self = this;
            setInterval(function(){ //PING
                self.socket.send("ping "+self.ssid);   //отправляем пинг и получаем таймстамп
            },60000);
            
            console.log('getDeals '+this.ssid+' '+this.mode +' '+this.account);
            self.socket.send('getDeals '+this.ssid+' '+this.mode +' '+this.account);
            //self.socket.send('quotesLine');   //авторизируемся  

            //this.setActives([this.asset]);  //устанавливаем котировки значения которых нам будут приходить
            this.setActives();
            this.engine();
        },
        onDataReceive:function(callback){
            this.optionChartDataCallback = callback;
        },
        onTimeSync:function(callback){
            this.timeSyncCallback = callback;
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
        addNewPosition:function(json){
            if(this.newChartDataCallback == undefined) return;
            //console.log(json);
            var element = new Object();
            element.date = json.time;
            element.amount = json.value;
            element.asset = json.id;
            this.newChartDataCallback(element);
            /*if(json.id == this.asset){
                this.newChartDataCallback(element);
            }*/
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
            console.log(json);
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
            //console.log(json);
            for(var key in json){
                switch(json[key].name){
                    case 'newChartData': this.addNewPosition(json[key]);break;
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
        
        
        
        /*optionError:function(error){
            $('.trading aside .error').text($('#errorList #_'+error).text());
        },*/
        
        onClose:function(event){
        },
        
        /*setActives:function(assets){
            var ids = '';

            for(var key in assets){
                ids += assets[key]+',';
            }
            ids = ids.substr(0, ids.length-1);   //убираем последнюю кому

            this.socket.send('setActives '+ids);
        }*/
        /*
            App.protocol.socket.send('getDeals '+App.protocol.get('ssid')+' '+App.protocol.get('mode') +' '+App.protocol.get('account'));   //авторизируемся
            App.protocol.socket.send('getQuotesList 1');   //авторизируемся    //0 Выключить
            App.protocol.socket.send('quotesLine');   //авторизируемся  
        */
    }