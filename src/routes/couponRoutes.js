const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const { roleMiddleware } = require("../middleware/authMiddleware");
router.get("/searchUser", couponController.searchUsers);
router.post("/", roleMiddleware(["Admin"]), couponController.createCoupon);
router.get("/", couponController.getAllCoupons);
// router.get("/getall", couponController.getAllCouponsAll);
router.get("/:id", couponController.getCouponById);

router.put("/:id", roleMiddleware(["Admin"]), couponController.updateCoupon);
router.delete("/:id", roleMiddleware(["Admin"]), couponController.deleteCoupon);
router.post(
  "/applyCoupon",
  roleMiddleware(["User"]),
  couponController.applyCouponToCart
);
router.post(
  "/particularUser",
  roleMiddleware(["Admin"]),
  couponController.createCouponForParticularUser
);
router.post(
  "/createCouponForPromotion",
  couponController.createCouponForPromotion
);

router.post("/applyUniversal", couponController.applyCouponUniversal);

module.exports = router;
