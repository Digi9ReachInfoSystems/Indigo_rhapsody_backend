const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middleware/authMiddleware");
router.post("/", roleMiddleware(["User"]), cartController.createCart);
router.put("/update", roleMiddleware(["User"]), cartController.updateQuantity);

router.post("/addItem", roleMiddleware(["User"]), cartController.addItemToCart);
router.post("/", roleMiddleware(["User"]), cartController.deleteItem);
router.get("/getCart/:userId", cartController.getCartForUser);
router.post("/CreateCart", roleMiddleware(["User"]), cartController.upsertCart);

module.exports = router;
