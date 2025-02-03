const mongoose = require("mongoose");
const Banner = require("../models/bannerModel");
const path = require("path");
const { bucket } = require("../service/firebaseServices");

// Helper function to upload banner image to Firebase
const uploadBannerImage = async (file) => {
  const filename = `${Date.now()}_${file.originalname}`;
  const blob = bucket.file(`banners/${filename}`);

  const stream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    stream.on("finish", async () => {
      const [url] = await blob.getSignedUrl({
        action: "read",
        expires: "03-09-2491",
      });
      resolve(url);
    });

    stream.on("error", (error) => {
      console.error("Error uploading banner image:", error);
      reject(error);
    });

    stream.end(file.buffer);
  });
};

// Create Banner
exports.createBanner = async (req, res) => {
  try {
    const { name, imageUrl } = req.body;

    // Validate required fields
    if (!name || !imageUrl) {
      return res
        .status(400)
        .json({ message: "Name and Image URL are required" });
    }

    // Create a new banner
    const banner = new Banner({
      name,
      image: imageUrl,
    });

    await banner.save();

    res.status(201).json({ message: "Banner created successfully", banner });
  } catch (error) {
    res.status(500).json({ message: "Error creating banner", error });
  }
};

// Get All Banners
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    res.status(200).json({ banners });
  } catch (error) {
    res.status(500).json({ message: "Error fetching banners", error });
  }
};

// Update Banner
exports.updateBanner = async (req, res) => {
  try {
    const { bannerId } = req.params;
    const { name } = req.body;

    let updateData = { name };

    if (req.file) {
      const imageUrl = await uploadBannerImage(req.file);
      updateData.image = imageUrl;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(bannerId, updateData, {
      new: true,
    });

    if (!updatedBanner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res
      .status(200)
      .json({ message: "Banner updated successfully", updatedBanner });
  } catch (error) {
    res.status(500).json({ message: "Error updating banner", error });
  }
};

// Delete Banner
exports.deleteBanner = async (req, res) => {
  try {
    const { bannerId } = req.params;

    const banner = await Banner.findByIdAndDelete(bannerId);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    try {
      // Nested try...catch for Firebase deletion
      // Delete the image from Firebase Storage
      const filename = banner.image.split("/").pop();
      const file = bucket.file(`banners/${filename}`);
      await file.delete();
    } catch (firebaseError) {
      console.error("Firebase delete error:", firebaseError); // Log Firebase-specific errors
      // Important: Decide how to handle Firebase deletion failures.  Options:
      // 1. (Recommended) Log the error and continue (banner is already deleted from DB):
      console.warn(
        "Firebase deletion failed, but banner removed from database.",
        firebaseError
      ); // Log a warning
      // 2. Return an error to the client:
      // return res.status(500).json({ message: "Banner deleted from database, but image deletion from Firebase failed.", firebaseError: firebaseError.message });
    }

    res.status(204).json({ message: "Banner deleted successfully" }); // 204 No Content is more appropriate here
  } catch (error) {
    console.error("Database/General delete error:", error); // Log the main error
    res
      .status(500)
      .json({ message: "Error deleting banner", error: error.message }); // Send error message to client
  }
};
