const localStrategy = require('passport-local').Strategy
const RemeberMeStrategy = require('passport-remember-me').Strategy
const bcrypt = require('bcrypt')
const {User, getUserByEmail, getUserById} = require('./models/user')
const Token = require('./models/token')

function initialize(passport, getUserByEmail) {
    const authenticateUser = async (email, password, done) => {
        const user = await getUserByEmail(email);
        if (user == null) {return done(null, false, {message: 'This user does not exist'})};
        if (user.email_verified == false) {return done(null, false, {message: 'Email not verified'})};
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user, {message: 'Logged in successfully'});                
            } else {
                return done(null, false, {message: 'Incorrect password'});
            }
        } catch (e) {
            return done(e);
        };
    };

    passport.use(new localStrategy({ usernameField: 'email', passwordField: 'password' }, authenticateUser));
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await getUserById(id)
            done(null, user)
        } catch (e) {
            done(null, false, {error:e})
        }
    });

    passport.use(new RemeberMeStrategy(
        async function(token_value, done) {
            const token = new Token()
            await token.consumeRememberMeToken(token_value, async function(err, id) {
                if (err) {return done(err)}
                if (!id) {return done(null, false)}
                try {
                    var user = await getUserById(id)
                } catch (err) {
                    return done(err)
                }
                if (!user) {return done(null, false)}
                return done(null, user)
                
            })
        }, issueToken
    ))
};

// here is a problem for some reason when this is called it gets the whole user object
async function issueToken(user, done) {
    const token = new Token(64)
    const token_value = await token.saveTokenToDB(user.id)
    return done(null, token_value)
}

module.exports = {initialize, issueToken}