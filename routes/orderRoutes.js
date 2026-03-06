const express = require("express");
const { createOrder, getOrderById } = require("../controllers/orderController");

const router = express.Router();

router.post("/order", createOrder);
router.get("/order/:orderId", getOrderById);

module.exports = router;