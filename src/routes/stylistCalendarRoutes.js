const express = require("express");
const router = express.Router();
const stylistCalendarController = require("../controllers/stylistCalendarController");
const {
    authMiddleware,
    roleMiddleware,
} = require("../middleware/authMiddleware");

// Stylist calendar management routes (authentication + stylist role required)
router.post(
    "/set-availability",
    authMiddleware,
    roleMiddleware(["Stylist"]),
    stylistCalendarController.setAvailability
);

router.get(
    "/get-availability",
    authMiddleware,
    roleMiddleware(["Stylist"]),
    stylistCalendarController.getAvailability
);

router.post(
    "/add-date-override",
    authMiddleware,
    roleMiddleware(["Stylist"]),
    stylistCalendarController.addDateOverride
);

router.delete(
    "/remove-date-override/:date",
    authMiddleware,
    roleMiddleware(["Stylist"]),
    stylistCalendarController.removeDateOverride
);

router.get(
    "/calendar-view",
    authMiddleware,
    roleMiddleware(["Stylist"]),
    stylistCalendarController.getCalendarView
);

router.post(
    "/toggle-availability",
    authMiddleware,
    roleMiddleware(["Stylist"]),
    stylistCalendarController.toggleAvailability
);

module.exports = router;
