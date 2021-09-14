const { Client } = require('pg')

console.log(`
    user: ${process.env.POSTGRES_USER},
    host: ${process.env.POSTGRES_HOST},
    database: ${process.env.POSTGRES_DATABASE},
    password: ${process.env.POSTGRES_PASSWORD},
    port: ${process.env.POSTGRES_PORT}
`)


const client = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT
})

client.connect()


const res = client.query('select now()').then(res => console.log('Connected to database ' + res.rows[0].now))

async function getReminders(client) {
    const reminders =  await client.query('select * from "occurence" where reminder_date = current_date and sent_dttm is null')
    return reminders.rows    
}

async function updateReminderSentDttm(client, reminderId) {
    await client.query(`update occurence set sent_dttm = now() where id = ${reminderId}`)
    console.log(`sent_dttm updated for reminderId = ${reminderId}`)
}


module.exports = {client, getReminders, updateReminderSentDttm}