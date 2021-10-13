const express = require("express");
const app = express();
const expressLayouts = require('express-ejs-layouts');
const methodOverride= require('method-override');
app.use(methodOverride('_method'))
const passport = require('passport');
const {User, getUserByEmail} = require('./models/user')
const initializePassport = require('./passport-config');
initializePassport.initialize(
  passport,
  email => getUserByEmail(email));
const flash = require('express-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser')


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
const bodyParser = require('body-parser')
app.use('/subscription/webhook', bodyParser.raw({type: "*/*"}))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
  }));
app.use(flash());
app.use(cookieParser())
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));





const indexRouter = require('./routes/index')
app.use('/', indexRouter)
const userRouter = require('./routes/user')
app.use('/user', userRouter)
const eventRouter = require('./routes/events')
app.use('/events', eventRouter)
const newEventRouter = require('./routes/new_event')
app.use('/new_event', newEventRouter)
const editEventRouter = require('./routes/edit_event')
app.use('/edit_event', editEventRouter)
const subscriptionRouter = require('./routes/subscription')
app.use('/subscription', subscriptionRouter)

app.listen(process.env.PORT || 80, () => {
    console.log("Application started and Listening on port 80");
  });

