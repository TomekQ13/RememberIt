const {makeTransporter, sendReminder} = require('./mails.js')
const {client, getReminders, updateReminderSentDttm} = require('./db.js')

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
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
        await sleep(60*100)
    }
}
main()
