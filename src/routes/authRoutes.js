const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Public routes (no authentication required)
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/admin-login", authController.adminLogin);
router.post("/verify-phone", authController.verifyPhone);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/verify", authController.verify);

// Protected routes (authentication required)
router.get("/profile", authMiddleware, authController.getProfile);
router.put("/profile", authMiddleware, authController.updateProfile);

// Admin routes
router.post("/create-admin", authController.createAdmin); // No auth required for creating first admin

module.exports = router;
