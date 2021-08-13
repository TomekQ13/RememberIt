const nodemailer = require('nodemailer')

function makeTransporter() {
    let transporter = nodemailer.createTransport({
        host: 'mail.privateemail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'contact@neverforgetit.net',
            pass: ''
        }
    })
    return transporter;
}

let info = await transporter.sendMail({
    from: '"Never Forget It!" <contact@neverforgetit.net>', // sender address
    to: "julia.urbaniak@outlook.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Lofki", // plain text body
    html: "<b>Lofki</b>", // html body
    }); 

    console.log("Message sent: %s", info.messageId);


main()