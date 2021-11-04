const client = require('../db.js')
const {isDatetimeAfterNow} = require('../utils')
const Emailer = require('../mails')
const passwordResetEmail = require('../mails/password_reset.js')
const emailVerificationEmail = require('../mails/email_verification.js')
const Token = require('./token.js')

class User {
    constructor(params) {
        if (params['email'] == undefined || params['password'] == undefined) {
            throw 'Email and password are required as arguments to the User class constructor.'
        }
        params.email = params.email.toLowerCase()
        for(var k in params) this[k]=params[k];

        this.isPremium = false
        if (params['premium_valid_to']) {
            this.isPremium = isDatetimeAfterNow(params.premium_valid_to)
        }

        if (params['reset_password_token']) {
            this.isResetPasswordTokenValid = isDatetimeAfterNow(params.reset_password_token_dttm)
        }

        if (params['email_verified_token']) {
            this.isEmailVerifiedTokenValid = isDatetimeAfterNow(params.email_verified_token_dttm)
        }
    }

    async saveUserToDatabase() {
        try {
            await client.query('insert into "user" (email, password) values ($1, $2)', [this.email.toLowerCase(), this.password])
            console.log(`User with email ${this.email} saved successfully as a new user`) 
        } catch (err) {
            console.error('An error encountered while saving a user to the database')
            console.error(err)
        }
    }

    async save() {
        const existingUser = getUserByEmail(this.email.toLowerCase())
        // checks if the user is new or already exists
        if (!existingUser) {
            await client.query('insert into "user" (email, password) values ($1, $2)', [this.email.toLowerCase(), this.password])
            console.log(`User with email ${this.email} saved successfully as a new user`)
        } else {
            await client.query('update "user" set name = $1, update_dttm = now(), phone = $3 where email = $2', [this.name, this.email.toLowerCase(), this.phone])
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

    async saveEmailVerificationToken(token) {
        try {
            await client.query(`
                update "user"
                set email_verified_token = $1, email_verified_token_dttm = now() + interval '30 day' 
                where email = $2`, [token, this.email]
            )
            console.log(`Email verification token succesfully generated for user with email ${this.email}`)
        } catch (err) {
            console.error(`There has been an error while saving theemail verification token for user with id ${this.email}`)
            console.error(err)
        }   
    }

    async sendResetPasswordEmail() {        
        const resetPasswordToken = (new Token(64)).tokenValue
        let resetPasswordLink = new URL(process.env.STRIPE_DOMAIN + '/user/password_reset')
        resetPasswordLink.searchParams.set('email', this.email)
        resetPasswordLink.searchParams.set('token', resetPasswordToken)
        
        await this.saveResetPasswordToken(resetPasswordToken)
        const email = new passwordResetEmail(this.name, resetPasswordLink.href)
        const emailer = new Emailer()
        await emailer.sendEmail(
            this.email,
            passwordResetEmail.subject,
            email.text,
            email.html
        )
    }

    async sendEmailVerificationEmail() {
        const verifyEmailToken = (new Token(64)).tokenValue
        let verifyEmailLink = new URL(process.env.STRIPE_DOMAIN + '/user/verify_email')
        verifyEmailLink.searchParams.set('email', this.email)
        verifyEmailLink.searchParams.set('token', verifyEmailToken)

        await this.saveEmailVerificationToken(verifyEmailToken)
        const email = new emailVerificationEmail(verifyEmailLink.href)
        const emailer = new Emailer()
        await emailer.sendEmail(
            this.email,
            emailVerificationEmail.subject,
            email.text,
            email.html
        )
    }

    async verifyEmail() {
        if (this.email_verified) return console.log(`User with user id ${this.id} is already verified. No further actions taken`)
        try {
            await client.query(`
                update "user"
                set email_verified = true
                where id = $1
            `, [this.id])
            console.log(`Email verified successfully for user with id ${this.id}`)
        } catch (err) {
            console.error(`There has been an error while verifying an email for the user with id ${this.id}`)
            console.error(err)
        }    
    }
}

function getUserBy(attributeName,
     userAttributes='id, insert_dttm, email, password, name, phone, premium_valid_to, stripe_customer_id, reset_password_token, reset_password_token_dttm, email_verified, email_verified_token, email_verified_token_dttm') {
    return async (attributeValue) => {
        let r
        try {
            r = await client.query('select ' + userAttributes + ' from "user" where ' + attributeName +' = $1', [attributeValue])        
        } catch (err) {
            console.error(`There has been an error while looking for user using ${attributeName} ${id}`)
            console.error(err)
        } 
        if (r.rows.length > 0) return new User(r.rows[0])
        return null    
    }
}

getUserById = getUserBy('id')
getUserByEmail = getUserBy('email')


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