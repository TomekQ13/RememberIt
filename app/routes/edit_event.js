const express = require('express')
const router = express.Router()
const client = require('../db.js')
const {Event, getEventById, getEventByPublicId, deleteEventByPublicId, getAllEvents} = require('../models/event')
const auth = require('../auth')
const {flashMsg} = require('../flashMessages.js')

router.get("/:public_id", auth.checkAuthenticated,  async (req, res) => {
    try {
    // query selects all repeat enum values
        var repeat_labels = await client.query('SELECT unnest(enum_range(NULL::repeat))')
        var existing_event = await getEventByPublicId(req.params.public_id)
    } catch (e) {
        console.error(e)
        return res.redirect('events')
    }
    if (!existing_event.user_id == req.user.id) {
        flashMsg.insufficientPrivileges(req)
        return res.redirect('/events')
    }
    res.render('event/new_event', {repeat: repeat_labels.rows.map(el => el.unnest), existing_event: existing_event})

})

router.post("/:public_id", auth.checkAuthenticated, async (req, res) => {
    // validate if the user making the request is the user who owns the events
    try {
        const existing_event = getEventByPublicId(req.params.public_id)
        if (!existing_event.user_id == req.user.id) {
            flashMsg.insufficientPrivileges(req)
            return res.redirect('/events')
        }
    } catch (e) {
        console.error(e)
        flashMsg.generalError(req)
        return res.redirect('/events')
    }       

    try {
        var event = new Event({
            'public_id': req.params.public_id,
            'user_id': req.user.id,
            'name': req.body.name,
            'first_date': req.body.first_date,
            'repeat': req.body.repeat,
            'description': req.body['description'],
            'remind_days_before': req.body.remind_days_before
        })
        event.updateEvent()
    } catch (e) {
        console.error(e)
        return res.redirect('/events')
    }

    return res.redirect(`/events/${event.public_id}`)
})

module.exports = router