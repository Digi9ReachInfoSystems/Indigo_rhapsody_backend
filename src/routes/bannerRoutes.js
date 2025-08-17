const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/bannerController");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("file"), bannerController.createBanner);

router.get("/", bannerController.getBanners);

router.put("/:bannerId", upload.single("file"), bannerController.updateBanner);

router.delete("/:bannerId", bannerController.deleteBanner);

module.exports = router;
