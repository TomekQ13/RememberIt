const nodemailer = require('nodemailer')

class Emailer {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'mail.privateemail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'contact@neverforgetit.net',
                pass: process.env.EMAIL_PASS,
            }
        })
    }

    async sendEmail(to, subject, text, html, from='Never Forget It! <contact@neverforgetit.net>',) {
        this.transporter.sendMail({
            from: from, // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: html, // html body
            }); 
    }
}

module.exports = Emailer


    

