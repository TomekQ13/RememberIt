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
        let d = new Date();
        let n = d.getHours();
        console.log(`Current hour is ${n}`)
        if (n === 22) {
            const reminders = await getReminders()
            reminders.forEach(el => {
                sendReminder(transporter, el.name, el.date, el.email)
            });
        }
        await sleep(60*100)
    }
}
main()
