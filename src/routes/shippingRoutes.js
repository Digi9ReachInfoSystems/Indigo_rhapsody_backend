const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const shippingController = require("../controllers/shippingController");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middleware/authMiddleware");
const multer = require("multer");
router.post(
  "/createOrder",
  authMiddleware,
  roleMiddleware(["Designer"]),
  shippingController.ship
);
router.post(
  "/generate-invoice",
  authMiddleware,
  roleMiddleware(["Designer"]),
  shippingController.generateInvoice
);
router.post(
  "/generate-manifest",
  authMiddleware,
  roleMiddleware(["Designer"]),
  shippingController.generateManifest
);
router.get(
  "/designer/:designerRef",
  authMiddleware,
  roleMiddleware(["Designer", "Admin"]),
  shippingController.getShippingsByDesignerRef
);
router.post(
  "/rejectRequest",
  authMiddleware,
  roleMiddleware(["Admin"]),

  shippingController.declineReturnRequestForDesigner
);
router.post("/createReturn", authMiddleware, roleMiddleware(["Designer"]), shippingController.createReturnRequestForDesigner);
router.post("/shipping-webhook", shippingController.shippingWebhook);
module.exports = router;
