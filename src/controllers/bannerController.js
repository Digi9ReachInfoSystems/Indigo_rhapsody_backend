const mongoose = require("mongoose");
const Banner = require("../models/bannerModel");
const path = require("path");
const { bucket } = require("../service/firebaseServices");

// Helper function to upload banner image to Firebase
const uploadBannerImage = async (file, folder = "banners") => {
  const filename = `${Date.now()}_${file.originalname}`;
  const blob = bucket.file(`${folder}/${filename}`);

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
    const {
      name,
      title,
      subtitle,
      description,
      platform,
      page,
      customPage,
      actionType,
      actionValue,
      actionUrl,
      linkedProduct,
      linkedCategory,
      linkedDesigner,
      displayOrder,
      isActive,
      startDate,
      endDate,
      buttonText,
      buttonColor,
      textColor,
      tags,
      imageUrl,
      webDesktopUrl,
      webTabletUrl,
      mobileUrl,
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Banner name is required",
      });
    }

    // Build images object
    const images = {
      web: {
        desktop: webDesktopUrl || "",
        tablet: webTabletUrl || "",
      },
      mobile: mobileUrl || "",
    };

    // Create banner data
    const bannerData = {
      name,
      title: title || "",
      subtitle: subtitle || "",
      description: description || "",
      platform: platform || "both",
      page: page || "home",
      customPage: customPage || "",
      actionType: actionType || "none",
      actionValue: actionValue || "",
      actionUrl: actionUrl || "",
      linkedProduct: linkedProduct || null,
      linkedCategory: linkedCategory || null,
      linkedDesigner: linkedDesigner || null,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
      startDate: startDate || null,
      endDate: endDate || null,
      buttonText: buttonText || "Shop Now",
      buttonColor: buttonColor || "#000000",
      textColor: textColor || "#FFFFFF",
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",")) : [],
      images,
      image: imageUrl || webDesktopUrl || mobileUrl || "",
      createdBy: req.user?.userId || null,
      updatedBy: req.user?.userId || null,
      createdDate: new Date(),
      updatedDate: new Date(),
    };

    const banner = new Banner(bannerData);
    await banner.save();

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({
      success: false,
      message: "Error creating banner",
      error: error.message,
    });
  }
};

// Get All Banners (with filters)
exports.getBanners = async (req, res) => {
  try {
    const {
      page,
      platform,
      isActive,
      limit = 50,
      skip = 0,
      sortBy = "displayOrder",
      sortOrder = "asc",
    } = req.query;

    // Build filter
    const filter = {};
    const andConditions = [];

    if (page) {
      filter.page = page;
    }

    if (platform) {
      andConditions.push({
        $or: [{ platform: platform }, { platform: "both" }],
      });
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    // Check date validity
    const now = new Date();
    andConditions.push({
      $or: [
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: { $gte: now } },
      ],
    });

    // Apply $and conditions if any
    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const banners = await Banner.find(filter)
      .populate("linkedProduct", "productName coverImage price")
      .populate("linkedCategory", "name image")
      .populate("linkedDesigner", "name profileImage")
      .populate("createdBy", "displayName email")
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Banner.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: banners,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + banners.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching banners",
      error: error.message,
    });
  }
};

// Get Banners by Page
exports.getBannersByPage = async (req, res) => {
  try {
    const { pageName } = req.params;
    const { platform = "both" } = req.query;

    const now = new Date();

    // Build filter with proper $and structure
    const filter = {
      page: pageName,
      isActive: true,
      $and: [
        // Platform filter
        {
          $or: [{ platform: platform }, { platform: "both" }],
        },
        // Start date filter
        {
          $or: [
            { startDate: null },
            { startDate: { $lte: now } },
          ],
        },
        // End date filter
        {
          $or: [
            { endDate: null },
            { endDate: { $gte: now } },
          ],
        },
      ],
    };

    console.log(`🔍 Fetching banners for page: ${pageName}, platform: ${platform}`);
    console.log('Filter:', JSON.stringify(filter, null, 2));

    const banners = await Banner.find(filter)
      .populate("linkedProduct", "productName coverImage price mrp discount")
      .populate("linkedCategory", "name image")
      .populate("linkedDesigner", "name profileImage")
      .sort({ displayOrder: 1 });

    console.log(`✅ Found ${banners.length} banners`);

    res.status(200).json({
      success: true,
      data: banners,
      count: banners.length,
    });
  } catch (error) {
    console.error("Error fetching banners by page:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching banners",
      error: error.message,
    });
  }
};

// Get Banners by Platform
exports.getBannersByPlatform = async (req, res) => {
  try {
    const { platform } = req.params;
    const { page, isActive, limit = 50, skip = 0 } = req.query;

    // Validate platform
    const validPlatforms = ["web", "mobile", "both"];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid platform. Must be 'web', 'mobile', or 'both'",
      });
    }

    const now = new Date();

    // Build filter with proper $and structure
    const filter = {
      isActive: isActive !== undefined ? isActive === "true" : true,
      $and: [
        // Platform filter
        {
          $or: [{ platform: platform.toLowerCase() }, { platform: "both" }],
        },
        // Start date filter
        {
          $or: [{ startDate: null }, { startDate: { $lte: now } }],
        },
        // End date filter
        {
          $or: [{ endDate: null }, { endDate: { $gte: now } }],
        },
      ],
    };

    // Add page filter if provided
    if (page) {
      filter.page = page;
    }

    console.log(`🔍 Fetching banners for platform: ${platform}, page: ${page || 'all'}`);
    console.log('Filter:', JSON.stringify(filter, null, 2));

    const banners = await Banner.find(filter)
      .populate("linkedProduct", "productName coverImage price mrp discount")
      .populate("linkedCategory", "name image")
      .populate("linkedDesigner", "name profileImage")
      .sort({ displayOrder: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Banner.countDocuments(filter);

    console.log(`✅ Found ${banners.length} banners (Total in DB matching filter: ${total})`);

    res.status(200).json({
      success: true,
      data: banners,
      count: banners.length,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + banners.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching banners by platform:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching banners",
      error: error.message,
    });
  }
};

// Get Single Banner
exports.getBannerById = async (req, res) => {
  try {
    const { bannerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bannerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner ID",
      });
    }

    const banner = await Banner.findById(bannerId)
      .populate("linkedProduct", "productName coverImage price mrp discount")
      .populate("linkedCategory", "name image")
      .populate("linkedDesigner", "name profileImage")
      .populate("createdBy", "displayName email")
      .populate("updatedBy", "displayName email");

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      data: banner,
    });
  } catch (error) {
    console.error("Error fetching banner:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching banner",
      error: error.message,
    });
  }
};

// Update Banner
exports.updateBanner = async (req, res) => {
  try {
    const { bannerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bannerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner ID",
      });
    }

    const {
      name,
      title,
      subtitle,
      description,
      platform,
      page,
      customPage,
      actionType,
      actionValue,
      actionUrl,
      linkedProduct,
      linkedCategory,
      linkedDesigner,
      displayOrder,
      isActive,
      startDate,
      endDate,
      buttonText,
      buttonColor,
      textColor,
      tags,
      imageUrl,
      webDesktopUrl,
      webTabletUrl,
      mobileUrl,
    } = req.body;

    const updateData = {
      updatedBy: req.user?.userId || null,
      updatedDate: new Date(),
    };

    // Update only provided fields
    if (name !== undefined) updateData.name = name;
    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (description !== undefined) updateData.description = description;
    if (platform !== undefined) updateData.platform = platform;
    if (page !== undefined) updateData.page = page;
    if (customPage !== undefined) updateData.customPage = customPage;
    if (actionType !== undefined) updateData.actionType = actionType;
    if (actionValue !== undefined) updateData.actionValue = actionValue;
    if (actionUrl !== undefined) updateData.actionUrl = actionUrl;
    if (linkedProduct !== undefined) updateData.linkedProduct = linkedProduct;
    if (linkedCategory !== undefined) updateData.linkedCategory = linkedCategory;
    if (linkedDesigner !== undefined) updateData.linkedDesigner = linkedDesigner;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (buttonText !== undefined) updateData.buttonText = buttonText;
    if (buttonColor !== undefined) updateData.buttonColor = buttonColor;
    if (textColor !== undefined) updateData.textColor = textColor;
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags : tags.split(",");
    }

    // Update images
    if (webDesktopUrl || webTabletUrl || mobileUrl) {
      updateData.images = {
        web: {
          desktop: webDesktopUrl || "",
          tablet: webTabletUrl || "",
        },
        mobile: mobileUrl || "",
      };
    }

    if (imageUrl !== undefined) updateData.image = imageUrl;

    const updatedBanner = await Banner.findByIdAndUpdate(
      bannerId,
      updateData,
      { new: true }
    )
      .populate("linkedProduct", "productName coverImage price")
      .populate("linkedCategory", "name image")
      .populate("linkedDesigner", "name profileImage");

    if (!updatedBanner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: updatedBanner,
    });
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({
      success: false,
      message: "Error updating banner",
      error: error.message,
    });
  }
};

// Delete Banner
exports.deleteBanner = async (req, res) => {
  try {
    const { bannerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bannerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner ID",
      });
    }

    const banner = await Banner.findByIdAndDelete(bannerId);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // TODO: Delete associated images from Firebase Storage

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting banner",
      error: error.message,
    });
  }
};

// Toggle Banner Active Status
exports.toggleBannerStatus = async (req, res) => {
  try {
    const { bannerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bannerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner ID",
      });
    }

    const banner = await Banner.findById(bannerId);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    banner.isActive = !banner.isActive;
    banner.updatedBy = req.user?.userId || null;
    banner.updatedDate = new Date();
    await banner.save();

    res.status(200).json({
      success: true,
      message: `Banner ${banner.isActive ? "activated" : "deactivated"} successfully`,
      data: banner,
    });
  } catch (error) {
    console.error("Error toggling banner status:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling banner status",
      error: error.message,
    });
  }
};

// Track Banner Click
exports.trackBannerClick = async (req, res) => {
  try {
    const { bannerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bannerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner ID",
      });
    }

    const banner = await Banner.findByIdAndUpdate(
      bannerId,
      { $inc: { clickCount: 1 } },
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Click tracked successfully",
      data: {
        bannerId: banner._id,
        clickCount: banner.clickCount,
      },
    });
  } catch (error) {
    console.error("Error tracking banner click:", error);
    res.status(500).json({
      success: false,
      message: "Error tracking click",
      error: error.message,
    });
  }
};

// Track Banner Impression
exports.trackBannerImpression = async (req, res) => {
  try {
    const { bannerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bannerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner ID",
      });
    }

    const banner = await Banner.findByIdAndUpdate(
      bannerId,
      { $inc: { impressionCount: 1 } },
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Impression tracked successfully",
      data: {
        bannerId: banner._id,
        impressionCount: banner.impressionCount,
      },
    });
  } catch (error) {
    console.error("Error tracking banner impression:", error);
    res.status(500).json({
      success: false,
      message: "Error tracking impression",
      error: error.message,
    });
  }
};

// Get Banner Analytics
exports.getBannerAnalytics = async (req, res) => {
  try {
    const { bannerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bannerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid banner ID",
      });
    }

    const banner = await Banner.findById(bannerId).select(
      "name clickCount impressionCount createdDate"
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    const ctr =
      banner.impressionCount > 0
        ? (banner.clickCount / banner.impressionCount) * 100
        : 0;

    res.status(200).json({
      success: true,
      data: {
        bannerId: banner._id,
        name: banner.name,
        clickCount: banner.clickCount,
        impressionCount: banner.impressionCount,
        clickThroughRate: ctr.toFixed(2) + "%",
        createdDate: banner.createdDate,
      },
    });
  } catch (error) {
    console.error("Error fetching banner analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics",
      error: error.message,
    });
  }
};

// Reorder Banners
exports.reorderBanners = async (req, res) => {
  try {
    const { banners } = req.body; // Array of { bannerId, displayOrder }

    if (!Array.isArray(banners) || banners.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Banners array is required",
      });
    }

    const updatePromises = banners.map((banner) =>
      Banner.findByIdAndUpdate(banner.bannerId, {
        displayOrder: banner.displayOrder,
        updatedBy: req.user?.userId || null,
        updatedDate: new Date(),
      })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Banners reordered successfully",
    });
  } catch (error) {
    console.error("Error reordering banners:", error);
    res.status(500).json({
      success: false,
      message: "Error reordering banners",
      error: error.message,
    });
  }
};

// Debug endpoint - Get all banners without filters
exports.getAllBannersDebug = async (req, res) => {
  try {
    const allBanners = await Banner.find({})
      .select("name platform page isActive startDate endDate displayOrder")
      .sort({ displayOrder: 1 });

    const mobileBanners = allBanners.filter(
      (b) => b.platform === "mobile" || b.platform === "both"
    );

    const webBanners = allBanners.filter(
      (b) => b.platform === "web" || b.platform === "both"
    );

    res.status(200).json({
      success: true,
      debug: true,
      data: {
        total: allBanners.length,
        mobile: {
          count: mobileBanners.length,
          banners: mobileBanners,
        },
        web: {
          count: webBanners.length,
          banners: webBanners,
        },
        all: allBanners,
      },
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Debug endpoint error",
      error: error.message,
    });
  }
};
