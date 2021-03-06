const express = require('express')
const router = express.Router()
const client = require('../db.js')
const {Event} = require('../models/event')
const auth = require('../auth')
const flashMsg= require('../flashMessages.js')

router.get("/", auth.checkAuthenticated,  async (req, res) => {
    let repeat_labels
    try {
    // query selects all repeat enum values
        repeat_labels = await client.query('SELECT unnest(enum_range(NULL::repeat))')
    } catch (e) {
        console.error(e)
        console.error('There has been an error while querying all repeat enum values')
        req.flash(flashMsg.generalError.htmlClass, flashMsg.generalError.msg)
        return res.redirect('/events')
    }
    res.render('event/new_event', {repeat: repeat_labels.rows.map(el => el.unnest), existing_event: {}, isAuthenticated: true, isUserPremium: req.user.isPremium, phone: req.user.phone})

})

router.post("/", auth.checkAuthenticated, async (req, res) => {
    if (req.body['remind_days_before_sms']) {
        if (!req.user.isPremium) {
            req.flash('error', 'Only premium users can get SMS reminders')
            return res.redirect('/new_event')
        }

        if (req.body['remind_days_before_sms'].length > 1) {
            req.flash('error', 'Only one sms reminder for one event is allowed')
            return res.redirect('/new_event')
        }

        if (!req.user['phone']) {
            req.flash('error', 'You must set a phone number in the Account tab before adding an SMS reminder')
            return res.redirect('/new_event')
        }

    }
    let event
    try {
        event = new Event({
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