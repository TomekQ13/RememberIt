const express = require('express')
const router = express.Router()
const client = require('../db.js')
const {Event, getEventById, getEventByPublicId, deleteEventByPublicId, getAllEvents} = require('../models/event')
const auth = require('../auth')


router.get("/", auth.checkAuthenticated,  async (req, res) => {
    try {
        var events = await getAllEvents()        
    } catch (e) {
        console.log(e)
        req.flash('error', 'There was an error. Please try again.')
        return res.redirect('events')
    } 
    return res.render('event/events', {events: events}) 
})

router.get("/:public_id", auth.checkAuthenticated,  async (req, res) => {
    console.log(req.params.public_id)
    const event = await getEventByPublicId(req.params.public_id)
    
    if (event.length === 0) {
        req.flash('error', 'This event does not exist')
        return res.redirect('/events')
    }
    res.render('event/event', {event: event})    
})

router.delete("/:public_id", auth.checkAuthenticated,  async (req, res) => {
    try {
        await deleteEventByPublicId(req.params.public_id)
    } catch (e) {
        req.flash('error', 'There was an error. Please try again.')
        return res.redirect('/events')
    }
    req.flash('success', 'Event deleted successfully')
    return res.redirect('/events') 
})

module.exports = router