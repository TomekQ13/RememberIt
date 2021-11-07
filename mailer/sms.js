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
        The event ${this.args.name} is coming on ${this.args.date.toLocaleString('en-EN', {
            weekday: 'long',
            day: 'numeric', 
            year: 'numeric', 
            month: 'long'})}.
        `
        var smsCollection = new api.SmsMessageCollection();

        smsCollection.messages = [smsMessage];

        this.smsApi.smsSendPost(smsCollection).then(function(response) {
        if (response.body.http_code = 200) {
            this.status = "success"
        }
        }).catch(function(err){
        console.error(err.body);
        });
    }


}

module.exports = SMSSender




