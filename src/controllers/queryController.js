const mongoose = require("mongoose");
const Query = require("../models/queryModel"); // Ensure the path is correct

// Create a new query
const createQuery = async (req, res) => {
  try {
    const { designer_name, buisness_name, email, phone_Number, Message } =
      req.body;

    // Validate required fields
    if (!designer_name || !buisness_name || !email || !Message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create a new query document
    const newQuery = new Query({
      designer_name,
      buisness_name,
      email,
      phone_Number,
      Message,
    });

    // Save the query to the database
    await newQuery.save();

    res
      .status(201)
      .json({ message: "Query created successfully", query: newQuery });
  } catch (error) {
    console.error("Error creating query:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all queries
const getAllQueries = async (req, res) => {
  try {
    const queries = await Query.find();
    res.status(200).json(queries);
  } catch (error) {
    console.error("Error fetching queries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a query by ID
const updateQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate required fields
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Find the query by ID and update its status
    const updatedQuery = await Query.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Return the updated document
    );

    if (!updatedQuery) {
      return res.status(404).json({ message: "Query not found" });
    }

    res
      .status(200)
      .json({ message: "Query updated successfully", query: updatedQuery });
  } catch (error) {
    console.error("Error updating query:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createQuery,
  getAllQueries,
  updateQuery,
};
