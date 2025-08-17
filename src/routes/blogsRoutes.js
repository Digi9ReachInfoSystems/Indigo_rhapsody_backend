const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogsController"); // Adjust the path as necessary
const roleMiddleware = require("../middleware/authMiddleware").roleMiddleware;
// Routes
router.get("/", blogController.getAllBlogs);
router.post("/", roleMiddleware(["Admin"]), blogController.createBlog);
router.get("/:id", blogController.getBlogById);
router.put("/:id", roleMiddleware(["Admin"]), blogController.updateBlog);
router.delete("/:id", roleMiddleware(["Admin"]), blogController.deleteBlog);

module.exports = router;
