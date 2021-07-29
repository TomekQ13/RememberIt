const client = require('../db.js')
const uuid = require('uuid')

class Event {
    constructor(params) {
        const required_params = ['user_id', 'name', 'first_date', 'repeat', 'remind_days_before']
        // required_params.map(el => {
        //     if (params[el] == undefined) {
        //         throw `${el} is missing and is required to create new Event object`
        //     }
        // })
        for(var k in params) this[k]=params[k];
        // public_id is generated for new events
        if (params['public_id'] == undefined) {
            this.public_id = uuid.v4()
        }
    }

    async save_reminder() {
        for (const remind_days in this.remind_days_before) {
            await client.query(
                'insert into "reminder" (event_public_id, remind_days_before) values ($1, $2)',
                [this.public_id, remind_days]
            )
            console.log(`Reminder with days ${remind_days} for event with public_id ${this.public_id} saved successfully`)
        }
    }

    async save_event() {
        await client.query(
            'insert into "event" (public_id, user_id, name, first_date, repeat, description) values ($1, $2, $3, $4, $5, $6)',
            [this.public_id, this.user_id, this.name, this.first_date, this.repeat, this.description]
        )
        console.log(`Event with name ${this.name} and public_id ${this.public_id} saved successfully as a new event`)
    }

    async save() {
        await this.save_reminder()        
        await this.save_event()         
    }

    async delete() {
        await client.query('delete from "event" where public_id = $1', [this.public_id])
        console.log(`Event with id ${this.id} deleted successfully`)
    }
}

async function combineEventAndReminders(queryToSelectEvent, queryParams) {
    r = await client.query(queryToSelectEvent, queryParams)
    var event = new Event(r.rows[0])
    event['reminders'] = await client.query('select remind_days_before from "reminder" where event_public_id = $1', [event.public_id]).rows
    return event
}

async function getEventById(id) {
    return combineEventAndReminders('select * from "event" where id =$1 and user_id = $2', [id])
}

async function getEventByPublicId(public_id) {
    return combineEventAndReminders('select * from "event" where public_id =$1', [public_id])
}

async function deleteEventByPublicId(public_id) {
    await client.query('delete from "event" where public_id = $1', [public_id])
}

async function getAllEvents(user_id=undefined) {
    if (user_id) {
        var r = await client.query('select * from "event" where user_id = $1', [user_id])
    } else {
        var r = await client.query('select * from "event"')
    }    
    return r.rows
}

module.exports = {Event, getEventById, getEventByPublicId, deleteEventByPublicId, getAllEvents}