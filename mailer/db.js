const { Client } = require('pg')

const client = new Client({
    user: process.env.POSTGRES_RW_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_RW_PASSWORD,
    port: process.env.POSTGRES_PORT
})

client.connect()


const res = client.query('select now()').then(res => console.log('Connected to database ' + res.rows[0].now))

async function getReminders(client) {
    const reminders =  await client.query(`
    select 
        id,
        public_id,
        "name",
        description,
        date,
        type,
        email,
        phone
    from "occurence" 
    where 
        reminder_date = current_date 
        and sent_dttm is null
        and type = 'email'`)
    return reminders.rows    
}

function updateReminderSentDttm(client, reminderId) {
    client.query(`update occurence set sent_dttm = now() where id = ${reminderId}`).then(() => {
        console.log(`sent_dttm updated for reminderId = ${reminderId}`)
    }).catch((err) => {
        console.error(err)
    })
    
}


module.exports = {client, getReminders, updateReminderSentDttm}