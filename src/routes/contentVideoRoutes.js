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

// Product management routes
router.post(
  "/videos/:videoId/products",
  roleMiddleware(["Admin", "Designer"]),
  videoController.addProductsToVideo
);

router.delete(
  "/videos/:videoId/products",
  roleMiddleware(["Admin", "Designer"]),
  videoController.removeProductsFromVideo
);

// Get content videos with products
router.get("/videos-with-products", videoController.getContentVideosWithProducts);
router.get("/videos-with-products/:videoId", videoController.getContentVideoWithProducts);
router.get("/videos-by-product/:productId", videoController.getVideosByProduct);

// Like/Dislike functionality
router.post("/videos/:videoId/reaction", videoController.toggleVideoReaction);
router.get("/videos/:videoId/reaction/:userId", videoController.getUserReaction);

// Comment functionality
router.post("/videos/:videoId/comments", videoController.addComment);
router.get("/videos/:videoId/comments", videoController.getVideoComments);
router.put("/videos/:videoId/comments/:commentId", videoController.updateComment);
router.delete("/videos/:videoId/comments/:commentId", videoController.deleteComment);

module.exports = router;
