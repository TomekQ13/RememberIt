const {makeTransporter, sendReminder, SMSSender} = require('./mails.js')
const {EmailSender} = require('./sms.js')
const {client, getReminders, updateReminderSentDttm} = require('./db.js')

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  } 

function senderFactory(senderType) {
    senderTypes = {
        'sms': new SMSSender(),
        'email': new EmailSender()
    }
    if (senderType in senderTypes) {
        return senderType[senderType]
    } else {
        console.error('Unknown sender type.')
    }
}


async function main() {
    const transporter = makeTransporter()
    while (true) {
        await client.query('call insert_occurences(1)')
        const reminders = await getReminders(client)
        console.log(`Selected  ${reminders.length} reminders`)
        reminders.forEach(async el => {
            await sendReminder(transporter, el.name, el.date, el.email)
            await updateReminderSentDttm(client, el.id)

        });
        await sleep(10*60*1000)
    }
}
main()
