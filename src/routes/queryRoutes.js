const express = require("express");
const router = express.Router();
const {
  createQuery,
  getAllQueries,
  updateQuery,
} = require("../controllers/queryController");
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");

// Create a new query

// Get all queries
router.get("/queries", authMiddleware, roleMiddleware(["Admin"]), getAllQueries);
router.post("/queries", createQuery);
// Update a query by ID
router.put("/queries/:id", authMiddleware, roleMiddleware(["Admin"]), updateQuery);

module.exports = router;
