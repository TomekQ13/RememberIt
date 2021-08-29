const express = require('express')
const router = express.Router()
const {getEventsNextDays} = require('../models/event')
const auth = require('../auth')

router.get("/", auth.checkAuthenticated, async (req, res) => {
    const events7Days = await getEventsNextDays(7, req.user.id)
    console.log(events7Days)
    res.render('index', {events7Days: events7Days})
    
})

module.exports = router