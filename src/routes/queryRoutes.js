const express = require("express");
const router = express.Router();
const {
  createQuery,
  getAllQueries,
  updateQuery,
} = require("../controllers/queryController");

// Create a new query
router.post("/queries", createQuery);

// Get all queries
router.get("/queries", getAllQueries);

// Update a query by ID
router.put("/queries/:id", updateQuery);

module.exports = router;
