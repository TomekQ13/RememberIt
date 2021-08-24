const {makeTransporter, sendReminder} = require('./mails.js')
const {getReminders} = require('./db.js')

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }  

async function main() {
    const transporter = makeTransporter()
    while (true) {
        const reminders = await getReminders()
        reminders.forEach(el => {
            sendReminder(transporter, el.name, el.date, el.email)
        });
        await sleep(60*100)
    }
}
main()
