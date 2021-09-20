const client = require('../db.js')
const uuid = require('uuid')

class Event {
    constructor(params) {
        const required_params = ['user_id', 'name', 'first_date', 'repeat']
        required_params.map(el => {
            if (params[el] == undefined) {
                throw `${el} is missing and is required to create new Event object`
            }
        })
        for(var k in params) this[k]=params[k];
        // public_id is generated for new events
        if (params['public_id'] == undefined) {
            this.public_id = uuid.v4()
        }
    }

    async saveReminder() {
        for (const remind_days in this.remind_days_before_email) {
            await client.query(
                'insert into "reminder" (event_public_id, remind_days_before, type) values ($1, $2, $3)',
                [this.public_id, this.remind_days_before_email[remind_days], 'email']
            )
            console.log(`Email reminder with days ${this.remind_days_before_email[remind_days]} for event with public_id ${this.public_id} saved successfully`)
        }

        for (const remind_days in this.remind_days_before_sms) {
            await client.query(
                'insert into "reminder" (event_public_id, remind_days_before, type) values ($1, $2, $3)',
                [this.public_id, this.remind_days_before_sms[remind_days], 'sms']
            )
            console.log(`SMS reminder with days ${this.remind_days_before_sms[remind_days]} for event with public_id ${this.public_id} saved successfully`)
        }
    }

    async saveEvent() {
        await client.query(
            'insert into "event" (public_id, user_id, name, first_date, repeat, description) values ($1, $2, $3, $4, $5, $6)',
            [this.public_id, this.user_id, this.name, this.first_date, this.repeat, this.description]
        )
        console.log(`Event with name ${this.name} and public_id ${this.public_id} saved successfully as a new event`)
    }

    async deleteReminder() {
        await client.query(
            'delete from "reminder" where event_public_id = $1',
            [this.public_id]
        )
        console.log(`Reminders for event with public_id ${this.public_id} deleted`)
    }

    async save() {              
        await this.saveEvent()
        await this.saveReminder()
    }

    async updateEvent() {
        await client.query(
            'update "event" set name = $1, description = $2, first_date = $3, repeat = $4 where public_id = $5 ',
            [this.name, this.description, this.first_date, this.repeat, this.public_id]             
        )
        console.log(`Event with name ${this.name} and public_id ${this.public_id} updated successfully`)
        await this.deleteReminder()        
        await this.saveReminder()
    }

    async delete() {
        await client.query('delete from "event" where public_id = $1', [this.public_id])
        console.log(`Event with id ${this.id} deleted successfully`)
    }
}

async function combineEventAndReminders(queryToSelectEvent, queryParams) {
    const raw_results = await client.query(queryToSelectEvent, queryParams)
    var results = raw_results.rows[0]
    const reminders = await client.query('select remind_days_before from "reminder" where event_public_id = $1', [results.public_id])
    results['remind_days_before'] = reminders.rows
    return new Event(results)
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

async function getEventsNextDays(days, user_id) {
    const eventsNextDays = await client.query(
        `select * 
        from next_year_occurences 
        where 
            user_id = $1 
            and event_date <= current_date + interval '1 days' * $2
            and event_date >= current_date`, [user_id, days])
    return eventsNextDays.rows
}

module.exports = {Event, getEventById, getEventByPublicId, deleteEventByPublicId, getAllEvents, getEventsNextDays}