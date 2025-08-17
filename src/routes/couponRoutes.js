const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
router.get("/searchUser", couponController.searchUsers);
router.post("/", couponController.createCoupon);
router.get("/", couponController.getAllCoupons);
// router.get("/getall", couponController.getAllCouponsAll);
router.get("/:id", couponController.getCouponById);

router.put("/:id", couponController.updateCoupon);
router.delete("/:id", couponController.deleteCoupon);
router.post("/applyCoupon", couponController.applyCouponToCart);
router.post("/particularUser", couponController.createCouponForParticularUser);
router.post(
  "/createCouponForPromotion",
  couponController.createCouponForPromotion
);

router.post("/applyUniversal", couponController.applyCouponUniversal);

module.exports = router;
