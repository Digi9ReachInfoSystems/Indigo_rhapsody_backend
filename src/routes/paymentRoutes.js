const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const orderController = require("../controllers/orderController");
const paymentController = require("../controllers/paymentController");
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");

router.post("/createPayment", paymentController.createPaymentDetails);
router.get(
  "/getPaymentDetails/:paymentId",

  paymentController.getPaymentDetails
);
router.get(
  "/transaction/:transactionId",
  paymentController.getPaymentDetailsByTransactionId
);
router.get(
  "/payments",
  authMiddleware,
  roleMiddleware(["Admin"]),
  paymentController.getAllPayments
);
router.put(
  "/updatePaymentDetails/:paymentId",
  paymentController.updatePaymentDetails
);
router.post("/webhook", paymentController.paymentWebhook);

module.exports = router;
