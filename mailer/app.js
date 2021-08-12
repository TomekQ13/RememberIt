const nodemailer = require('nodemailer')
const Mail = require('nodemailer/lib/mailer')

async function main() {
    let transporter = nodemailer.createTransport({
        host: 'mail.privateemail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'contact@neverforgetit.net',
            pass: ''
        }
    })

    let info = await transporter.sendMail({
        from: '"Never Forget It!" <contact@neverforgetit.net>', // sender address
        to: "kuczak.tomasz@gmail.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
      });

      console.log("Message sent: %s", info.messageId);
}

main()