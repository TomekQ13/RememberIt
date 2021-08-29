const express = require('express')
const router = express.Router()
const {getEventsNextDays} = require('../models/event')
const auth = require('../auth')

router.get("/", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/about")
    }

    const events7Days = await getEventsNextDays(7, req.user.id)
    console.log(events7Days)
    res.render('index', {events7Days: events7Days})
    
})

router.get("/about", (req, res) => {
    res.render('about')
})

module.exports = router