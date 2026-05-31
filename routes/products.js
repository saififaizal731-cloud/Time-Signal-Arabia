const express = require('express');
const router = express.Router();
router.get('/', (req, res) => res.send('Users route working')); // Change 'Users' to 'Cart' or 'Orders' for those files
module.exports = router;
