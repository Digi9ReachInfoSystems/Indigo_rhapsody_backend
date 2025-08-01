const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/bannerController");
const multer = require("multer");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middleware/authMiddleware");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/",
  roleMiddleware(["Admin"]),
  upload.single("file"),
  bannerController.createBanner
);

router.get("/", bannerController.getBanners);

router.put(
  "/:bannerId",
  upload.single("file"),
  roleMiddleware(["Admin"]),
  bannerController.updateBanner
);

router.delete(
  "/:bannerId",
  roleMiddleware(["Admin"]),
  bannerController.deleteBanner
);

module.exports = router;
