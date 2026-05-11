const express = require('express');
const router = express.Router();
const { registerSeller, loginSeller } = require('../../controller/sellerController');

router.post('/register', registerSeller);
router.post('/login', loginSeller);

module.exports = router;