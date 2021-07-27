const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const {User, getUserByEmail, getUserById} = require('./models/user')

function initialize(passport, getUserByEmail) {
    const authenticateUser = async (email, password, done) => {
        const user = await getUserByEmail(email);
        if (user == null) {return done(null, false, {message: 'This user does not exist'})};
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
};

module.exports = initialize