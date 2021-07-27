const express = require('express')
const router = express.Router()
const {User, getUserByEmail, getUserById} = require('../models/user')
const bcrypt = require('bcrypt')
const flash = require('express-flash');
const auth = require('../auth')
const passport = require('passport')

router.get("/register", async (req, res) => {
     res.render('user/register')
})

router.post("/register", async (req, res) => { 
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
    res.render('user/login')
})

router.post("/login", auth.checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/user/login',
    failureFlash: true
}));

module.exports = router