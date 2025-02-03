const Notifications = require("../models/notificationsModel");
const User = require("../models/userModel");
const { admin } = require("../config/firebaseService");

// Create a new order notification
exports.sendFcmNotification = async (fcmToken, title, body) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      token: fcmToken,
    };

    const response = await admin.messaging().send(message);
    console.log("Notification sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending FCM notification:", error.message);
    throw error;
  }
};
exports.createNotification = async ({
  userId,
  designeref,
  message,
  orderId,
}) => {
  try {
    const newNotification = new Notifications({
      userId,
      designeref,
      message,
      orderId,
    });

    await newNotification.save();
    return { success: true, data: newNotification };
  } catch (error) {
    throw new Error(`Failed to create notification: ${error.message}`);
  }
};
exports.createOrderNotification = async (req, res) => {
  try {
    const { userId, designeref, message, orderId } = req.body;

    const newNotification = new Notifications({
      userId,
      designeref,
      message,
      orderId,
    });

    await newNotification.save();

    res.status(201).json({
      success: true,
      message: "Order notification created successfully",
      data: newNotification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating order notification",
      error: error.message,
    });
  }
};

exports.getLatestBroadcastNotification = async (req, res) => {
  try {
    const latestNotification = await Notifications.findOne({
      userId: null, // Filter for broadcast notifications without specific userId
    }).sort({ createdDate: -1 }); // Sort by createdDate to get the latest

    if (!latestNotification) {
      return res.status(404).json({
        success: false,
        message: "No broadcast notifications found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Latest broadcast notification retrieved successfully",
      data: latestNotification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving broadcast notification",
      error: error.message,
    });
  }
};

// Get all broadcast notifications
exports.getAllBroadcastNotifications = async (req, res) => {
  try {
    const notifications = await Notifications.find({
      userId: null, // Filter for broadcast notifications without specific userId
    }).sort({ createdDate: -1 }); // Sort by createdDate to get in reverse chronological order

    res.status(200).json({
      success: true,
      message: "All broadcast notifications retrieved successfully",
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving broadcast notifications",
      error: error.message,
    });
  }
};

// Get all notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notifications.find().populate(
      "userId designeref orderId"
    );

    res.status(200).json({
      success: true,
      message: "All notifications retrieved successfully",
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving notifications",
      error: error.message,
    });
  }
};

// Get notifications by designer
exports.getNotificationByDesigner = async (req, res) => {
  try {
    const { designerId } = req.params;
    const notifications = await Notifications.find({
      designeref: designerId,
    }).populate("userId orderId");

    if (!notifications.length) {
      return res.status(404).json({
        success: false,
        message: "No notifications found for this designer",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving notifications for designer",
      error: error.message,
    });
  }
};

exports.updateFcmToken = async (req, res) => {
  try {
    const { userId, fcmToken } = req.body;

    if (!userId || !fcmToken) {
      return res.status(400).json({
        success: false,
        message: "User ID and FCM token are required",
      });
    }

    // Update user's FCM token
    const user = await User.findByIdAndUpdate(
      userId,
      { fcmToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "FCM token updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating FCM token",
      error: error.message,
    });
  }
};exports.sendNotificationToAllUsers = async (req, res) => {
  try {
    const { title, body, image } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "Title and body are required",
      });
    }

    // Fetch all users with an FCM token
    const usersWithFcmTokens = await User.find({
      fcmToken: { $exists: true, $ne: null },
    }).select("fcmToken email displayName");

    if (!usersWithFcmTokens.length) {
      return res.status(404).json({
        success: false,
        message: "No users with FCM tokens found",
      });
    }

    // Prepare the FCM message with optional image
    const message = {
      notification: {
        title,
        body,
        ...(image && { image }), // Optional image field
      },
    };

    let successCount = 0;
    let failedCount = 0;
    const failedUsers = []; // To store users for whom notification failed

    // Send notifications to each user and handle individual errors
    const sendPromises = usersWithFcmTokens.map(async (user) => {
      try {
        const userMessage = { ...message, token: user.fcmToken };
        await admin.messaging().send(userMessage);
        successCount++; // Increment success count
      } catch (error) {
        console.error(
          `Failed to send notification to user: ${user.email}`,
          error.message
        );
        failedUsers.push({ email: user.email, fcmToken: user.fcmToken });
        failedCount++; // Increment failure count
      }
    });

    await Promise.all(sendPromises);

    // Save the notification in the database for record-keeping
    const newNotification = new Notifications({
      title,
      message: body,
      image: image || null,
    });

    await newNotification.save();

    // Extract the list of users to whom notifications were sent
    const sentUsers = usersWithFcmTokens.map((user) => ({
      email: user.email,
      displayName: user.displayName,
      fcmToken: user.fcmToken,
    }));

    res.status(200).json({
      success: true,
      message: `Notification sent successfully. Success: ${successCount}, Failed: ${failedCount}`,
      sentUsers,
      failedUsers,
      data: newNotification,
    });
  } catch (error) {
    console.error("Error in sending notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error sending notifications to all users",
      error: error.message,
    });
  }
};


// Create a new return notification
exports.createReturnNotification = async (req, res) => {
  try {
    const { userId, designeref, message, returnId } = req.body;

    const newNotification = new Notifications({
      userId,
      designeref,
      message,
      returnId,
    });

    await newNotification.save();

    res.status(201).json({
      success: true,
      message: "Return notification created successfully",
      data: newNotification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating return notification",
      error: error.message,
    });
  }
};
