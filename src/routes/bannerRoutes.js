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

// ==================== PUBLIC ROUTES ====================

// Debug endpoint (must be before other routes)
router.get("/debug/all", bannerController.getAllBannersDebug);

// Get banners by page (must be before /:bannerId to avoid route conflict)
router.get("/page/:pageName", bannerController.getBannersByPage);

// Get banners by platform (must be before /:bannerId to avoid route conflict)
router.get("/platform/:platform", bannerController.getBannersByPlatform);

// Get all banners (with filters)
router.get("/", bannerController.getBanners);

// Get single banner by ID
router.get("/:bannerId", bannerController.getBannerById);

// Track banner click (public)
router.post("/:bannerId/click", bannerController.trackBannerClick);

// Track banner impression (public)
router.post("/:bannerId/impression", bannerController.trackBannerImpression);

// ==================== ADMIN ONLY ROUTES ====================

// Reorder banners (must be before /:bannerId routes to avoid conflict)
router.post(
  "/reorder",
  authMiddleware,
  bannerController.reorderBanners
);

// Create new banner
router.post(
  "/",
  authMiddleware,
  bannerController.createBanner
);

// Get banner analytics (specific route before general /:bannerId)
router.get(
  "/:bannerId/analytics",
  authMiddleware,
  bannerController.getBannerAnalytics
);

// Toggle banner active status
router.patch(
  "/:bannerId/toggle",
  authMiddleware,
  bannerController.toggleBannerStatus
);

// Update banner
router.put(
  "/:bannerId",
  authMiddleware,
  bannerController.updateBanner
);

// Delete banner
router.delete(
  "/:bannerId",
  authMiddleware,
  bannerController.deleteBanner
);

module.exports = router;
