const express = require('express')
const router = express.Router()
const client = require('../db.js')
const {User, getUserByEmail, getUserById} = require('../models/user')

router.get("/", async (req, res) => {
    const r = await client.query('select * from "user"')
    const usr = await getUserByEmail('test@test.com')
    console.log(usr)
    // console.log(r.rows)
    res.render('index')
    
})

module.exports = router