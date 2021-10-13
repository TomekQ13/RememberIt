var api = require('./api.js');

class SMSSender {
    constructor(args) {
        this.smsApi = new api.SMSApi(process.env.CLICKSEND_EMAIL, process.env.CLICKSEND_API_KEY)
        this.args = args
    }

    async send() {
        var smsMessage = new api.SmsMessage();

        smsMessage.source = "sdk";
        smsMessage.to = this.args.phone;
        smsMessage.body = `Hi!
        The event ${this.args.name} is coming on ${this.args.date}.
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



