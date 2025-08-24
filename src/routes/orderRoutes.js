const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const orderController = require("../controllers/orderController");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middleware/authMiddleware");

router.post("/", orderController.createOrder);
router.get("/getOrders/:userId", orderController.getOrders);
router.get(
  "/getAllOrders",
  roleMiddleware(["Admin"]),
  orderController.getAllOrders
);
router.get("/designer/:designerRef", orderController.getOrdersByDesignerRef);
router.get("/order/:orderId", orderController.getOrderById);
router.post("/return-request", orderController.createReturnRequest);
router.get(
  "/orders/total-count",
  authMiddleware,
  roleMiddleware(["Admin"]),
  orderController.getTotalOrderCount
);

router.get(
  "/daily-stats",
  authMiddleware,
  roleMiddleware(["Admin"]),
  orderController.getMonthlyOrderStats
);
router.get(

  
  "/total-orders-by-designers",
  authMiddleware,
  roleMiddleware(["Admin", "Designer"]),
  orderController.getTotalOrdersByDesigners
);
router.get(
  "/total-sales",
  authMiddleware,
  roleMiddleware(["Admin"]),
  orderController.getTotalSales
);

router.get(
  "/return-requests/:designerRef",
  authMiddleware,
  roleMiddleware(["Designer", "Admin"]),
  orderController.getReturnRequestsByDesigner
);

router.get(
  "/total-orders/designer/:designerId",
  authMiddleware,
  roleMiddleware(["Designer", "Admin"]),
  orderController.getTotalOrdersForDesigner
);

// Get total sales for a specific designer by ID
router.get(
  "/total-sales/designer/:designerId",
  authMiddleware,
  roleMiddleware(["Designer", "Admin"]),
  orderController.getTotalSalesForDesigner
);

module.exports = router;
