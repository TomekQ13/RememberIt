const express = require("express");
const app = express();
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const {User, getUserByEmail, getUserById} = require('./models/user')
const initializePassport = require('./passport-config');
initializePassport(
  passport,
  email => getUserByEmail(email));
const flash = require('express-flash');
const session = require('express-session');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
  }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());



const indexRouter = require('./routes/index')
app.use('/', indexRouter)
const userRouter = require('./routes/user')
app.use('/user', userRouter)
const eventRouter = require('./routes/events')
app.use('/events', eventRouter)
const new_eventRouter = require('./routes/new_event')
app.use('/new_event', new_eventRouter)

app.listen(process.env.PORT || 3000, () => {
    console.log("Application started and Listening on port 3000");
  });

