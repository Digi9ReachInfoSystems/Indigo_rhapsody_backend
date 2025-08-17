const mongoose = require("mongoose");
const Designer = require("../models/designerModel");
const path = require("path");
const { bucket } = require("../service/firebaseServices"); // Firebase storage configuration
const UpdateRequest = require("../models/updateDesignerSchema");
const Video = require("../models/videosModel");
const Product = require("../models/productModels");

// Upload Image Helper Function
const uploadImage = async (file, folder) => {
  const filename = `${Date.now()}_${file.originalname}`;
  const blob = bucket.file(`${folder}/${filename}`);

  return new Promise((resolve, reject) => {
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        firebaseStorageDownloadTokens: Math.random().toString(36),
      },
    });

    blobStream.on("error", (error) => {
      console.error("Error uploading image:", error);
      reject(error);
    });

    blobStream.on("finish", async () => {
      try {
        const firebaseUrl = await blob.getSignedUrl({
          action: "read",
          expires: "03-09-2491",
        });
        resolve(firebaseUrl[0]);
      } catch (error) {
        reject(new Error(`Error getting signed URL: ${error.message}`));
      }
    });

    blobStream.end(file.buffer);
  });
};

// Create a new Designer
exports.createDesigner = async (req, res) => {
  try {
    const { userId, shortDescription, about } = req.body;

    // Retrieve files from request
    const logoFile = req.files?.logo?.[0];
    const backgroundFile = req.files?.backGroundImage?.[0];

    // Upload files to Firebase if provided
    const logoUrl = logoFile
      ? await uploadImage(logoFile, "designer_logos")
      : null;

    const backGroundImageUrl = backgroundFile
      ? await uploadImage(backgroundFile, "designer_backgrounds")
      : null;

    // Create a new designer document
    const designer = new Designer({
      userId,
      logoUrl,
      backGroundImage: backGroundImageUrl,
      shortDescription,
      about,
    });

    // Save the designer document to MongoDB
    await designer.save();

    console.log("Designer created successfully:", designer);
    return res.status(201).json({
      message: "Designer created successfully",
      designer,
    });
  } catch (error) {
    console.error("Error creating designer:", error.message);
    return res.status(500).json({
      message: "Error creating designer",
      error: error.message,
    });
  }
};
exports.getAllDesigners = async (req, res) => {
  try {
    // Sort the designers by createdTime in descending order
    const designers = await Designer.find({ is_approved: true })
      .populate("userId", "displayName")
      .sort({ createdTime: -1 }); // Sort by createdTime, latest first

    if (!designers.length) {
      return res.status(404).json({ message: "No designers found" });
    }

    return res.status(200).json({ designers });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching designers",
      error: error.message,
    });
  }
};

exports.toggleDesignerApproval = async (req, res) => {
  try {
    const { id } = req.params;

    const designer = await Designer.findById(id);
    if (!designer) {
      return res.status(404).json({ message: "Designer not found" });
    }

    // Simply toggle the boolean value
    designer.is_approved = !designer.is_approved;
    await designer.save();

    return res.status(200).json({
      message: `Designer ${
        designer.is_approved ? "approved" : "disabled"
      } successfully`,
      is_approved: designer.is_approved,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error toggling designer status",
      error: error.message,
    });
  }
};
exports.getAllDesignersForAdmin = async (req, res) => {
  try {
    // Sort the designers by createdTime in descending order
    const designers = await Designer.find()
      .populate("userId", "displayName")
      .sort({ createdTime: -1 }); // Sort by createdTime, latest first

    if (!designers.length) {
      return res.status(404).json({ message: "No designers found" });
    }

    return res.status(200).json({ designers });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching designers",
      error: error.message,
    });
  }
};

// Get Designer by ID
exports.getDesignerById = async (req, res) => {
  try {
    const { id } = req.params;
    const designer = await Designer.findById(id).populate(
      "userId",
      "displayName email phoneNumber address city state pincode"
    );

    if (!designer) {
      return res.status(404).json({ message: "Designer not found" });
    }

    return res.status(200).json({ designer });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching designer",
      error: error.message,
    });
  }
};

// Update Designer
exports.updateDesigner = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Handle image uploads if new images are provided
    if (req.files.logo) {
      updates.logoUrl = await uploadImage(req.files.logo[0], "designer_logos");
    }

    if (req.files.backGroundImage) {
      updates.backGroundImage = await uploadImage(
        req.files.backGroundImage[0],
        "designer_backgrounds"
      );
    }

    updates.updatedTime = Date.now(); // Update timestamp

    const designer = await Designer.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!designer) {
      return res.status(404).json({ message: "Designer not found" });
    }

    return res
      .status(200)
      .json({ message: "Designer updated successfully", designer });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating designer",
      error: error.message,
    });
  }
};

// Delete Designer
exports.deleteDesigner = async (req, res) => {
  try {
    const { id } = req.params;

    const designer = await Designer.findByIdAndDelete(id);

    if (!designer) {
      return res.status(404).json({ message: "Designer not found" });
    }

    return res.status(200).json({ message: "Designer deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting designer",
      error: error.message,
    });
  }
};

exports.getTotalDesignerCount = async (req, res) => {
  try {
    // Count the total number of documents in the Designer collection
    const totalDesigners = await Designer.countDocuments();

    return res.status(200).json({ totalDesigners });
  } catch (error) {
    console.error("Error fetching total designer count:", error);
    return res.status(500).json({
      message: "Error fetching total designer count",
      error: error.message,
    });
  }
};

// Get Designer Details and Associated User by Designer ID
exports.getDesignerDetailsById = async (req, res) => {
  try {
    const { designerId } = req.params;

    // Find the designer and populate user details
    const designer = await Designer.findById(designerId).populate(
      "userId",
      "displayName email phoneNumber address"
    );

    if (!designer) {
      return res.status(404).json({ message: "Designer not found" });
    }

    return res.status(200).json({ designer });
  } catch (error) {
    console.error("Error fetching designer details:", error);
    return res.status(500).json({
      message: "Error fetching designer details",
      error: error.message,
    });
  }
};

exports.updateDesignerInfo = async (req, res) => {
  try {
    const { designerId } = req.params;
    const { _id, ...updates } = req.body; // Destructure _id to exclude it from updates

    // Include only the necessary fields for update
    if (updates.logoUrl) {
      updates.logoUrl = updates.logoUrl;
    }

    if (updates.backGroundImage) {
      updates.backGroundImage = updates.backGroundImage;
    }

    // Update timestamp
    updates.updatedTime = Date.now();

    const updatedDesigner = await Designer.findByIdAndUpdate(
      designerId,
      updates,
      {
        new: true,
      }
    ).populate("userId", "displayName email phoneNumber address");

    if (!updatedDesigner) {
      return res.status(404).json({ message: "Designer not found" });
    }

    return res.status(200).json({
      message: "Designer information updated successfully",
      designer: updatedDesigner,
    });
  } catch (error) {
    console.error("Error updating designer information:", error);
    return res.status(500).json({
      message: "Error updating designer information",
      error: error.message,
    });
  }
};

exports.updateProfileRequest = async (req, res) => {
  try {
    const { designerId } = req.params;
    const { updates } = req.body;

    // Check if designer exists
    const designer = await Designer.findById(designerId);
    if (!designer) {
      return res.status(404).json({ message: "Designer not found" });
    }

    // Save the update request for admin approval
    const updateRequest = new UpdateRequest({
      designerId,
      requestedUpdates: updates,
    });

    await updateRequest.save();

    res.status(201).json({
      message:
        "Profile update request submitted successfully. Pending admin approval.",
      updateRequest,
    });
  } catch (error) {
    console.error("Error submitting profile update request:", error);
    res.status(500).json({
      message: "Error submitting profile update request",
      error: error.message,
    });
  }
};

exports.getLatestUpdateRequests = async (req, res) => {
  try {
    // Fetch all update requests sorted by the most recent first
    const updateRequests = await UpdateRequest.find()
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .populate({
        path: "designerId", // Populate designer details
        populate: {
          path: "userId", // Populate user details from the User table
          select: "displayName email phoneNumber", // Select necessary fields
        },
      })
      .exec();

    res.status(200).json({
      message: "Latest update requests fetched successfully",
      updateRequests,
    });
  } catch (error) {
    console.error("Error fetching latest update requests:", error);
    res.status(500).json({
      message: "Error fetching latest update requests",
      error: error.message,
    });
  }
};

exports.requestUpdateDesignerInfo = async (req, res) => {
  try {
    const { designerId } = req.params;
    const { updates } = req.body;

    // Check if designer exists
    const designer = await Designer.findById(designerId);
    if (!designer) {
      return res.status(404).json({ message: "Designer not found" });
    }

    // Create a new update request
    const updateRequest = new UpdateRequest({
      designerId,
      requestedUpdates: updates,
    });

    await updateRequest.save();

    res.status(201).json({
      message: "Update request submitted successfully. Pending admin approval.",
      updateRequest,
    });
  } catch (error) {
    console.error("Error requesting designer info update:", error);
    res.status(500).json({
      message: "Error requesting designer info update",
      error: error.message,
    });
  }
};
exports.reviewUpdateRequests = async (req, res) => {
  try {
    const { requestId } = req.params; // Update request ID
    const { status, adminComments } = req.body;

    // Find the update request
    const updateRequest = await UpdateRequest.findById(requestId).populate(
      "designerId"
    );

    if (!updateRequest) {
      return res.status(404).json({ message: "Update request not found" });
    }

    if (updateRequest.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "This request has already been reviewed" });
    }

    // If approved, update the designer's information
    if (status === "Approved") {
      const designerId = updateRequest.designerId._id;
      const updates = updateRequest.requestedUpdates;

      // Dynamically construct the update object
      const updateFields = {};

      Object.keys(updates).forEach((key) => {
        if (key !== "_id" && updates[key] !== undefined) {
          updateFields[key] = updates[key];
        }
      });

      // Perform the update only if there are fields to update
      if (Object.keys(updateFields).length > 0) {
        await Designer.findByIdAndUpdate(
          designerId,
          { $set: updateFields },
          { new: true }
        );
      }

      updateRequest.status = "Approved";
      updateRequest.adminComments = adminComments || "Approved by Admin";
    } else if (status === "Rejected") {
      updateRequest.status = "Rejected";
      updateRequest.adminComments = adminComments || "Rejected by Admin";
    }

    // Save the update request status
    await updateRequest.save();

    res.status(200).json({
      message: `Request ${status.toLowerCase()} successfully`,
      updateRequest,
    });
  } catch (error) {
    console.error("Error reviewing update request:", error);
    res.status(500).json({
      message: "Error reviewing update request",
      error: error.message,
    });
  }
};

exports.getPickupLocationName = async (req, res) => {
  try {
    const { designerId } = req.params; // Get designer reference (designerId) from request params

    // Find the designer by ID
    const designer = await Designer.findById(designerId).select(
      "pickup_location_name"
    );

    // If designer not found, return a 404 response
    if (!designer) {
      return res.status(404).json({
        message: "Designer not found",
      });
    }

    // Return the pickup_location_name
    res.status(200).json({
      message: "Pickup location name fetched successfully",
      pickup_location_name: designer.pickup_location_name,
    });
  } catch (error) {
    console.error("Error fetching pickup location name:", error);
    res.status(500).json({
      message: "Error fetching pickup location name",
      error: error.message,
    });
  }
};

exports.getPendingDesignerCount = async (req, res) => {
  try {
    const pendingCount = await Designer.countDocuments({ is_approved: false });
    return res.status(200).json({ pendingCount });
  } catch (error) {
    console.error("Error fetching pending designer count:", error);
    return res.status(500).json({
      message: "Error fetching pending designer count",
      error: error.message,
    });
  }
};

// Get the count of approved designers (is_approved: true)
exports.getApprovedDesignerCount = async (req, res) => {
  try {
    const approvedCount = await Designer.countDocuments({ is_approved: true });
    return res.status(200).json({ approvedCount });
  } catch (error) {
    console.error("Error fetching approved designer count:", error);
    return res.status(500).json({
      message: "Error fetching approved designer count",
      error: error.message,
    });
  }
};

exports.updateDesignerApprovalStatus = async (req, res) => {
  try {
    const { designerId } = req.params;
    const { is_approved } = req.body;

    // Ensure is_approved is a boolean before updating
    if (typeof is_approved !== "boolean") {
      return res.status(400).json({ message: "Invalid approval status" });
    }

    const designer = await Designer.findByIdAndUpdate(
      designerId,
      { is_approved, updatedTime: Date.now() },
      { new: true }
    ).populate("userId", "displayName email phoneNumber address");

    if (!designer) {
      return res.status(404).json({ message: "Designer not found" });
    }

    return res.status(200).json({
      message: `Designer approval status updated successfully`,
      designer,
    });
  } catch (error) {
    console.error("Error updating designer approval status:", error);
    return res.status(500).json({
      message: "Error updating designer approval status",
      error: error.message,
    });
  }
};

exports.getDesignerNameByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the designer by userId and populate the displayName from the User table
    const designer = await Designer.findOne({ userId }).populate(
      "userId",
      "displayName"
    );

    if (!designer) {
      return res.status(404).json({ message: "Designer not found" });
    }

    // Return the designer's name (displayName from User table)
    return res.status(200).json({
      message: "Designer fetched successfully",
      designer: {
        displayName: designer.userId.displayName, // Access populated displayName
        userId: designer.userId._id,
      },
    });
  } catch (error) {
    console.error("Error fetching designer by userId:", error);
    return res.status(500).json({
      message: "Error fetching designer by userId",
      error: error.message,
    });
  }
};

exports.createDesignerVideosForProducts = async (req, res) => {
  try {
    const {
      videoUrl,
      userId,
      productTagged,
      designerRef,
      demo_url,
      instagram_User,
    } = req.body;

    // Validate required fields
    if (!videoUrl || !productTagged || !designerRef) {
      return res.status(400).json({
        success: false,
        message: "videoUrl, productTagged, and designerRef are required",
      });
    }

    // Create new video
    const newVideo = new Video({
      videoUrl: Array.isArray(videoUrl) ? videoUrl : [videoUrl],
      typeOfVideo: "ProductVideo",
      productTagged,
      userId,
      designerRef,
      demo_url,
      instagram_User,
      is_approved: false, // Default to false for approval
    });

    // Save video to database
    const savedVideo = await newVideo.save();

    res.status(201).json({
      success: true,
      message: "Designer video for products created successfully",
      data: savedVideo,
    });
  } catch (error) {
    console.error("Error creating designer video:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getAllDesignerVideosForProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, approved, designerId, productId } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { typeOfVideo: "ProductVideo" };

    // Add filters
    if (approved !== undefined) query.is_approved = approved === "true";
    if (designerId) query.designerRef = designerId;
    if (productId) query.productTagged = { $in: [productId] };

    // Get videos with population
    const videos = await Video.find(query)
      .populate({
        path: "productTagged",
        select:
          "productName description price mrp coverImage in_stock discount averageRating variants designerRef",
        model: "Product",
        populate: [
          {
            path: "designerRef",
            select: "name profileImage",
          },
          {
            path: "category",
            select: "name",
          },
          {
            path: "subCategory",
            select: "name",
          },
        ],
      })
      .populate({
        path: "designerRef",
        select: "name profileImage bio",
        model: "Designer",
      })
      .populate({
        path: "userId",
        select: "username profileImage",
        model: "User",
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ created_at: -1 });

    // Count total videos for pagination info
    const total = await Video.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Designer videos for products retrieved successfully",
      data: videos,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting designer videos:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getDesignerVideoForProductsById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find video by ID with detailed population
    const video = await Video.findOne({ _id: id, typeOfVideo: "ProductVideo" })
      .populate({
        path: "productTagged",
        select:
          "productName description price mrp coverImage in_stock discount averageRating variants material fabric is_sustainable productDetails fit reviews",
        model: "Product",
        populate: [
          {
            path: "designerRef",
            select: "name profileImage bio",
          },
          {
            path: "category",
            select: "name slug",
          },
          {
            path: "subCategory",
            select: "name slug",
          },
          {
            path: "reviews.userId",
            select: "name profileImage",
          },
        ],
      })
      .populate({
        path: "designerRef",
        select: "name profileImage bio socialMedia",
        model: "Designer",
      })
      .populate({
        path: "userId",
        select: "username email profileImage",
        model: "User",
      });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Designer video not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Designer video retrieved successfully",
      data: video,
    });
  } catch (error) {
    console.error("Error getting designer video by ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
// Approve designer video for products
exports.ApproveDesignerVideoForProducts = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and update video
    const video = await Video.findOneAndUpdate(
      { _id: id, typeOfVideo: "ProductVideo" },
      { is_approved: true, updated_at: Date.now() },
      { new: true }
    ).populate("productTagged designerRef userId");

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Designer video not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Designer video approved successfully",
      data: video,
    });
  } catch (error) {
    console.error("Error approving designer video:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Reject designer video for products
exports.rejectDesignerVideoForProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body; // Optional rejection reason

    // Find and update video
    const video = await Video.findOneAndUpdate(
      { _id: id, typeOfVideo: "ProductVideo" },
      {
        is_approved: false,
        updated_at: Date.now(),
        rejectionReason: rejectionReason || "Rejected by admin",
      },
      { new: true }
    ).populate("productTagged designerRef userId");

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Designer video not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Designer video rejected successfully",
      data: video,
    });
  } catch (error) {
    console.error("Error rejecting designer video:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
