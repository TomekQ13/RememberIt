const express = require('express')
const router = express.Router()
const client = require('../db.js')

router.get("/", async (req, res) => {
    res.render('index')
    
})

module.exports = router