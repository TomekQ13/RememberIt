const nodemailer = require('nodemailer')
const {client} = require('./db.js')

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
        await sendEmail(
            to,
            subject,
            text,
            html,
            transporter
        )
        console.log(`Message about event ${eventName} on ${eventDate} sent.`)
    } catch (e) {
        console.log('There was an error while sending the email')
        console.error(e)
    }
}

class EmailSender {
    constructor() {
        this.transporter = makeTransporter()
    }

    async send(eventName, eventDate, to) {
        await sendReminder(this.transporter, eventName, eventDate, to)
    }
}


module.exports = {makeTransporter, sendEmail, sendReminder, EmailSender}


    

