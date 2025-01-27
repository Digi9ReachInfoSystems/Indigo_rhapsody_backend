const User = require("../models/userModel");
const Designer = require("../models/designerModel");
const { bucket } = require("../service/firebaseServices");
const { admin } = require("../service/firebaseServices");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AUTH_API_URL = "https://indigorhapsodyserver-h9a3.vercel.app/auth/login";
const nodemailer = require("nodemailer");
require("dotenv").config();
const { Twilio } = require("twilio");
const axios = require("axios");

// Twilio setup
const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const otpStorage = new Map();

// Send OTP using Firebase Authentication
exports.requestOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    // Simulate OTP request using Firebase Admin (Firebase does not expose direct SMS sending via Admin SDK)
    const sessionInfo = await admin.auth().createSessionCookie(phoneNumber, {
      expiresIn: 5 * 60 * 1000, // Expires in 5 minutes
    });

    // Save sessionInfo for later verification
    otpStorage.set(sessionInfo, {
      phoneNumber,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    res.status(200).json({
      message: "OTP sent successfully",
      sessionInfo,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to send OTP", error: error.message });
  }
};

// Verify OTP using Firebase
exports.verifyOtp = async (req, res) => {
  const { sessionInfo, otp } = req.body;

  if (!sessionInfo || !otp) {
    return res
      .status(400)
      .json({ message: "Session Info and OTP are required" });
  }

  try {
    // Check if the session exists
    const storedSession = otpStorage.get(sessionInfo);

    if (!storedSession) {
      return res.status(404).json({ message: "OTP not found or expired" });
    }

    if (storedSession.expiresAt < Date.now()) {
      otpStorage.delete(sessionInfo); // Remove expired session
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Verify OTP using Firebase (Replace with Firebase's actual verification API)
    const verified = otp === "123456"; // Example verification logic (replace with Firebase OTP verification)

    if (verified) {
      otpStorage.delete(sessionInfo); // Remove session after successful verification
      res.status(200).json({ message: "OTP verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to verify OTP", error: error.message });
  }
};
exports.createUser = async (req, res) => {
  try {
    const {
      email,
      displayName,
      phoneNumber,
      password,
      role,
      is_creator,
      address, // Array of addresses
    } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Create a new user with the provided details, including the address array
    const newUser = new User({
      email,
      displayName,
      phoneNumber,
      password,
      role,
      is_creator,
      address,
    });

    // Save the new user to the database
    await newUser.save();

    // Set up the email transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: "Info@gully2global.com",
        pass: "Shasudigi@217",
      },
    });

    // Email options
    const mailOptions = {
      from: '"Indigo Rhapsody" <Info@gully2global.com>',
      to: email,
      subject: "Welcome to Indigo Rhapsody Mobile Application",
      html: `
       <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome Email</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f9f9f9;
      }
      .email-container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background-color: #004080;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
      .header img {
        max-width: 100px;
        margin-bottom: 10px;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .content {
        padding: 20px;
        text-align: center;
      }
      .content h2 {
        font-size: 22px;
        color: #333333;
      }
      .content p {
        font-size: 16px;
        color: #666666;
        margin: 10px 0;
      }
      .content a.button {
        display: inline-block;
        margin-top: 20px;
        padding: 12px 25px;
        background-color: #004080;
        color: #ffffff;
        text-decoration: none;
        font-size: 16px;
        border-radius: 5px;
      }
      .footer {
        background-color: #f4f4f4;
        padding: 15px;
        text-align: center;
        font-size: 14px;
        color: #999999;
      }
      .footer a {
        color: #004080;
        text-decoration: none;
        margin: 0 5px;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/sveccha-11c31.appspot.com/o/Logo.png?alt=media&token=c8b4c22d-8256-4092-8b46-e89e001bd1fe"
          alt="Indigo Rhapsody Logo"
        />
        <h1>Welcome to Indigo Rhapsody</h1>
      </div>
      <div class="content">
        <h2>Hello, ${displayName}</h2>
        <p>Welcome to Indigo Rhapsody. We are excited to have you on our platform!</p>
        <p>Continue Shopping on our Mobile App.</p>
      </div>
      <div class="content">
        <img
          src="https://marketplace.canva.com/EAFoEJMTGiI/1/0/1600w/canva-beige-aesthetic-new-arrival-fashion-banner-landscape-cNjAcBMeF9s.jpg"
          alt="Indigo Rhapsody Banner"
        />
      </div>
      <div class="footer">
        <p>
          Follow us for updates:
          <a href="https://twitter.com" target="_blank">Twitter</a> |
          <a href="https://facebook.com" target="_blank">Facebook</a> |
          <a href="https://instagram.com" target="_blank">Instagram</a>
        </p>
        <p>
          If you have any questions, simply reply to this email. We're here to help!
        </p>
        <p>Unsubscribe | Privacy Policy</p>
      </div>
    </div>
  </body>
</html>
      `,
    };

    // Send the welcome email
    await transporter.sendMail(mailOptions);

    // Respond with success
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.updateUserAddress = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from request parameters
    const { addressId, nick_name, city, pincode, state, street_details } =
      req.body; // Get address details from request body

    // Check if addressId is provided (to determine if updating an existing address)
    if (addressId) {
      // Update specific address in the array
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId, "address._id": addressId }, // Find the user and specific address by its ID
        {
          $set: {
            "address.$.nick_name": nick_name,
            "address.$.city": city,
            "address.$.pincode": pincode,
            "address.$.state": state,
            "address.$.street_details": street_details,
          },
        },
        { new: true } // Return the updated document
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User or address not found" });
      }

      return res
        .status(200)
        .json({ message: "Address updated successfully", user: updatedUser });
    } else {
      // Add a new address to the array
      const updatedUser = await User.findByIdAndUpdate(
        userId, // Find user by ID
        {
          $push: {
            address: {
              nick_name,
              city,
              pincode,
              state,
              street_details,
            },
          },
        },
        { new: true } // Return the updated document
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      return res
        .status(200)
        .json({ message: "Address added successfully", user: updatedUser });
    }
  } catch (error) {
    console.error("Error updating address:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const filters = req.query;
    const users = await User.find(filters);

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
exports.getTotalUserCount = async (req, res) => {
  try {
    // Count the number of users with the role "User"
    const totalUsers = await User.countDocuments({ role: "User" });

    return res.status(200).json({ totalUsers });
  } catch (error) {
    console.error("Error fetching total user count:", error);
    return res.status(500).json({
      message: "Error fetching total user count",
      error: error.message,
    });
  }
};

exports.getNewUsersByCurrentMonth = async (req, res) => {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    const newUserCount = await User.countDocuments({
      role: "User",
      createdTime: { $gte: firstDayOfMonth },
    });

    res.status(200).json({ newUserCount });
  } catch (error) {
    console.error("Error fetching new users by month:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Endpoint to get new users count by state (only with role "User")
exports.getUserCountByState = async (req, res) => {
  try {
    const usersByState = await User.aggregate([
      { $match: { role: "User" } }, // Filter for role "User"
      { $group: { _id: "$state", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({ usersByState });
  } catch (error) {
    console.error("Error fetching users by state:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Endpoint to get the state with the most users (only with role "User")
exports.getStateWithMostUsers = async (req, res) => {
  try {
    const mostUsersState = await User.aggregate([
      { $match: { role: "User" } }, // Filter for role "User"
      { $group: { _id: "$state", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    if (!mostUsersState.length) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({ mostUsersState: mostUsersState[0] });
  } catch (error) {
    console.error("Error fetching state with most users:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Endpoint to get all users with the role "User"
exports.getAllUsersWithRoleUser = async (req, res) => {
  try {
    const users = await User.find({ role: "User" }); // Filter for role "User"

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users with role User:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
exports.createUserAndDesigner = async (req, res) => {
  const session = await User.startSession();
  let transactionCommitted = false; // Flag to track transaction status
  session.startTransaction();

  try {
    const {
      email,
      password,
      displayName,
      phoneNumber,
      role,
      address,
      city,
      state,
      pincode,
      is_creator,
      shortDescription,
      about,
      logoUrl,
      backgroundImageUrl,
    } = req.body;

    // Generate a random 3-digit number and prepend it to displayName for pickup_location_name
    const randomId = Math.floor(100 + Math.random() * 900); // Random 3-digit number
    const pickup_location_name = `${randomId}_${displayName}`;

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction(); // Abort if user already exists
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Create pickup location using pickup_location_name
    const addPickupResponse = await addPickupLocation({
      pickup_location: pickup_location_name,
      name: displayName,
      email,
      phone: phoneNumber,
      address,
      address_2: "", // Additional address line, if any
      city,
      state,
      country: "India",
      pin_code: pincode,
    });

    // Step 1: Create Firebase Auth User
    const firebaseUser = await admin.auth().createUser({
      email,
      password,
      displayName,
      phoneNumber,
    });

    console.log("Firebase user created:", firebaseUser.uid);

    // Step 2: Create MongoDB User
    const newUser = new User({
      email,
      displayName,
      phoneNumber,
      password, // You may choose to hash this before storing.
      role,
      address,
      city,
      state,
      pincode,
      is_creator,
      firebaseUid: firebaseUser.uid, // Store Firebase UID for reference
      pickup_location_name, // Store pickup_location_name in the user document
    });

    await newUser.save({ session });

    // Step 3: Create Designer Document
    const newDesigner = new Designer({
      userId: newUser._id,
      logoUrl: logoUrl || null,
      backGroundImage: backgroundImageUrl || null,
      shortDescription,
      about,
    });

    await newDesigner.save({ session });

    // Commit transaction
    await session.commitTransaction();
    transactionCommitted = true; // Set flag to true after commit

    session.endSession();

    // Send welcome email
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: "Info@gully2global.com",
        pass: "Shasudigi@217",
      },
    });

    const mailOptions = {
      from: '"Indigo Rhapsody" <Info@gully2global.com>',
      to: email,
      subject: "Welcome to Indigo Rhapsody",
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <!-- HTML Email Content -->
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "User, Designer, and Pickup Location created successfully",
      user: newUser,
      designer: newDesigner,
      pickupResponse: addPickupResponse,
    });
  } catch (error) {
    if (!transactionCommitted) {
      // Only abort if the transaction has not been committed
      await session.abortTransaction();
    }
    session.endSession();
    console.error("Error creating user, designer, or pickup location:", error);
    res.status(500).json({
      message: `${error.code || "Error"}: ${error.message}`,
      error: error.message,
    });
  }
};

// AddPickupLocation function
const addPickupLocation = async (pickupDetails) => {
  try {
    // Fetch access token
    const authResponse = await fetch(AUTH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "rajatjiedm@gmail.com", // Replace with actual credentials
        password: "Raaxas12#", // Replace with actual credentials
      }),
    });

    const authBody = await authResponse.json();

    if (!authResponse.ok) {
      console.error("Failed to get access token:", authBody);
      throw new Error(authBody.message || "Failed to get access token");
    }

    const authToken = authBody.token;

    // Send request to Shiprocket API
    const response = await fetch(
      "https://apiv2.shiprocket.in/v1/external/settings/company/addpickup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(pickupDetails),
      }
    );

    const responseBody = await response.json();

    if (!response.ok) {
      console.error("Failed to add pickup location:", responseBody);
      throw new Error(responseBody.message || "Failed to add pickup location");
    }

    return responseBody;
  } catch (error) {
    console.error("Error adding pickup location:", error);
    throw error;
  }
};
exports.loginDesigner = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Step 1: Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Step 2: Check if the user's role is "Designer"
    if (user.role !== "Designer") {
      return res.status(403).json({ message: "Access denied. Not a designer" });
    }

    // Step 3: Validate the password (plain text comparison)
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Step 4: Find the associated designer record
    const designer = await Designer.findOne({ userId: user._id });
    if (!designer) {
      return res.status(404).json({ message: "Designer profile not found" });
    }

    // Step 5: Check if the designer is approved
    if (!designer.is_approved) {
      return res.status(403).json({
        message: "Access denied. Your profile is not approved yet.",
      });
    }

    // Step 6: Generate a token (optional)
    // Uncomment and integrate JWT token logic if needed
    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: "1h",
    // });

    // Step 7: Return userId, designerId, and token (if applicable)
    res.status(200).json({
      message: "Login successful",
      userId: user._id,
      designerId: designer._id,
      // token, // Add token here if enabled
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Step 1: Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Step 2: Check if the user's role is "Admin"
    if (user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied. Not an admin" });
    }

    // Step 3: Validate the password (you should ideally use bcrypt for hashed passwords)
    const isPasswordValid = password === user.password; // Replace with bcrypt.compare if using hashed passwords
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Step 4: Generate a token (for authorization purposes)

    // Step 5: Return userId, role, and token
    res.status(200).json({
      message: "Login successful",
      userId: user._id,
      role: user.role,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
