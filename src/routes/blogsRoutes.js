const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogsController"); // Adjust the path as necessary
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");
// Routes
router.get("/", blogController.getAllBlogs);
router.post("/", authMiddleware, roleMiddleware(["Admin"]), blogController.createBlog);
router.get("/:id", blogController.getBlogById);
router.put("/:id", authMiddleware, roleMiddleware(["Admin"]), blogController.updateBlog);
router.delete("/:id", authMiddleware, roleMiddleware(["Admin"]), blogController.deleteBlog);

module.exports = router;
