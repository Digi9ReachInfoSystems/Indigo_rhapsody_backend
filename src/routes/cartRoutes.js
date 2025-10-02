const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middleware/authMiddleware");
router.post("/", authMiddleware, cartController.createCart);
router.put("/update", authMiddleware, cartController.updateQuantity);

router.post("/addItem", authMiddleware, cartController.addItemToCart);
router.post("/", authMiddleware, cartController.deleteItem);
router.get("/getCart/:userId", authMiddleware, cartController.getCartForUser);
router.post("/CreateCart", authMiddleware, cartController.upsertCart);

// New routes for getting cart ID by user ID
router.get("/cart-id/:userId", authMiddleware, cartController.getCartIdByUserId);
router.get("/cart-details/:userId", authMiddleware, cartController.getCartDetailsByUserId);

module.exports = router;
