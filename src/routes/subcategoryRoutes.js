const express = require("express");
const router = express.Router();
const subcategoryController = require("../controllers/subcategoryController");
const {
  roleMiddleware,
  authMiddleware,
} = require("../middleware/authMiddleware");
const { auth } = require("firebase-admin");

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Admin", "Designer4"]),
  subcategoryController.createSubCategory
);
router.put(
  "/:subCategoryId",
  authMiddleware,
  roleMiddleware(["Admin"]),

  subcategoryController.updateSubCategory
);

router.get("/subcategories", subcategoryController.getApprovedSubCategories);

router.get("/getSubCategory/:id", subcategoryController.getSubCategoryById);

router.patch(
  "/subcategory/:subCategoryId/approve",
  authMiddleware,
  roleMiddleware(["Admin"]),
  subcategoryController.approveSubCategory
);

// Get all subcategories
router.get("/subcategoriesall", subcategoryController.getAllSubCategories);

router.get(
  "/getSubCategoriesByCategory/:categoryId",
  subcategoryController.getSubCategoriesByCategoryId
);

router.delete(
  "/delete/:subCategoryId",
  authMiddleware,
  roleMiddleware(["Admin"]),
  subcategoryController.deleteSubCategory
);

module.exports = router;
