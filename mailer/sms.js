var api = require('./api.js');

class SMSSender {
    constructor() {
        this.smsApi = new api.SMSApi("kuczak.tomasz@gmail.com", "B760DBE6-CAD7-AF24-D0A7-E7EF14C1F6D3");
    }

    async send(eventName, eventDate, to) {
        var smsMessage = new api.SmsMessage();

        smsMessage.source = "sdk";
        smsMessage.to = to;
        smsMessage.body = "test message";

        var smsCollection = new api.SmsMessageCollection();

        smsCollection.messages = [smsMessage];

        this.smsApi.smsSendPost(smsCollection).then(function(response) {
        console.log(response.body);
        }).catch(function(err){
        console.error(err.body);
        });
    }
}




