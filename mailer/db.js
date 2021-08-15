const { Client } = require('pg')

const client = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT
})

client.connect()

const res = client.query('select now()').then(res => console.log('Connected to database ' + res.rows[0].now))

module.exports = client