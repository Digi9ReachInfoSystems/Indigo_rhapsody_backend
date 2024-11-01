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

router.get("/designers/:id", designerController.getDesignerById);

router.put(
  "/designers/:id",
  upload.fields([{ name: "logo" }, { name: "backGroundImage" }]),
  designerController.updateDesigner
);

router.delete("/designers/:id", designerController.deleteDesigner);

module.exports = router;
