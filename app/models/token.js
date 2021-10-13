const utils = require('../utils')
const client = require('../db.js')

class Token {
    async generateToken(len, user_id) {
        this.tokenValue = utils.randomString(len)
        try {
            await client.query(`
            insert into "token" (user_id, token_value, valid_to_dttm)
            values ($1, $2, now() + interval '30 day')`,
            [user_id, this.tokenValue])
            console.log(`New token with value ${this.tokenValue} was generated for user with id ${user_id}`)
        } catch (err) {
            console.error('There has been an error while adding a token to the database.')
            console.error(err)
        }
        return this.tokenValue
    }

    async consumeRememberMeToken(token_value, callback_fn) {
        // select a user_id based on a token value
        try {
            var r = await client.query(`
                select user_id
                from "token"
                where token_value = $1
                    and valid_to_dttm >= now()`,
                [token_value]) 
            this.user_id = r.rows[0].user_id 
        } catch (err) {
            console.error('There has been an error while selecting the user_id.')
            console.error(err)
        }
             
       // invalidate the single-use token
        try {
            await client.query(`
                update "token"
                set valid_to_dttm = now() - interval '1 day'
                where token_value = $1`,
                [token_value])
        } catch (err) {
            console.error('There has been an error while invalidating the token.')
            console.error(err)
        }
        console.log(`Consumed a token ${token_value} for user_id = ${this.user_id}.`)
        return callback_fn(null, this.user_id);
    }
}

module.exports = Token
  