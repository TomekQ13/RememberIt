const express = require('express')
const router = express.Router()
const client = require('../db.js')
const {Event, getEventById, getEventByPublicId, deleteEventByPublicId, getAllEvents} = require('../models/event')
const auth = require('../auth')

router.get("/", auth.checkAuthenticated,  async (req, res) => {
    try {
    // query selects all repeat enum values
        var repeat_labels = await client.query('SELECT unnest(enum_range(NULL::repeat))')
    } catch (e) {
        console.log(e)
        return res.redirect('events')
    }
    res.render('event/new_event', {repeat: repeat_labels.rows.map(el => el.unnest)})

})

router.post("/", auth.checkAuthenticated, async (req, res) => {
    try {
        var event = new Event({
            'user_id': req.user.id,
            'name': req.body.name,
            'first_date': req.body.first_date,
            'repeat': req.body.repeat,
            'description': req.body['description']
        })
    } catch (e) {
        console.log(e)
        return res.redirect('events')
    }

    try {
        await event.save()
    } catch (e) {
        console.log(e)
        return res.redirect('events')
    }

    return res.redirect(`/events/${event.public_id}`)
})

module.exports = router