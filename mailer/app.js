const {sendReminder} = require('./mails.js')
const {client} = require('./db.js')

async function getReminders(client) {
    return await client.query('select * from "occurence"')
}