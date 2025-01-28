const express = require("express");
const router = express.Router();
const designerController = require("../controllers/designerController");
const multer = require("multer");
const upload = require("../middleware/uploadMiddleWare");
router.post(
  "/designers",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "backGroundImage", maxCount: 1 },
  ]),
  designerController.createDesigner
);

router.get("/designers", designerController.getAllDesigners);
router.get("/total-count", designerController.getTotalDesignerCount);

router.get("/designers/:id", designerController.getDesignerById);

router.put(
  "/designers/:id",
  upload.fields([{ name: "logo" }, { name: "backGroundImage" }]),
  designerController.updateDesigner
);

router.get("/:designerId/details", designerController.getDesignerDetailsById);
router.put("/:designerId/update", designerController.updateDesignerInfo);

router.delete("/designers/:id", designerController.deleteDesigner);

router.get("/pending-count", designerController.getPendingDesignerCount);
router.get("/name/:userId", designerController.getDesignerNameByUserId);

// Get count of approved designers
router.get("/approved-count", designerController.getApprovedDesignerCount);
router.get(
  "/update-requests/latest",
  designerController.getLatestUpdateRequests
);
// Update designer status (admin only)
router.patch(
  "/:designerId/status",
  designerController.updateDesignerApprovalStatus
);

router.post(
  "/:designerId/request-update",
  designerController.requestUpdateDesignerInfo
);

router.post(
  "/:designerId/update-request",
  designerController.updateProfileRequest
);

// Admin reviews update requests
router.put("/review/:requestId", designerController.reviewUpdateRequests);

module.exports = router;
