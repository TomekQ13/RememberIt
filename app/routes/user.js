const express = require('express')
const router = express.Router()
const client = require('../db.js')
const bcrypt = require('bcrypt')
const flash = require('express-flash');

router.get("/register", async (req, res) => {
     res.render('user/register')
})

router.post("/register", async (req, res) => { 
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    try {
        await client.query('insert into "user" (email, password) values ($1, $2)', [req.body.email, hashedPassword])
    } catch(e) {
        console.log(e)
        req.flash('error', 'There was an error. Please try again.')
        return res.redirect('/user/register')
    }
    console.log('success')
    // req.flash('success', 'Account created. You can now login.')
    return res.redirect('/user/login')
    
})

router.get("/login", async (req, res) => {
    
})

router.post("/login", async (req, res) => {
    
})

module.exports = router