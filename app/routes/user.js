const express = require('express')
const router = express.Router()
const {User, getUserById, getUserByEmail} = require('../models/user')
const bcrypt = require('bcrypt')

const auth = require('../auth')
const passport = require('passport')
const initializePassport = require('../passport-config');


router.get("/register", auth.checkNotAuthenticated, async (req, res) => {
     res.render('user/register', {isAuthenticated: false})
})

router.post("/register", auth.checkNotAuthenticated, async (req, res) => {
    const user_check = getUserByEmail(req.body.email)
    if (user_check)
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    try {
        const user = new User({
            email: req.body.email.toLowerCase(),
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

    await initializePassport.issueToken(req.user, (err, token_value) => {
        if (err) {return next(err)}
        res.cookie('remember_me', token_value, {path: "/", httpOnly: true, maxAge: 86400000*30})
        return next()
    })
}, (req, res) => {
    res.redirect('/')
});

router.get('/logout', auth.checkAuthenticated, (req, res) => {    
    res.clearCookie('remember_me');
    req.logOut();
    res.redirect('/user/login');
});
  
router.get("/account", auth.checkAuthenticated, async (req, res) => {
    const existingUser = await getUserById(req.user.id)
    res.render('user/account', {
        isAuthenticated: true,
        phone: existingUser.phone,
        name: existingUser.name,
        isPremium: existingUser.isPremium,
        premiumValidTo: existingUser['premium_valid_to']
    })
})

router.post("/account", auth.checkAuthenticated, async (req, res) => {
    let existingUser = await getUserById(req.user.id)
    existingUser.phone = req.body.phoneNumber
    existingUser.name = req.body.name
    existingUser.save()
    res.redirect("/user/account")
})

router.get('/request_password_reset', auth.checkNotAuthenticated, async (req, res) => {
    res.render('user/request_password_reset', {isAuthenticated: false})
})

router.post('/request_password_reset', auth.checkNotAuthenticated, async (req, res) => {
    const user = await getUserByEmail(req.body.email)
    if (user) {
        await user.sendResetPasswordEmail()
    }
    //flash message that if the email was found the reset password email was sent
    res.redirect('/user/login')
})

router.get('/password_reset', auth.checkNotAuthenticated, async (req, res) => {
    if (!req.query['email'] || !req.query['token']) {
        // the link was incorrect, make sure that you click the link in the email. Please try again. If this problem keeps occuring contact support.
        return res.redirect('/user/login')
    }

    const user = await getUserByEmail(req.query.email)
    if (req.query.token != user.reset_password_token) {
        // flash token is invalid - please try again
        return res.redirect('/user/login')
    }  

    res.render('user/password_reset', {email: req.query.email, token: req.query.token, isAuthenticated: false})
})

router.post('/password_reset', auth.checkNotAuthenticated, async (req, res) => {
    if (!req.query['email'] || !req.query['token']) {
        // the link was incorrect, make sure that you click the link in the email. Please try again. If this problem keeps occuring contact support.
        return res.redirect('/user/login')
    }

    if (req.body.password != req.body.repeat_password) {
        // flash message that the password must be equal
        return res.render('user/password_reset', {isAuthenticated: false})
    }

    const user = await getUserByEmail(req.query.email)
    if (req.query.token != user.reset_password_token || !user.isResetPasswordTokenValid) {
        // flash token is invalid - please try again
        return res.redirect('/user/login')
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await user.changePassword(hashedPassword)
    // flash password change successfully

    return res.redirect('/user/login')
})

router.get('/verify_email', auth.checkNotAuthenticated, async (req, res) => {
    if (!req.query['email'] || !req.query['token']) {
        // the link was incorrect, make sure that you click the link in the email. Please try again. If this problem keeps occuring contact support.
        return res.redirect('/user/login')
    }

    const user = await getUserByEmail(req.query.email)
    if (req.query.token != user.email_verified_token || !user.isEmailVerifiedTokenValid) {
        // flash token is invalid - please try again
        return res.redirect('/user/login')
    }

    user.verifyEmail()
    // flash email verified successfully
    res.redirect('/user/login')
})
module.exports = router