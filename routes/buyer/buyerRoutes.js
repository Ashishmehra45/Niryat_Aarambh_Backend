const express = require("express");
const router = express.Router();
const buyerController = require("../../controller/buyerController/buyerController");

router.get('/products', buyerController.getAllProducts);

module.exports = router;