const express = require("express");
const router = express.Router();
const buyerController = require("../../controller/buyerController/buyerController");

router.get('/products', buyerController.getAllProducts);
router.post('/inquiries', buyerController.createInquiry);
router.post('/post-requirements', buyerController.createRequirement);

module.exports = router;