const client = require('../db.js')

class User {
    constructor(params) {
        if (params['email'] == undefined || params['password'] == undefined) {
            throw 'Email and password are required as arguments to the User class constructor.'
        }
        this.email = params.email.toLowerCase()
        this.password = params.password
        this.id = params['id']
        this.insert_dttm = params['insert_dttm']
        this.name = params['name']
    }

    async save() {
        const existingUser = await client.query('select 1 from "user" where email = $1', [this.email])
        // checks if the user is new or already exists
        if (existingUser.rows.length === 0) {
            await client.query('insert into "user" (email, password) values ($1, $2)', [this.email, this.password])
            console.log(`User with email ${this.email} saved successfully as a new user`)
        } else {
            await client.query('update "user" set password = $1, name = $2, update_dttm = now() where email = $3', [this.password, this.name, this.email])
            console.log(`User with email ${this.email} updated successfully`)
        }            
    }

    async delete() {
        await client.query('delete from "user" where email = $1', [this.email])
        console.log(`User with email ${this.email} deleted successfully`)
    }
}

async function getUserById(id) { 
    const r = await client.query('select id, insert_dttm, email, password, name from "user" where id = $1', [id])
    return new User(r.rows[0])
}

async function getUserByEmail(email) {
    const r = await client.query('select id, insert_dttm, email, password, name from "user" where email = $1', [email.toLowerCase()])
    return new User(r.rows[0])
}

module.exports = {User, getUserById, getUserByEmail}