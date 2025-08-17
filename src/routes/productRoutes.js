const express = require("express");
const router = express.Router();
const cors = require("cors");
const productController = require("../controllers/productsController");
const multer = require("multer");
const { roleMiddleware, authMiddleware } = require("../middleware/authMiddleware");

router.use(cors());
router.options("*", cors());

router.post(
  "/uploadBulk",
  roleMiddleware(["Admin", "Designer"]),

  productController.uploadBulkProducts
);
router.post(
  "/updateId",
  roleMiddleware(["Admin", "Designer"]),

  productController.updateVariantStock
);
router.post(
  "/createProduct",
  roleMiddleware(["Admin", "Designer"]),
  productController.createProduct
);

router.get("/products", productController.getProducts);
router.get("/products/:productId", productController.getProductsById);
router.get("/products/search", productController.searchProductsAdvanced);
router.get("/designerSearch", productController.searchProductsByDesigner);
router.get("/latestProducts", productController.getLatestProducts);
router.put("/products/:id", productController.updateProduct);
router.put(
  "/:productId/toggle-status",
  roleMiddleware(["Admin", "Designer"]),
  productController.toggleProductStatus
);

router.get(
  "/total-count",
  roleMiddleware(["Admin"]),
  productController.getTotalProductCount
);
router.get(
  "/subCategory/:subCategoryId",
  productController.getProductsBySubCategory
);
router.get(
  "/products/:productId/variants/:color",
  productController.getProductVariantByColor
);
router.get(
  "/getProductsByDesigner/:designerRef",
  productController.getProductsByDesigner
);

router.get(
  "/total-products/designer/:designerId",
  productController.getTotalProductsByDesigner
);

// Trending products routes
router.get("/trending", productController.getTrendingProducts);
router.put(
  "/:productId/toggle-trending",
  roleMiddleware(["Admin", "Designer"]),
  productController.toggleTrendingStatus
);

// Recently viewed products routes
router.post(
  "/:productId/track-view",
  authMiddleware,
  productController.trackProductView
);
router.get(
  "/recently-viewed",
  authMiddleware,
  productController.getRecentlyViewedProducts
);
router.delete(
  "/recently-viewed",
  authMiddleware,
  productController.clearRecentlyViewedProducts
);

module.exports = router;
