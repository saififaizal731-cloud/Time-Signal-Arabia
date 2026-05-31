const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ensure this file exists in your models folder

router.get('/', async (req, res) => {
    try {
        const users = await User.find(); // This queries MongoDB
        res.json(users); // This sends the data as JSON to your browser
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
