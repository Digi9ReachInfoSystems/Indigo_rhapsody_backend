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
    });

    // Save the new user to the database
    await newUser.save();

    // Set up the email transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: "info@indigorhapsody.com",
        pass: "InfoPassword123#@",
      },
    });

    // Email options
    const mailOptions = {
      from: '"Indigo Rhapsody" <info@indigorhapsody.com>',
      to: email,
      subject: "Welcome to Indigo Rhapsody Mobile Application",
     html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-collapse: collapse;">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 20px 20px; text-align: center;">
              <div style="display: inline-block; width: 60px; height: 60px; background-color: #0d47a1; color: white; font-size: 24px; font-weight: bold; line-height: 60px; text-align: center; margin-bottom: 10px;">
                            <img src="https://firebasestorage.googleapis.com/v0/b/sveccha-11c31.appspot.com/o/Logo.png?alt=media&token=c8b4c22d-8256-4092-8b46-e89e001bd1fe" alt="Welcome illustration" style="max-width: 700px; width: 100%; height: auto; display: block; margin: 0 auto;">

              </div>
              <div style="font-size: 12px; color: #666666; letter-spacing: 2px; margin-top: 5px;">
                INDIGO RHAPSODY<br>
                <span style="font-size: 10px;">MOBILE EXPERIENCE</span>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 20px 40px; text-align: center;">
              <h2 style="margin: 0 0 10px; font-size: 16px; color: #666666; font-weight: normal; letter-spacing: 1px;">Hello, ${displayName}</h2>
              <h1 style="margin: 0 0 20px; font-size: 32px; color: #0d47a1; font-weight: bold; line-height: 1.2;">Nice to meet you!</h1>
              <p style="margin: 0 0 30px; font-size: 16px; color: #666666; line-height: 1.5;">Welcome to Indigo Rhapsody. We are very happy to have you with us.</p>
              <p style="margin: 0 0 30px; font-size: 18px; color: #0d47a1; font-weight: 500;">Enjoy your journey with Us</p>
              <a href="https://indigorhapsody.com" style="display: inline-block; background-color: #0d47a1; color: white; text-decoration: none; padding: 15px 40px; border-radius: 25px; font-size: 16px; font-weight: 500; letter-spacing: 1px;">VISIT WEBSITE</a>
            </td>
          </tr>

          <!-- Illustration -->
          <tr>
            <td style="padding: 40px 20px; text-align: center;">
              <img src="https://firebasestorage.googleapis.com/v0/b/popandpose-1ea69.firebasestorage.app/o/images%2FChatGPT%20Image%20Jun%202%2C%202025%2C%2004_18_45%20PM.png?alt=media&token=088a409e-e20a-4900-9012-5ae37c0e5b86" alt="Welcome illustration" style="max-width: 700px; width: 100%; height: auto; display: block; margin: 0 auto;">
            </td>
          </tr>

          <!-- Footer Logo -->
          <tr>
            <td style="padding: 40px 20px 20px; text-align: center; border-top: 1px solid #eeeeee;">
              <div style="display: inline-block; width: 60px; height: 60px; background-color: #0d47a1; color: white; font-size: 24px; font-weight: bold; line-height: 60px; text-align: center; margin-bottom: 20px;">
                                            <img src="https://firebasestorage.googleapis.com/v0/b/sveccha-11c31.appspot.com/o/Logo.png?alt=media&token=c8b4c22d-8256-4092-8b46-e89e001bd1fe" alt="Welcome illustration" style="max-width: 700px; width: 100%; height: auto; display: block; margin: 0 auto;">

              </div>
            </td>
          </tr>

          <!-- Social Follow Text -->
          <tr>
            <td style="padding: 0 20px 20px; text-align: center;">
              <p style="margin: 0; font-size: 16px; color: #666666;">Follow us on social platforms to receive updates and exclusive offers</p>
            </td>
          </tr>

          <!-- Social Icons -->
          <tr>
            <td style="padding: 0 20px 30px; text-align: center;">
              <table role="presentation" style="margin: 0 auto; border-collapse: collapse;">
                <tr>
                  <td style="padding: 0 10px;">
                    <a href="https://www.facebook.com/profile.php?id=61557629035469#" style="display: inline-block; width: 40px; height: 40px; background-color: #0d47a1; border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none;">
                      <span style="color: white; font-size: 18px;">
                                             <img src="https://upload.wikimedia.org/wikipedia/commons/c/cd/Facebook_logo_%28square%29.png" alt="Welcome illustration" style="max-width: 700px; width: 100%; height: auto; display: block; margin: 0 auto;">

</span>
                    </a>
                  </td>
                  <td style="padding: 0 10px;">
                    <a href="https://www.instagram.com/indigorhapsodyofficial/" style="display: inline-block; width: 40px; height: 40px; background-color: #0d47a1; border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none;">
                      <span style="color: white; font-size: 18px;">                                                 
                       <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/1200px-Instagram_icon.png" alt="Welcome illustration" style="max-width: 700px; width: 100%; height: auto; display: block; margin: 0 auto;">
</span>
                    </a>
                  </td>
                 
                </tr>
              </table>
            </td>
          </tr>

          <!-- Navigation Links -->
          <tr>
            <td style="padding: 0 20px 30px; text-align: center;">
              <table role="presentation" style="margin: 0 auto; border-collapse: collapse;">
                <tr>
                  <td style="padding: 0 20px;">
                    <a href="https://indigorhapsody.com" style="color: #666666; text-decoration: underline; font-size: 14px;">Home</a>
                  </td>
                  <td style="padding: 0 20px;">
                    <a href="https://indigorhapsody.com/contact" style="color: #666666; text-decoration: underline; font-size: 14px;">Contact</a>
                  </td>
                  <td style="padding: 0 20px;">
                    <a href="https://indigorhapsody.com/services" style="color: #666666; text-decoration: underline; font-size: 14px;">Service</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0d47a1; padding: 30px 20px; text-align: center;">
              <p style="margin: 0 0 20px; color: #cccccc; font-size: 12px; line-height: 1.5;">
                This email was sent to ${email} because you signed up on our app or made a purchase.
              </p>
             
              <div style="display: inline-block; background-color: #1565c0; padding: 8px 15px; border-radius: 4px;">
                <span style="color: white; font-size: 14px; font-weight: bold;">Indigo Rhapsody</span>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
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

exports.getUserAddresses = async (req, res) => {
  try {
    const { userId } = req.params; // Extract the user ID from request parameters

    // Find the user by their ID and select only the address field
    const user = await User.findById(userId).select("address");

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has any addresses
    if (!user.address || user.address.length === 0) {
      return res
        .status(404)
        .json({ message: "No addresses found for this user" });
    }

    // Respond with the list of addresses
    res.status(200).json({
      message: "Addresses fetched successfully",
      addresses: user.address,
    });
  } catch (error) {
    console.error("Error fetching user addresses:", error);
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

    // Sort users by createdTime in descending order (latest first)
    const users = await User.find(filters).sort({ createdTime: -1 });

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
      address, // Array of addresses
      is_creator,
      shortDescription,
      about,
      logoUrl,
      backgroundImageUrl,
    } = req.body;

    // Generate a random 3-digit number and prepend it to displayName for pickup_location_name
    const randomId = Math.floor(100 + Math.random() * 900); // Random 3-digit number
    const pickup_location_name = `${randomId}_${displayName}`;

    // Step 1: Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction(); // Abort if user already exists
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Step 2: Validate and create pickup location for the first address
    if (!address || address.length === 0) {
      throw new Error("At least one address is required");
    }

    const firstAddress = address[0]; // Use the first address for pickup location
    const addPickupResponse = await addPickupLocation({
      pickup_location: pickup_location_name,
      name: displayName,
      email,
      phone: phoneNumber,
      address: firstAddress.street_details,
      address_2: firstAddress.nick_name || "", // Additional address line, if any
      city: firstAddress.city,
      state: firstAddress.state,
      country: "India",
      pin_code: firstAddress.pincode,
    });

    if (!addPickupResponse || !addPickupResponse.success) {
      throw new Error("Failed to create pickup location");
    }

    // Step 3: Create Firebase Auth User
    const firebaseUser = await admin.auth().createUser({
      email,
      password,
      displayName,
      phoneNumber,
    });

    if (!firebaseUser || !firebaseUser.uid) {
      throw new Error("Failed to create Firebase user");
    }

    // Step 4: Create MongoDB User with address array
    const newUser = new User({
      email,
      displayName,
      phoneNumber,
      password, // Hash the password in production
      role,
      is_creator,
      firebaseUid: firebaseUser.uid, // Store Firebase UID for reference
      pickup_location_name, // Store pickup_location_name in the user document
      address, // Save the array of addresses
    });

    await newUser.save({ session });

    // Step 5: Create Designer Document
    const newDesigner = new Designer({
      userId: newUser._id,
      logoUrl: logoUrl || null,
      backGroundImage: backgroundImageUrl || null,
      shortDescription,
      about,
      pickup_location_name,
    });

    await newDesigner.save({ session });

    // Commit transaction
    await session.commitTransaction();
    transactionCommitted = true; // Set flag to true after commit

    session.endSession();

    // Step 6: Send welcome email
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
          <head>
            <meta charset="UTF-8">
            <title>Welcome</title>
          </head>
          <body>
            <h1>Welcome to Indigo Rhapsody!</h1>
            <p>Thank you for joining our platform, ${displayName}.</p>
          </body>
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
    // Abort transaction and rollback if any step fails
    if (!transactionCommitted) {
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

exports.checkUserExists = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });
    if (user) {
      return res.status(200).json({
        success: true,
        message: "User exists",
        userId: user._id,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Error checking user existence:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
