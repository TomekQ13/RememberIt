const express = require('express')
const router = express.Router()
const {User, getUserById, getUserByEmail} = require('../models/user')
const bcrypt = require('bcrypt')
const flashMsg = require('../flashMessages')

const auth = require('../auth')
const passport = require('passport')
const initializePassport = require('../passport-config');
const flash = require('express-flash')


router.get("/register", auth.checkNotAuthenticated, async (req, res) => {
     res.render('user/register', {isAuthenticated: false})
})

router.post("/register", auth.checkNotAuthenticated, async (req, res) => {
    const user_check = await getUserByEmail(req.body.email.toLowerCase())
    if (user_check) {
        req.flash('error', 'User with this email address already exists')
        return res.redirect('/user/register')        
    }

    if (req.body.password.length < 8) {
        req.flash('error', 'Password must be 8 characters or longer')
        return res.redirect('/user/register')   
    }

    if (req.body.password != req.body.repeat_password) {
        req.flash('error', 'Passwords must be the same')
        return res.redirect('/user/register')   
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    try {
        const user = new User({
            email: req.body.email.toLowerCase(),
            password: hashedPassword
        })
        await user.saveUserToDatabase()
        await user.sendEmailVerificationEmail()
    } catch(e) {
        console.error(e)
        console.error(`There has been an error while creating a user for email ${req.body.email}`)
        req.flash(flashMsg.generalError.htmlClass, flashMsg.generalError.msg)
        return res.redirect('/user/register')
    }
    req.flash('success', 'Account created. Verification email has been sent. You will be able to login after verifying the email.')
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
    if (!req.body.remember_me) return next()
    try {
        await initializePassport.issueToken(req.user, (err, token_value) => {
            if (err) {return next(err)}
            res.cookie('remember_me', token_value, {path: "/", httpOnly: true, maxAge: 86400000*30})
            return next()
        })
    } catch (err) {
        console.error(err)
        console.error('There has been an error while issuing a token')
        req.flash(flashMsg.generalError.htmlClass, flashMsg.generalError.msg)
        res.redirect('/')
    }

}, (req, res) => {
    res.redirect('/')
});

router.get('/logout', auth.checkAuthenticated, (req, res) => {    
    res.clearCookie('remember_me');
    req.logOut();
    res.redirect('/user/login');
});
  
router.get("/account", auth.checkAuthenticated, async (req, res) => {
    try {
        const existingUser = await getUserById(req.user.id)
    } catch (err) {
        console.error(err)
        console.error(`There has been an error while getting account details information for user with id ${req.user.id}`)
        req.flash(flashMsg.generalError.htmlClass, flashMsg.generalError.msg)
        res.redirect('/')
    }    
    res.render('user/account', {
        isAuthenticated: true,
        phone: existingUser.phone,
        name: existingUser.name,
        isPremium: existingUser.isPremium,
        premiumValidTo: existingUser['premium_valid_to']
    })
})

router.post("/account", auth.checkAuthenticated, async (req, res) => {
    try {
        let existingUser = await getUserById(req.user.id)
        existingUser.phone = req.body.phoneNumber
        existingUser.name = req.body.name
        existingUser.save()
    } catch(err) {
        console.error(err)
        console.error(`There has been an error while updating account details information for user with id ${req.user.id}`)
        req.flash(flashMsg.generalError.htmlClass, flashMsg.generalError.msg)
        res.redirect('/user/account')
    }
    res.redirect("/user/account")
})

router.get('/request_password_reset', auth.checkNotAuthenticated, async (req, res) => {
    res.render('user/request_password_reset', {isAuthenticated: false})
})

router.post('/request_password_reset', auth.checkNotAuthenticated, async (req, res) => {
    try {
        const user = await getUserByEmail(req.body.email)
        if (user) {
            await user.sendResetPasswordEmail()
        }
    } catch (err) {
        console.error(err)
        console.error(`There has been an error while sending reset password email for email ${req.user.id}`)
        req.flash(flashMsg.generalError.htmlClass, flashMsg.generalError.msg)
        res.redirect('/')
    }
    req.flash('success', 'If there is a user with this email, a message with reset password link was sent.')
    res.redirect('/user/login')
})

router.get('/password_reset', auth.checkNotAuthenticated, async (req, res) => {
    if (!req.query['email'] || !req.query['token']) {
        // the link was incorrect, make sure that you click the link in the email. Please try again. If this problem keeps occuring contact support.
        return res.redirect('/user/login')
    }
    try {
        const user = await getUserByEmail(req.query.email)
        if (req.query.token != user.reset_password_token) {
            // flash token is invalid - please try again
            return res.redirect('/user/login')
        } 
    } catch (err) {
        console.error(err)
        console.error(`There has been an error while getting a user by email ${req.query.email}`)
        req.flash(flashMsg.generalError.htmlClass, flashMsg.generalError.msg)
        res.redirect('/')
    }
    res.render('user/password_reset', {email: req.query.email, token: req.query.token, isAuthenticated: false})
})

router.post('/password_reset', auth.checkNotAuthenticated, async (req, res) => {
    if (!req.query['email'] || !req.query['token']) {
        req.flash('error', 'The link was incorrect, make sure that you click the link in the email. Please try again. If this problem keeps occuring contact support.')
        return res.redirect('/user/login')
    }

    if (req.body.password != req.body.repeat_password) {
        req.qflash('error', 'Password must be the same')
        return res.render('user/password_reset', {isAuthenticated: false})
    }
    try {
        const user = await getUserByEmail(req.query.email)
        if (req.query.token != user.reset_password_token || !user.isResetPasswordTokenValid) {
            req.flash('error', 'Token is inavlid. Please try again.')
            return res.redirect('/user/login')
        }
    
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await user.changePassword(hashedPassword)
        req.flash('success', 'Password changed successfully')
    } catch (err) {
        console.error(err)
        console.error(`There has been an error while changing the password for user with id ${req.user.id}`)
        req.flash(flashMsg.generalError.htmlClass, flashMsg.generalError.msg)
        res.redirect('/user/login')
    }
    return res.redirect('/user/login')
})

router.get('/verify_email', auth.checkNotAuthenticated, async (req, res) => {
    if (!req.query['email'] || !req.query['token']) {
        req.flash('error', 'The link was incorrect, make sure that you click the link in the email. Please try again. If this problem keeps occuring contact support.')
        return res.redirect('/user/login')
    }
    try {
        const user = await getUserByEmail(req.query.email)
        if (req.query.token != user.email_verified_token || !user.isEmailVerifiedTokenValid) {
            // flash token is invalid - please try again
            return res.redirect('/user/login')
        }    
        user.verifyEmail()
        req.flash('succsess', 'Email verified successfully')
    } catch (err) {
        console.error(err)
        console.error(`There has been an error while verifyin email for email ${req.user.id}`)
        req.flash(flashMsg.generalError.htmlClass, flashMsg.generalError.msg)
        res.redirect('/')
    }
    res.redirect('/user/login')
})
module.exports = router