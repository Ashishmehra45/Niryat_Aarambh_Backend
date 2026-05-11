const express = require('express');
const router = express.Router();
const { registerBuyer ,loginBuyer } = require('../../controller/buyerController');


router.post('/register', registerBuyer);
router.post('/login', loginBuyer);

module.exports = router;