const express = require('express')
const router = express.Router()
const {getEventsNextDays} = require('../models/event')
const auth = require('../auth')
const flashMsg = require('../flashMessages.js')
const flash = require('express-flash')

router.get("/", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/about")
    }
    let events7Days
    try {
        events7Days = await getEventsNextDays(7, req.user.id)        
    } catch (err) {
        req.flash(flashMsg.generalError.htmlClass, flashMsg.generalError.msg)
        console.error(err)
        console.error(`There has been an error with reading events in the next 7 days for user with id ${req.user.id}`)
        res.redirect('/about')
    } 

    res.render('index', {events7Days: events7Days, isAuthenticated: req.isAuthenticated()})    
})

router.get("/about", (req, res) => {
    res.render('about', {isAuthenticated: req.isAuthenticated()})
})

module.exports = router