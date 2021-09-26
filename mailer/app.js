const EmailSender = require('./mails.js')
const SMSSender = require('./sms.js')
const {client, getReminders, updateReminderSentDttm} = require('./db.js')

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  } 

function senderFactory(args) {
    const senderTypes = {
        'sms': new SMSSender(args),
        'email': new EmailSender(args)
    }
    if (args.type in senderTypes) {
        console.log(`For ${args.type} type returning ${senderTypes[args.type].constructor.name}`)
        return senderTypes[args.type]
    } else {
        console.error('Unknown sender type.')
    }
}


async function main() {
    while (true) {
        client.query('call insert_occurences(1)')
        const reminders = await getReminders(client)
        console.log(`Selected  ${reminders.length} reminders`)
        reminders.forEach(async el => {
            console.log(el)
            const sender = senderFactory(el)
            await sender.send().then(() => {
                updateReminderSentDttm(client, el.id)
            }).catch((err) => {
                console.error(err)
            })

        });
        await sleep(10*60*1000)
    }
}
main()
