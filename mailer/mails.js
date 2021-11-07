const nodemailer = require('nodemailer')

function makeTransporter() {
    let transporter = nodemailer.createTransport({
        host: 'mail.privateemail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'contact@neverforgetit.net',
            pass: process.env.EMAIL_PASS,
        }
    })
    return transporter;
}

async function sendEmail(to, subject, text, html, transporter, from = '"Never Forget It!" <contact@neverforgetit.net>') {
    try {
        let r = await transporter.sendMail({
            from: from, // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: html, // html body
            }); 
        console.log("Message sent: %s", r.messageId);
        return r;
    } catch (e) {
        console.log('There was an error while sending the email')
        console.error(e)
    }
}

async function sendReminder(transporter, eventName, eventDate, to) {
    let subject = `Never forget it! ${eventName} is coming.`
    let text = `Hi!
The event ${eventName} is coming on ${eventDate}.
`
    let html = `<h1>Hi!</h1>
<p>The event ${eventName} is coming on ${eventDate}.</p>    
`
    try {
        let r = await sendEmail(
            to,
            subject,
            text,
            html,
            transporter
        )
        console.log(`Message about event ${eventName} on ${eventDate} sent. MessageId: ${r.messageId}`)
    } catch (e) {
        console.log('There was an error while sending the email')
        console.error(e)
    }
}

class EmailSender {
    constructor(args) {
        this.transporter = makeTransporter()
        this.args = args
    }

    async send() {
        try {
            await sendReminder(this.transporter, this.args.name, this.args.date, this.args.email)
            this.status = 'success'
        } catch (err) {
            console.error(err)
            console.log(`There has been an error while sending an email to ${this.args.email}`)
        }
        

    }
}


module.exports = EmailSender


    

