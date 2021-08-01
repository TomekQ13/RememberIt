const express = require('express')
const router = express.Router()
const client = require('../db.js')
const {Event} = require('../models/event')
const auth = require('../auth')
const {flashMsg} = require('../flashMessages.js')

router.get("/", auth.checkAuthenticated,  async (req, res) => {
    try {
    // query selects all repeat enum values
        var repeat_labels = await client.query('SELECT unnest(enum_range(NULL::repeat))')
    } catch (e) {
        console.error(e)
        return res.redirect('events')
    }
    res.render('event/new_event', {repeat: repeat_labels.rows.map(el => el.unnest), existing_event: {}})

})

router.post("/",  async (req, res) => {
    try {
        var event = new Event({
            'user_id': req.user.id,
            'name': req.body.name,
            'first_date': req.body.first_date,
            'repeat': req.body.repeat,
            'description': req.body['description'],
            'remind_days_before': req.body.remind_days_before
        })
        await event.save()
    } catch (e) {
        console.error(e)

        return res.redirect('/events')
    }

    return res.redirect(`/events/${event.public_id}`)
})

module.exports = router