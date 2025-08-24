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
  authMiddleware,
  roleMiddleware(["Admin"]),
  upload.single("file"),
  bannerController.createBanner
);

router.get("/", bannerController.getBanners);

router.put(
  "/:bannerId",
  authMiddleware,
  upload.single("file"),
  roleMiddleware(["Admin"]),
  bannerController.updateBanner
);

router.delete(
  "/:bannerId",
  authMiddleware,
  roleMiddleware(["Admin"]),
);

module.exports = router;
