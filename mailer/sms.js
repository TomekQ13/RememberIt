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
        Best regards
        Neverforgetit team
        `
        var smsCollection = new api.SmsMessageCollection();
        smsCollection.messages = [smsMessage];
        try {
            let response = await this.smsApi.smsSendPost(smsCollection)
            if (response.body.http_code = 200) {
                this.status = "success"
                console.log(`SMS about event ${this.args.name} on ${this.args.date} sent successfully`)
            }
        } catch (err) {
            console.error(err)
            console.error(`There has been an error while sending SMS for event ${this.args.name} on ${this.args.date}`)
        }
    }


}

module.exports = SMSSender




