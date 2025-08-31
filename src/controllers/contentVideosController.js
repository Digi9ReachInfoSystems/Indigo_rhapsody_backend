const ContentVideo = require("../models/contentVIdeosModel");
const Comment = require("../models/commentModel");

// Create a new video with products
exports.createVideo = async (req, res) => {
  try {
    const { userId, creatorId, videoUrl, title, productIds } = req.body;

    if (!userId || !creatorId || !videoUrl || !title) {
      return res
        .status(400)
        .json({ message: "User ID, Creator ID, Video URL, and title are required." });
    }

    // Prepare products array if productIds are provided
    let products = [];
    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      products = productIds.map(productId => ({
        productId,
        addedAt: new Date()
      }));
    }

    const newVideo = new ContentVideo({
      userId,
      title,
      creatorId,
      videoUrl,
      products,
    });

    await newVideo.save();

    // Populate the products for response
    await newVideo.populate({
      path: 'products.productId',
      select: 'productName price coverImage sku category subCategory designerRef',
      populate: {
        path: 'designerRef',
        select: 'displayName email phoneNumber profilePicture'
      }
    });

    res.status(201).json({
      message: "Video created successfully",
      video: newVideo,
    });
  } catch (error) {
    console.error("Error creating video:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.approveVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    // First find the video to get its current status
    const currentVideo = await ContentVideo.findById(videoId);

    if (!currentVideo) {
      return res.status(404).json({ message: "Video not found." });
    }

    // Toggle the is_approved status
    const video = await ContentVideo.findByIdAndUpdate(
      videoId,
      {
        is_approved: !currentVideo.is_approved,
        updated_at: Date.now(), // Optional: update timestamp
      },
      { new: true } // Return the updated document
    );

    res.status(200).json({
      message: `Video ${
        video.is_approved ? "approved" : "unapproved"
      } successfully`,
      video,
    });
  } catch (error) {
    console.error("Error toggling video approval:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get all videos (approved only) - with optional filtering
exports.getAllVideos = async (req, res) => {
  try {
    const { filter } = req.query;
    
    // Build base query for approved videos
    const query = { is_approved: true };
    
    // Apply filter based on query parameter
    if (filter === 'without-products') {
      // Filter to show only videos without products (current behavior)
      query.$or = [
        { products: { $exists: false } },  // Videos without products field
        { products: { $size: 0 } }         // Videos with empty products array
      ];
    } else if (filter === 'with-products') {
      // Filter to show only videos with products
      query['products.0'] = { $exists: true }; // Ensure products array exists and has at least one element
    }
    // If no filter or invalid filter, show all approved videos (no additional filtering)

    const videos = await ContentVideo.find(query).populate(
      "userId creatorId",
      "displayName email"
    );

    if (!videos.length) {
      const message = filter === 'without-products' 
        ? "No videos without products found." 
        : filter === 'with-products' 
        ? "No videos with products found."
        : "No videos found.";
      return res.status(404).json({ message });
    }

    res.status(200).json({ videos });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
exports.getAllVideosWithLikesAndComments = async (req, res) => {
  try {
    // Fetch all videos regardless of approval status
    const videos = await ContentVideo.find()
      .populate("userId creatorId", "displayName email") // Populate user and creator details
      .lean(); // Convert Mongoose documents to plain JavaScript objects for easier manipulation

    if (!videos.length) {
      return res.status(404).json({ message: "No videos found." });
    }

    // Iterate over each video to fetch associated comments and add likes information
    const videosWithLikesAndComments = await Promise.all(
      videos.map(async (video) => {
        // Fetch comments for the current video
        const comments = await Comment.find({ videoId: video._id })
          .populate("userId", "displayName email") // Populate commenter details
          .sort({ createdAt: -1 })
          .lean(); // Get plain objects

        // Add comments and likes info to each video
        return {
          ...video,
          comments,
          likes: video.no_of_likes || 0, // Assuming no_of_likes field holds like count
          likedBy: video.likedBy || [], // Array of user IDs who liked the video
        };
      })
    );

    // Send the enriched video data as a response
    res.status(200).json({ videos: videosWithLikesAndComments });
  } catch (error) {
    console.error("Error fetching videos with likes and comments:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get videos by user ID
exports.getVideosByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const videos = await ContentVideo.find({ userId }).populate(
      "userId creatorId",
      "displayName email"
    );

    if (!videos.length) {
      return res
        .status(404)
        .json({ message: "No videos found for this user." });
    }

    res.status(200).json({ videos });
  } catch (error) {
    console.error("Error fetching user videos:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Get a single video by ID
exports.getVideoById = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await ContentVideo.findById(videoId).populate(
      "userId creatorId",
      "displayName email"
    );

    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    res.status(200).json({ video });
  } catch (error) {
    console.error("Error fetching video:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Delete a video by ID
exports.deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const deletedVideo = await ContentVideo.findByIdAndDelete(videoId);

    if (!deletedVideo) {
      return res.status(404).json({ message: "Video not found." });
    }

    res.status(200).json({
      message: "Video deleted successfully",
      video: deletedVideo,
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Toggle like/dislike for a video
exports.toggleVideoReaction = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { userId, reactionType } = req.body; // 'like' or 'dislike'

    if (!videoId || !userId || !reactionType) {
      return res.status(400).json({ 
        message: "Video ID, User ID, and reaction type (like/dislike) are required" 
      });
    }

    if (!['like', 'dislike'].includes(reactionType)) {
      return res.status(400).json({ 
        message: "Reaction type must be either 'like' or 'dislike'" 
      });
    }

    const video = await ContentVideo.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const isLike = reactionType === 'like';
    const likedArray = isLike ? video.likedBy : video.dislikedBy;
    const dislikedArray = isLike ? video.dislikedBy : video.likedBy;
    const likedCount = isLike ? video.no_of_likes : video.no_of_dislikes;
    const dislikedCount = isLike ? video.no_of_dislikes : video.no_of_likes;

    // Check if user already has this reaction
    const userIndex = likedArray.indexOf(userId);
    const hasOppositeReaction = dislikedArray.indexOf(userId) !== -1;

    let message = '';
    let action = '';

    if (userIndex === -1) {
      // User doesn't have this reaction, add it
      likedArray.push(userId);
      if (isLike) {
        video.no_of_likes += 1;
      } else {
        video.no_of_dislikes += 1;
      }
      action = 'added';
      message = `Video ${reactionType}d successfully`;
    } else {
      // User already has this reaction, remove it
      likedArray.splice(userIndex, 1);
      if (isLike) {
        video.no_of_likes -= 1;
      } else {
        video.no_of_dislikes -= 1;
      }
      action = 'removed';
      message = `Video ${reactionType} removed successfully`;
    }

    // If user had opposite reaction, remove it
    if (hasOppositeReaction) {
      const oppositeIndex = dislikedArray.indexOf(userId);
      if (oppositeIndex !== -1) {
        dislikedArray.splice(oppositeIndex, 1);
        if (isLike) {
          video.no_of_dislikes -= 1;
        } else {
          video.no_of_likes -= 1;
        }
      }
    }

    await video.save();

    // Populate user details for response
    await video.populate('userId', 'displayName email phoneNumber profilePicture');
    await video.populate('creatorId', 'displayName email phoneNumber profilePicture');
    await video.populate({
      path: 'products.productId',
      select: 'productName price coverImage sku category subCategory designerRef',
      populate: {
        path: 'designerRef',
        select: 'displayName email phoneNumber profilePicture'
      }
    });

    // Get user details for the person who reacted
    const User = require("../models/userModel");
    const reactingUser = await User.findById(userId).select('displayName email phoneNumber profilePicture');

    res.status(200).json({
      message,
      action,
      reactionType,
      reactingUser: {
        _id: reactingUser._id,
        displayName: reactingUser.displayName,
        email: reactingUser.email,
        phoneNumber: reactingUser.phoneNumber,
        profilePicture: reactingUser.profilePicture
      },
      video: {
        _id: video._id,
        title: video.title,
        videoUrl: video.videoUrl,
        no_of_likes: video.no_of_likes,
        no_of_dislikes: video.no_of_dislikes,
        no_of_Shares: video.no_of_Shares,
        is_approved: video.is_approved,
        createdDate: video.createdDate,
        userId: video.userId,
        creatorId: video.creatorId,
        products: video.products,
        userReaction: userIndex === -1 ? reactionType : null
      }
    });
  } catch (error) {
    console.error("Error toggling video reaction:", error);
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
};

// Get user's reaction for a video
exports.getUserReaction = async (req, res) => {
  try {
    const { videoId, userId } = req.params;

    if (!videoId || !userId) {
      return res.status(400).json({ 
        message: "Video ID and User ID are required" 
      });
    }

    const video = await ContentVideo.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const hasLiked = video.likedBy.includes(userId);
    const hasDisliked = video.dislikedBy.includes(userId);

    let userReaction = null;
    if (hasLiked) {
      userReaction = 'like';
    } else if (hasDisliked) {
      userReaction = 'dislike';
    }

    res.status(200).json({
      videoId,
      userId,
      userReaction,
      hasLiked,
      hasDisliked
    });
  } catch (error) {
    console.error("Error getting user reaction:", error);
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
};

// Get users who liked a video
exports.getUsersWhoLiked = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const video = await ContentVideo.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (!video.likedBy || video.likedBy.length === 0) {
      return res.status(200).json({
        users: [],
        totalUsers: 0,
        currentPage: parseInt(page),
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
    }

    // Get paginated user IDs
    const paginatedUserIds = video.likedBy.slice(skip, skip + parseInt(limit));

    // Fetch user details
    const User = require("../models/userModel");
    const users = await User.find({ _id: { $in: paginatedUserIds } })
      .select('displayName email phoneNumber profilePicture')
      .lean();

    res.status(200).json({
      users,
      totalUsers: video.likedBy.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(video.likedBy.length / parseInt(limit)),
      hasNextPage: skip + users.length < video.likedBy.length,
      hasPrevPage: parseInt(page) > 1
    });
  } catch (error) {
    console.error("Error getting users who liked:", error);
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
};

// Get users who disliked a video
exports.getUsersWhoDisliked = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const video = await ContentVideo.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (!video.dislikedBy || video.dislikedBy.length === 0) {
      return res.status(200).json({
        users: [],
        totalUsers: 0,
        currentPage: parseInt(page),
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
    }

    // Get paginated user IDs
    const paginatedUserIds = video.dislikedBy.slice(skip, skip + parseInt(limit));

    // Fetch user details
    const User = require("../models/userModel");
    const users = await User.find({ _id: { $in: paginatedUserIds } })
      .select('displayName email phoneNumber profilePicture')
      .lean();

    res.status(200).json({
      users,
      totalUsers: video.dislikedBy.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(video.dislikedBy.length / parseInt(limit)),
      hasNextPage: skip + users.length < video.dislikedBy.length,
      hasPrevPage: parseInt(page) > 1
    });
  } catch (error) {
    console.error("Error getting users who disliked:", error);
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
};

// Add comment to a video
exports.addComment = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { userId, commentText } = req.body;

    if (!userId || !commentText) {
      return res.status(400).json({ 
        message: "User ID and comment text are required." 
      });
    }

    const video = await ContentVideo.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    // Add comment to the video
    video.comments.push({
      userId,
      commentText,
      createdAt: new Date()
    });

    await video.save();

    // Populate the newly added comment with user details
    const newComment = video.comments[video.comments.length - 1];
    await video.populate('comments.userId', 'displayName email phoneNumber profilePicture');

    res.status(201).json({
      message: "Comment added successfully",
      comment: {
        _id: newComment._id,
        userId: {
          _id: newComment.userId._id,
          displayName: newComment.userId.displayName,
          email: newComment.userId.email,
          phoneNumber: newComment.userId.phoneNumber,
          profilePicture: newComment.userId.profilePicture
        },
        commentText: newComment.commentText,
        createdAt: newComment.createdAt
      },
      totalComments: video.comments.length
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get comments for a video
exports.getVideoComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const video = await ContentVideo.findById(videoId)
      .populate('comments.userId', 'displayName email phoneNumber profilePicture')
      .select('comments');

    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    // Sort comments by creation date (newest first) and apply pagination
    const sortedComments = video.comments.sort((a, b) => b.createdAt - a.createdAt);
    const paginatedComments = sortedComments.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      comments: paginatedComments,
      totalComments: video.comments.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(video.comments.length / parseInt(limit)),
      hasNextPage: skip + paginatedComments.length < video.comments.length,
      hasPrevPage: parseInt(page) > 1
    });
  } catch (error) {
    console.error("Error fetching video comments:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  try {
    const { videoId, commentId } = req.params;
    const { userId, commentText } = req.body;

    if (!commentText) {
      return res.status(400).json({ 
        message: "Comment text is required." 
      });
    }

    const video = await ContentVideo.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    // Find the comment
    const comment = video.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ 
        message: "You can only update your own comments." 
      });
    }

    // Update the comment
    comment.commentText = commentText;
    comment.updatedAt = new Date();

    await video.save();

    res.status(200).json({
      message: "Comment updated successfully",
      comment
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { videoId, commentId } = req.params;
    const { userId } = req.body;

    const video = await ContentVideo.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    // Find the comment
    const comment = video.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    // Check if user owns the comment or is admin
    if (comment.userId.toString() !== userId && req.user?.role !== 'Admin') {
      return res.status(403).json({ 
        message: "You can only delete your own comments." 
      });
    }

    // Remove the comment
    video.comments.pull(commentId);
    await video.save();

    res.status(200).json({
      message: "Comment deleted successfully",
      totalComments: video.comments.length
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.createVideoByAdmin = async (req, res) => {
  try {
    const { userId, videoUrl, title, productIds } = req.body;
    if (!userId || !videoUrl || !title) {
      return res
        .status(400)
        .json({ message: "User ID, Video URL, and title are required." });
    }

    // Prepare products array if productIds are provided
    let products = [];
    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      products = productIds.map(productId => ({
        productId,
        addedAt: new Date()
      }));
    }

    const video = new ContentVideo({
      userId,
      title,
      videoUrl,
      is_approved: true,
      products,
    });

    await video.save();

    // Populate the products for response
    await video.populate({
      path: 'products.productId',
      select: 'productName price coverImage sku category subCategory designerRef',
      populate: {
        path: 'designerRef',
        select: 'displayName email phoneNumber profilePicture'
      }
    });

    res.status(201).json({
      message: "Admin video created and approved successfully",
      video,
    });
  } catch (error) {
    console.error("Error creating admin video:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Add products to a content video
exports.addProductsToVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { productIds } = req.body; // Array of product IDs

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        message: "Product IDs array is required and must not be empty.",
      });
    }

    // Check if video exists
    const video = await ContentVideo.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    // Add new products (avoid duplicates)
    const existingProductIds = video.products.map(p => p.productId.toString());
    const newProducts = productIds
      .filter(productId => !existingProductIds.includes(productId))
      .map(productId => ({
        productId,
        addedAt: new Date()
      }));

    if (newProducts.length === 0) {
      return res.status(400).json({
        message: "All products are already added to this video.",
      });
    }

    video.products.push(...newProducts);
    await video.save();

    // Populate the products for response
    await video.populate({
      path: 'products.productId',
      select: 'productName price coverImage designerRef',
      populate: {
        path: 'designerRef',
        select: 'displayName email phoneNumber profilePicture'
      }
    });

    res.status(200).json({
      message: `${newProducts.length} product(s) added to video successfully`,
      video,
    });
  } catch (error) {
    console.error("Error adding products to video:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Remove products from a content video
exports.removeProductsFromVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { productIds } = req.body; // Array of product IDs to remove

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        message: "Product IDs array is required and must not be empty.",
      });
    }

    // Check if video exists
    const video = await ContentVideo.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    // Remove products
    const initialLength = video.products.length;
    video.products = video.products.filter(
      product => !productIds.includes(product.productId.toString())
    );

    if (video.products.length === initialLength) {
      return res.status(400).json({
        message: "No products were found to remove.",
      });
    }

    await video.save();

    // Populate the remaining products for response
    await video.populate({
      path: 'products.productId',
      select: 'productName price coverImage designerRef',
      populate: {
        path: 'designerRef',
        select: 'displayName email phoneNumber profilePicture'
      }
    });

    res.status(200).json({
      message: `${initialLength - video.products.length} product(s) removed from video successfully`,
      video,
    });
  } catch (error) {
    console.error("Error removing products from video:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get content videos with products
exports.getContentVideosWithProducts = async (req, res) => {
  try {
    const { limit = 10, page = 1, approved = true, userId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query - only videos that have products
    const query = {
      'products.0': { $exists: true } // Ensure products array exists and has at least one element
    };
    if (approved === 'true' || approved === true) {
      query.is_approved = true;
    }

    const videos = await ContentVideo.find(query)
      .populate('userId', 'displayName email phoneNumber profilePicture')
      .populate('creatorId', 'displayName email phoneNumber profilePicture')
      .populate({
        path: 'products.productId',
        select: 'productName price coverImage sku category subCategory designerRef',
        populate: {
          path: 'designerRef',
          select: 'displayName email phoneNumber profilePicture'
        }
      })
      .populate('comments.userId', 'displayName email phoneNumber profilePicture')
      .sort({ createdDate: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    if (!videos.length) {
      return res.status(404).json({ message: "No videos with products found." });
    }

    // Add user reaction information if userId is provided
    if (userId) {
      videos.forEach(video => {
        video.userReaction = null;
        if (video.likedBy && video.likedBy.includes(userId)) {
          video.userReaction = 'like';
        } else if (video.dislikedBy && video.dislikedBy.includes(userId)) {
          video.userReaction = 'dislike';
        }
      });
    }

    // Get total count for pagination - only count videos with products
    const totalVideos = await ContentVideo.countDocuments(query);

    res.status(200).json({
      videos,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalVideos / parseInt(limit)),
        totalVideos,
        hasNextPage: skip + videos.length < totalVideos,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching videos with products:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get single content video with products
exports.getContentVideoWithProducts = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { userId } = req.query;

    const video = await ContentVideo.findById(videoId)
      .populate('userId', 'displayName email phoneNumber profilePicture')
      .populate('creatorId', 'displayName email phoneNumber profilePicture')
      .populate({
        path: 'products.productId',
        select: 'productName price coverImage sku category subCategory description variants designerRef',
        populate: {
          path: 'designerRef',
          select: 'displayName email phoneNumber profilePicture'
        }
      })
      .populate('comments.userId', 'displayName email phoneNumber profilePicture')
      .lean();

    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    // Add user reaction information if userId is provided
    if (userId) {
      video.userReaction = null;
      if (video.likedBy && video.likedBy.includes(userId)) {
        video.userReaction = 'like';
      } else if (video.dislikedBy && video.dislikedBy.includes(userId)) {
        video.userReaction = 'dislike';
      }
    }

    res.status(200).json({ video });
  } catch (error) {
    console.error("Error fetching video with products:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Add video with products - enhanced version with creatorId or designerId support
exports.addVideoWithProducts = async (req, res) => {
  try {
    const { 
      userId, 
      creatorId,
      designerId, 
      videoUrl, 
      title, 
      description,
      productIds, 
      isApproved = false 
    } = req.body;

    // Validate required fields
    if (!userId || !videoUrl || !title) {
      return res.status(400).json({ 
        success: false,
        message: "User ID, Video URL, and title are required." 
      });
    }

    // Validate that at least one of creatorId or designerId is provided
    if (!creatorId && !designerId) {
      return res.status(400).json({ 
        success: false,
        message: "Either creatorId or designerId (or both) must be provided." 
      });
    }

    // Validate ObjectId format for userId
    if (!require('mongoose').Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid User ID format." 
      });
    }

    // Validate ObjectId format for creatorId if provided
    if (creatorId && !require('mongoose').Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid Creator ID format." 
      });
    }

    // Validate ObjectId format for designerId if provided
    if (designerId && !require('mongoose').Types.ObjectId.isValid(designerId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid Designer ID format." 
      });
    }

    // Validate video URL format (basic validation)
    if (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
      return res.status(400).json({ 
        success: false,
        message: "Video URL must be a valid HTTP/HTTPS URL." 
      });
    }

    // Validate product IDs if provided
    if (productIds && (!Array.isArray(productIds) || productIds.length === 0)) {
      return res.status(400).json({ 
        success: false,
        message: "Product IDs must be a non-empty array." 
      });
    }

    // Validate each product ID format
    if (productIds && productIds.length > 0) {
      for (const productId of productIds) {
        if (!require('mongoose').Types.ObjectId.isValid(productId)) {
          return res.status(400).json({ 
            success: false,
            message: `Invalid Product ID format: ${productId}` 
          });
        }
      }
    }

    // Check if user exists
    const User = require("../models/userModel");
    const user = await User.findById(userId).select('_id displayName email');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found." 
      });
    }

    // Check if creator exists (if creatorId provided)
    let creator = null;
    if (creatorId) {
      const creatorUser = await User.findById(creatorId).select('_id displayName email');
      if (!creatorUser) {
        return res.status(404).json({ 
          success: false,
          message: "Creator not found." 
        });
      }
      creator = creatorUser;
    }

    // Check if designer exists (if designerId provided)
    let designer = null;
    if (designerId) {
      const Designer = require("../models/designerModel");
      designer = await Designer.findById(designerId).select('_id shortDescription about');
      if (!designer) {
        return res.status(404).json({ 
          success: false,
          message: "Designer not found." 
        });
      }
    }

    // Check if products exist (if productIds provided)
    if (productIds && productIds.length > 0) {
      const Product = require("../models/productModels");
      const existingProducts = await Product.find({ 
        _id: { $in: productIds } 
      }).select('_id productName sku price');
      
      if (existingProducts.length !== productIds.length) {
        const foundIds = existingProducts.map(p => p._id.toString());
        const missingIds = productIds.filter(id => !foundIds.includes(id));
        return res.status(404).json({ 
          success: false,
          message: `Products not found: ${missingIds.join(', ')}` 
        });
      }
    }

    // Prepare products array
    const products = productIds ? productIds.map(productId => ({
      productId,
      addedAt: new Date()
    })) : [];

    // Determine the creatorId for the video
    // Priority: designerId > creatorId > userId (fallback)
    const finalCreatorId = designerId || creatorId || userId;

    // Create the video with products
    const newVideo = new ContentVideo({
      userId,
      creatorId: finalCreatorId,
      videoUrl,
      title,
      description: description || '',
      is_approved: isApproved,
      products,
      createdDate: new Date()
    });

    await newVideo.save();

    // Populate the video with all related data
    await newVideo.populate([
      {
        path: 'userId',
        select: 'displayName email phoneNumber profilePicture'
      },
      {
        path: 'creatorId',
        select: 'displayName email phoneNumber profilePicture shortDescription about'
      },
      {
        path: 'products.productId',
        select: 'productName price coverImage sku category subCategory designerRef description',
        populate: {
          path: 'designerRef',
          select: 'displayName email phoneNumber profilePicture shortDescription'
        }
      }
    ]);

    res.status(201).json({
      success: true,
      message: "Video with products created successfully",
      video: {
        _id: newVideo._id,
        title: newVideo.title,
        description: newVideo.description,
        videoUrl: newVideo.videoUrl,
        is_approved: newVideo.is_approved,
        createdDate: newVideo.createdDate,
        no_of_likes: newVideo.no_of_likes,
        no_of_dislikes: newVideo.no_of_dislikes,
        no_of_Shares: newVideo.no_of_Shares,
        userId: newVideo.userId,
        creatorId: newVideo.creatorId,
        designerId: designerId || null, // Return the designerId if provided
        products: newVideo.products,
        totalProducts: newVideo.products.length
      }
    });
  } catch (error) {
    console.error("Error creating video with products:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Get videos by product with enhanced details
exports.getVideosByProductEnhanced = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 10, page = 1, approved = true, userId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Validate product ID
    if (!productId) {
      return res.status(400).json({ 
        message: "Product ID is required." 
      });
    }

    // Check if product exists
    const Product = require("../models/productModels");
    const product = await Product.findById(productId).select('productName price coverImage');
    if (!product) {
      return res.status(404).json({ 
        message: "Product not found." 
      });
    }

    // Build query
    const query = {
      'products.productId': productId
    };
    if (approved === 'true' || approved === true) {
      query.is_approved = true;
    }

    const videos = await ContentVideo.find(query)
      .populate('userId', 'displayName email phoneNumber profilePicture')
      .populate('creatorId', 'displayName email phoneNumber profilePicture')
      .populate({
        path: 'products.productId',
        select: 'productName price coverImage sku category subCategory designerRef',
        populate: {
          path: 'designerRef',
          select: 'displayName email phoneNumber profilePicture'
        }
      })
      .populate('comments.userId', 'displayName email phoneNumber profilePicture')
      .sort({ createdDate: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Add user reaction information if userId is provided
    if (userId) {
      videos.forEach(video => {
        video.userReaction = null;
        if (video.likedBy && video.likedBy.includes(userId)) {
          video.userReaction = 'like';
        } else if (video.dislikedBy && video.dislikedBy.includes(userId)) {
          video.userReaction = 'dislike';
        }
      });
    }

    // Get total count for pagination
    const totalVideos = await ContentVideo.countDocuments(query);

    res.status(200).json({
      success: true,
      product: {
        _id: product._id,
        productName: product.productName,
        price: product.price,
        coverImage: product.coverImage
      },
      videos,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalVideos / parseInt(limit)),
        totalVideos,
        hasNextPage: skip + videos.length < totalVideos,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching videos by product:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get videos by user ID with enhanced details
exports.getVideosByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, page = 1, approved = true, currentUserId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Validate user ID
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: "User ID is required." 
      });
    }

    // Validate ObjectId format
    if (!require('mongoose').Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid User ID format." 
      });
    }

    // Check if user exists
    const User = require("../models/userModel");
    const user = await User.findById(userId)
      .select('_id displayName email phoneNumber profilePicture role');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found." 
      });
    }

    // Build query - videos where userId matches the requested userId
    const query = {
      userId: userId
    };
    if (approved === 'true' || approved === true) {
      query.is_approved = true;
    }

    const videos = await ContentVideo.find(query)
      .populate('userId', 'displayName email phoneNumber profilePicture')
      .populate('creatorId', 'displayName email phoneNumber profilePicture shortDescription about')
      .populate({
        path: 'products.productId',
        select: 'productName price coverImage sku category subCategory designerRef description',
        populate: {
          path: 'designerRef',
          select: 'displayName email phoneNumber profilePicture shortDescription'
        }
      })
      .populate('comments.userId', 'displayName email phoneNumber profilePicture')
      .sort({ createdDate: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Add user reaction information if currentUserId is provided
    if (currentUserId) {
      videos.forEach(video => {
        video.userReaction = null;
        if (video.likedBy && video.likedBy.includes(currentUserId)) {
          video.userReaction = 'like';
        } else if (video.dislikedBy && video.dislikedBy.includes(currentUserId)) {
          video.userReaction = 'dislike';
        }
      });
    }

    // Get total count for pagination
    const totalVideos = await ContentVideo.countDocuments(query);

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        displayName: user.displayName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        role: user.role
      },
      videos,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalVideos / parseInt(limit)),
        totalVideos,
        hasNextPage: skip + videos.length < totalVideos,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching videos by user:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
