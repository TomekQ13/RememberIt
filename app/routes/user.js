const express = require('express')
const router = express.Router()
const {User, getUserById} = require('../models/user')
const bcrypt = require('bcrypt')

const auth = require('../auth')
const passport = require('passport')
const initializePassport = require('../passport-config');

router.get("/register", auth.checkNotAuthenticated, async (req, res) => {
     res.render('user/register', {isAuthenticated: false})
})

router.post("/register", auth.checkNotAuthenticated, async (req, res) => { 
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    try {
        const user = new User({
            email: req.body.email,
            password: hashedPassword
        })
        user.save()
    } catch(e) {
        console.log(e)
        req.flash('error', 'There was an error. Please try again.')
        return res.redirect('/user/register')
    }
    req.flash('success', 'Account created. You can now login.')
    return res.redirect('/user/login')
    
})

router.get("/login", auth.checkNotAuthenticated, async (req, res) => {
    res.render('user/login', {isAuthenticated: false})
})

router.post("/login", auth.checkNotAuthenticated, passport.authenticate('local', {
    // successRedirect: '/',
    failureRedirect: '/user/login',
    failureFlash: true
}), async (req, res, next) => {
    // this is a middleware function to issue the token
    if (!req.body.remember_me) {return next()}

    await initializePassport.issueToken(req.user.id, (err, token_value) => {
        if (err) {return next(err)}
        res.cookie('remember_me', token_value, {path: "/", httpOnly: true, maxAge: 86400000*30})
        return next()
    })
}, (req, res) => {
    res.redirect('/')
});

router.get('/logout', auth.checkAuthenticated, (req, res) => {    
    req.logOut();
    res.redirect('/user/login');
});
  
router.get("/account", auth.checkAuthenticated, async (req, res) => {
    const existingUser = await getUserById(req.user.id)
    res.render('user/account', {isAuthenticated: true, phone: existingUser.phone, name: existingUser.name})
})

router.post("/account", auth.checkAuthenticated, async (req, res) => {
    let existingUser = await getUserById(req.user.id)
    existingUser.phone = req.body.phoneNumber
    existingUser.name = req.body.name
    existingUser.save()
    res.redirect("/user/account")
})
module.exports = router