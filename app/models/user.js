const client = require('../db.js')

class User {
    constructor(params) {
        if (params['email'] == undefined || params['password'] == undefined) {
            throw 'Email and password are required as arguments to the User class constructor.'
        }
        params.email = params.email.toLowerCase()
        for(var k in params) this[k]=params[k];
    }

    async save() {
        const existingUser = await client.query('select 1 from "user" where email = $1', [this.email])
        // checks if the user is new or already exists
        if (existingUser.rows.length === 0) {
            await client.query('insert into "user" (email, password) values ($1, $2)', [this.email, this.password])
            console.log(`User with email ${this.email} saved successfully as a new user`)
        } else {
            await client.query('update "user" set name = $1, update_dttm = now(), phone = $3 where email = $2', [this.name, this.email, this.phone])
            console.log(`User with email ${this.email} updated successfully`)
        }            
    }

    async delete() {
        await client.query('delete from "user" where email = $1', [this.email])
        console.log(`User with email ${this.email} deleted successfully`)
    }
}

async function getUserById(id) { 
    const r = await client.query('select id, insert_dttm, email, password, name, phone from "user" where id = $1', [id])
    return new User(r.rows[0])
}

async function getUserByEmail(email) {
    const r = await client.query('select id, insert_dttm, email, password, name from "user" where email = $1', [email.toLowerCase()])
    return new User(r.rows[0])
}

async function updatePremiumStatus(user_id) {
    await client.query(`update "user" set premium_valid_to = now() + interval '30 day' where user_id = $1`, [user_id])
}

module.exports = {User, getUserById, getUserByEmail, updatePremiumStatus}