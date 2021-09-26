var api = require('./api.js');

class SMSSender {
    constructor() {
        this.smsApi = new api.SMSApi("process.env.CLICKSEND_EMAIL", "process.env.CLICKSEND_API_KEY");
    }

    async send(eventName, eventDate, to) {
        var smsMessage = new api.SmsMessage();

        smsMessage.source = "sdk";
        smsMessage.to = to;
        smsMessage.body = `Hi!
        The event ${eventName} is coming on ${eventDate}.
        `
        var smsCollection = new api.SmsMessageCollection();

        smsCollection.messages = [smsMessage];

        this.smsApi.smsSendPost(smsCollection).then(function(response) {
        console.log(response.body);
        }).catch(function(err){
        console.error(err.body);
        });
    }
}

module.exports = SMSSender




