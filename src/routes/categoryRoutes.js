const express = require("express");
const router = express.Router();
const categoryController = require("./../controllers/categoryContoller");
const multer = require("multer");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middleware/authMiddleware");
const upload = multer({ storage: multer.memoryStorage() });
router.post("/", roleMiddleware(["Admin"]), categoryController.createCategory);
router.get("/", categoryController.getCategories);
router.put(
  "/category/:categoryId",
  upload.single("image"),
  roleMiddleware(["Admin"]),
  categoryController.updateCategory
);
router.delete(
  "/category/:categoryId",
  roleMiddleware(["Admin"]),
  categoryController.deleteCategory
);

module.exports = router;
