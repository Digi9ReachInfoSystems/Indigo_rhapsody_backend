const express = require("express");
const router = express.Router();
const videoController = require("../controllers/contentVideosController");
const { roleMiddleware } = require("../middleware/authMiddleware");

router.post("/videos", videoController.createVideo);
router.get("/videos", videoController.getAllVideos);
router.get("/totalVideos", videoController.getAllVideosWithLikesAndComments);
router.get("/videos/user/:userId", videoController.getVideosByUser);
router.get("/videos/:videoId", videoController.getVideoById);
router.delete("/videos/:videoId", videoController.deleteVideo);
router.post("/videos/:videoId/like", videoController.toggleLikeVideo);
router.post("/comments", videoController.createComment); // Create a comment
router.post(
  "/createAdminVideo",
  roleMiddleware(["Admin"]),
  videoController.createVideoByAdmin
);
router.get("/videos/:videoId/comments", videoController.getCommentsByVideo);
router.patch(
  "/videos/:videoId/approve",
  roleMiddleware(["Admin"]),
  videoController.approveVideo
);

module.exports = router;
