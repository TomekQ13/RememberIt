const express = require('express')
const router = express.Router()
const client = require('../db.js')
const {Event} = require('../models/event')
const auth = require('../auth')
const flashMsg= require('../flashMessages.js')

router.get("/", auth.checkAuthenticated,  async (req, res) => {
    try {
    // query selects all repeat enum values
        var repeat_labels = await client.query('SELECT unnest(enum_range(NULL::repeat))')
    } catch (e) {
        console.error(e)
        console.error('There has been an error while querying all repeat enum values')
        req.flash(flashMsg.generalError.htmlClass, flashMsg.generalError.msg)
        return res.redirect('events')
    }
    res.render('event/new_event', {repeat: repeat_labels.rows.map(el => el.unnest), existing_event: {}, isAuthenticated: true})

})

router.post("/", auth.checkAuthenticated, async (req, res) => {
    console.log(req.body)
    try {
        var event = new Event({
            'user_id': req.user.id,
            'name': req.body.name,
            'first_date': req.body.first_date,
            'repeat': req.body.repeat,
            'description': req.body['description'],
            'remind_days_before_email': req.body['remind_days_before_email'],
            'remind_days_before_sms': req.body['remind_days_before_sms']
        })
        await event.save()
    } catch (e) {
        req.flash(flashMsg.generalError.htmlClass, flashMsg.generalError.msg)
        console.error(e)
        console.error('There has been an error while creating new event')
        return res.redirect('/events')
    }
    req.flash(flashMsg.createdSuccessfully.htmlClass,flashMsg.createdSuccessfully.msg('Event'))
    return res.redirect(`/events/${event.public_id}`)
})

module.exports = router