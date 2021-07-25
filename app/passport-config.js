const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

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

    passport.use(new localStrategy({ usernameField: 'username', passwordField: 'password' }, authenticateUser));
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    passport.deserializeUser((_id, done) => {
        User.findById( _id, (err, user) => {
          if(err){
              done(null, false, {error:err});
          } else {
              done(null, user);
          }
        });
    });
};

module.exports = initialize