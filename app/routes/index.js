const express = require('express')
const router = express.Router()
const client = require('../db.js')
const {User, getUserByEmail, getUserById} = require('../models/user')

router.get("/", async (req, res) => {
    
    res.render('index')
    
})

module.exports = router