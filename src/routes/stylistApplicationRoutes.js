const express = require("express");
const router = express.Router();
const stylistApplicationController = require("../controllers/stylistApplicationController");
const {
    authMiddleware,
    roleMiddleware,
} = require("../middleware/authMiddleware");

// Public routes (no authentication required)
router.post(
    "/submit",
    stylistApplicationController.submitStylistApplication
);

router.post(
    "/payment/initiate/:applicationId",
    stylistApplicationController.initiatePayment
);

router.post(
    "/payment/callback",
    stylistApplicationController.handlePaymentCallback
);

router.get(
    "/payment/status/:applicationId",
    stylistApplicationController.checkPaymentStatus
);

// Admin routes (authentication + admin role required)
router.get(
    "/applications",
    authMiddleware,
    roleMiddleware(["Admin"]),
    stylistApplicationController.getApplicationsForReview
);

router.post(
    "/approve/:applicationId",
    authMiddleware,
    roleMiddleware(["Admin"]),
    stylistApplicationController.approveStylistApplication
);

router.post(
    "/reject/:applicationId",
    authMiddleware,
    roleMiddleware(["Admin"]),
    stylistApplicationController.rejectStylistApplication
);

module.exports = router;
