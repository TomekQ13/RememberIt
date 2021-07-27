const client = require('../db.js')
const uuid = require('uuid')

class Event {
    constructor(params) {
        const required_params = [user_id, name, first_date, repeat]
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

    async save() {
        await client.query(
            'insert into "event" (public_id, user_id, name, first_date, repeat, description) values ($1, $2)',
            [this.public_id, this.user_id, this.name, this.first_date, this.repeat, this.description]
        )
        console.log(`Event with name ${this.name} and public_id ${this.public_id} saved successfully as a new event`)
          
    }

    async delete() {
        await client.query('delete from "event" where id = $1', [this.id])
        console.log(`Event with id ${this.id} deleted successfully`)
    }
}

async function getEventById(id) {
    r = await client.query(`select * from "event" where id =${id}`)
    return new Event(r.rows[0])
}

async function getEventByPublicId(public_id) {
    r = await client.query(`select * from "event" where public_id =${public_id}`)
    return new Event(r.rows[0])
}

async function deleteEventByPublicId(public_id) {
    await client.query(`delete from "event" where public_id = ${public_id}`)
}

async function getAllEvents() {
    r = await client.query('select * from "event"')
    return r.rows
}

module.exports = {Event, getEventById, getEventByPublicId, deleteEventByPublicId, getAllEvents}