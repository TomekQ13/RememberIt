const express = require('express')
const router = express.Router()
const client = require('../db.js')
const {getEventByPublicId, deleteEventByPublicId, getAllEvents} = require('../models/event')
const auth = require('../auth')
const flashMsg = require('../flashMessages.js')


router.get("/", auth.checkAuthenticated,  async (req, res) => {
    try {
        var events = await getAllEvents(req.user.id)        
    } catch (e) {
        console.error(e)
        req.flash(flashMsg.generalError.htmlClass, flashMsg.generalError.msg)
        return res.redirect('events')
    } 
    return res.render('event/events', {events: events, isAuthenticated: true}) 
})

router.get("/:public_id", auth.checkAuthenticated,  async (req, res) => {
    const event = await getEventByPublicId(req.params.public_id)
    if (event.user_id != req.user.id) {
        req.flash(flashMsg.insufficientPrivileges.htmlClass, flashMsg.insufficientPrivileges.msg)
        return res.redirect('/events')
    }
    
    if (event.length === 0) {
        req.flash('error', 'This event does not exist')
        return res.redirect('/events')
    }
    res.render('event/event', {event: event, isAuthenticated: true})    
})

router.delete("/:public_id", auth.checkAuthenticated,  async (req, res) => {
    try {
        const event = await getEventByPublicId(req.params.public_id)
        if (event.user_id != req.user.id) {
            req.flash(flashMsg.insufficientPrivileges.htmlClass, flashMsg.insufficientPrivileges.msg)
            return res.redirect('/events')
        }
        await deleteEventByPublicId(req.params.public_id)
        console.log(`Event with public id ${req.params.public_id} deleted successfully`)
    } catch (e) {
        req.flash(flashMsg.generalError.htmlClass, flashMsg.generalError.msg)
        return res.redirect('/events')
    }
    req.flash('success', 'Event deleted successfully')
    return res.redirect('/events') 
})

module.exports = router