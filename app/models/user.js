const client = require('../db.js')
const {randomString, isDatetimeAfterNow} = require('../utils')
const Emailer = require('../mails')

class User {
    constructor(params) {
        if (params['email'] == undefined || params['password'] == undefined) {
            throw 'Email and password are required as arguments to the User class constructor.'
        }
        params.email = params.email.toLowerCase()
        for(var k in params) this[k]=params[k];

        if (params['premium_valid_to']) {
            this.isPremium = isDatetimeAfterNow(params.premium_valid_to)
        }

        if (params['reset_password_token']) {
            this.isResetPasswordTokenValid = isDatetimeAfterNow(params.reset_password_token_dttm)
        }
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

    async saveResetPasswordToken(token) {
        try {
            await client.query(`
                update "user"
                set reset_password_token = $1, reset_password_token_dttm = now() + interval '1 hour' 
                where id = $2`, [token, this.id]
            )
            console.log(`Reset password token succesfully generated for user with id ${this.id}`)
        } catch (err) {
            console.error(`There has been an error while saving the reset password token for user with id ${this.id}`)
            console.error(err)
        }   
    }

    async changePassword(newPassword) {
        try {
            await client.query(`
                update "user"
                set password = $1
                where id = $2
            `, [newPassword, this.id])
        console.log(`Password changed successfully for user with id ${this.id}`)
        } catch (err) {
            console.error(`There has been an error while changing the password for user with id ${this.id}`)
            console.error(err)
        }
    }

    async sendResetPasswordEmail() {        
        const resetPasswordToken = randomString(64)
        let resetPasswordLink = new URL(process.env.STRIPE_DOMAIN + '/user/password_reset')
        resetPasswordLink.searchParams.set('email', this.email)
        resetPasswordLink.searchParams.set('token', resetPasswordToken)
        let name;
        if (this.name) {
            name = ' ' + this.name
        } else {
            name = ''
        }

        const body_text = `
        Hi${name},
        
        If you need to reset your password click here: ${resetPasswordLink}
        If the link does not work copy it and paste into the browser. The link is valid for 60 minutes from the time it has been sent. If the link is no longer valid you can generate a new one.

        If you did not make this request then ignore this email and no changes will be made.

        Best regards
        Never forget it team
        `
        const body_html = `
        <h3>Hi${name},</h3>
        <p>
        If you need to reset your password click here: <a href="${resetPasswordLink}">Reset password</a><br>
        If the link does not work copy it and paste into the browser. The link is valid for 60 minutes from the time it has been sent. If the link is no longer valid you can generate a new one.
        </p>
        <p>
        If you did not make this request then ignore this email and no changes will be made.
        </p>
        <p>
        Best regards<br>
        Never forget it team
        </p>
        `        
        await this.saveResetPasswordToken(resetPasswordToken)

        const emailer = new Emailer()
        await emailer.sendEmail(
            this.email,
            'Password reset',
            body_text,
            body_html
        )
    }
}

async function getUserById(id) { 
    const r = await client.query('select id, insert_dttm, email, password, name, phone, premium_valid_to, stripe_customer_id, reset_password_token, reset_password_token_dttm from "user" where id = $1', [id])
    return new User(r.rows[0])
}

async function getUserByEmail(email) {
    const r = await client.query('select id, insert_dttm, email, password, name, premium_valid_to, stripe_customer_id, reset_password_token, reset_password_token_dttm from "user" where email = $1', [email.toLowerCase()])
    return new User(r.rows[0])
}

async function updatePremiumStatus(stripe_customer_id) {
    try {
        await client.query(`update "user" set premium_valid_to = now() + interval '1 month' + interval '1 day' where stripe_customer_id = $1 and stripe_customer_id is not null`, [stripe_customer_id])
        console.log(`Premium status updated for user with stripe_customer_id = ${stripe_customer_id}`)
    } catch (err) {
        console.error(`There was an error with updating premium status for user with stripe_customer_id = ${stripe_customer_id}`)
        console.error(err)
    }
    
}

async function saveStripeCustomerId(user_id, stripe_customer_id) {
    try {
        await client.query(`update "user" set stripe_customer_id = $1 where id = $2`, [stripe_customer_id, user_id])
        console.log(`Stripe_customer_id ${stripe_customer_id} was assigned to user with id ${user_id}`)
    } catch (err) {
        console.error(`There was an error with assigning stripe_customer_id ${stripe_customer_id} to user with id ${user_id}`)
        console.error(err)
    }
    
}

module.exports = {User, getUserById, getUserByEmail, updatePremiumStatus, saveStripeCustomerId}