const express = require("express");
const router = express.Router();
const {
  createQuery,
  getAllQueries,
  updateQuery,
} = require("../controllers/queryController");

// Create a new query

// Get all queries
router.get("/queries", getAllQueries);
router.post("/queries", createQuery);
// Update a query by ID
router.put("/queries/:id", updateQuery);

module.exports = router;
