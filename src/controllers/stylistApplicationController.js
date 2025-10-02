const mongoose = require("mongoose");
const StylistProfile = require("../models/stylistProfile");
const User = require("../models/userModel");
const phonepeService = require("../service/phonepeService");
const {
    createNotification,
    sendFcmNotification,
} = require("./notificationController");

// Submit stylist application (without creating user account)
exports.submitStylistApplication = async (req, res) => {
    try {
        const {
            // User account fields
            displayName,
            email,
            phoneNumber,
            password,

            // Stylist profile fields
            stylistName,
            stylistEmail,
            stylistPhone,
            stylistAddress,
            stylistCity,
            stylistState,
            stylistPincode,
            stylistCountry,
            stylistImage,
            stylistBio,
            stylistPortfolio,
            stylistExperience,
            stylistEducation,
            stylistSkills,
            stylistAvailability,
            stylistPrice
        } = req.body;

        // Validate required user fields
        if (!displayName || !email || !phoneNumber || !password) {
            return res.status(400).json({
                success: false,
                message: "Display name, email, phone number, and password are required"
            });
        }

        // Validate required stylist fields
        const requiredStylistFields = [
            'stylistName',
            'stylistEmail',
            'stylistPhone',
            'stylistAddress',
            'stylistCity',
            'stylistState',
            'stylistPincode',
            'stylistCountry',
            'stylistImage',
            'stylistBio',
            'stylistPortfolio',
            'stylistExperience',
            'stylistEducation',
            'stylistSkills',
            'stylistAvailability'
        ];

        for (const field of requiredStylistFields) {
            if (!req.body[field]) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required for stylist profile`
                });
            }
        }

        // Validate arrays
        if (!Array.isArray(stylistPortfolio) || stylistPortfolio.length === 0) {
            return res.status(400).json({
                success: false,
                message: "stylistPortfolio must be a non-empty array"
            });
        }

        if (!Array.isArray(stylistSkills) || stylistSkills.length === 0) {
            return res.status(400).json({
                success: false,
                message: "stylistSkills must be a non-empty array"
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        if (!emailRegex.test(stylistEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid stylist email format"
            });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email },
                { phoneNumber: phoneNumber }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email or phone number"
            });
        }

        // Check if stylist email is already used
        const existingStylist = await StylistProfile.findOne({
            stylistEmail: stylistEmail
        });

        if (existingStylist) {
            return res.status(400).json({
                success: false,
                message: "Stylist profile already exists with this email"
            });
        }

        // Create temporary stylist application (without user account)
        const applicationId = new mongoose.Types.ObjectId();
        const registrationFee = 500; // Default registration fee

        const stylistApplication = new StylistProfile({
            _id: applicationId,
            // Store user data temporarily (will be used after approval)
            tempUserData: {
                displayName,
                email,
                phoneNumber,
                password, // Will be hashed after approval
            },
            stylistName,
            stylistEmail,
            stylistPhone,
            stylistAddress,
            stylistCity,
            stylistState,
            stylistPincode,
            stylistCountry,
            stylistImage,
            stylistBio,
            stylistPortfolio,
            stylistExperience,
            stylistEducation,
            stylistSkills,
            stylistAvailability,
            stylistPrice: stylistPrice || 0,
            stylistRating: 0,
            stylistReviews: [],
            applicationStatus: 'submitted',
            isApproved: false,
            approvalStatus: 'pending',
            registrationFee,
            paymentStatus: 'pending',
            paymentAmount: registrationFee,
            paymentCurrency: 'INR',
            paymentMethod: 'phonepe',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await stylistApplication.save();

        return res.status(201).json({
            success: true,
            message: "Stylist application submitted successfully. Please complete payment to proceed.",
            data: {
                applicationId: stylistApplication._id,
                registrationFee,
                applicationStatus: 'submitted',
                nextStep: 'payment'
            }
        });

    } catch (error) {
        console.error("Stylist application submission error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit stylist application",
            error: error.message
        });
    }
};

// Initiate payment for stylist application
exports.initiatePayment = async (req, res) => {
    try {
        const { applicationId } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID format"
            });
        }

        // Find the application
        const application = await StylistProfile.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Stylist application not found"
            });
        }

        if (application.applicationStatus !== 'submitted') {
            return res.status(400).json({
                success: false,
                message: `Application cannot be paid for. Current status: ${application.applicationStatus}`
            });
        }

        if (application.paymentStatus === 'completed') {
            return res.status(400).json({
                success: false,
                message: "Payment already completed for this application"
            });
        }

        // Generate payment reference ID
        const paymentReferenceId = `STYLIST_${applicationId}_${Date.now()}`;

        // Prepare payment data for PhonePe
        const paymentData = {
            amount: application.registrationFee,
            orderId: paymentReferenceId,
            customerId: applicationId.toString(),
            customerEmail: application.tempUserData.email,
            customerPhone: application.tempUserData.phoneNumber,
            customerName: application.tempUserData.displayName,
            description: `Stylist Registration Fee - ${application.stylistName}`
        };

        // Create payment request with PhonePe
        const paymentResponse = await phonepeService.createPaymentRequest(paymentData);

        if (!paymentResponse.success) {
            return res.status(500).json({
                success: false,
                message: "Failed to create payment request",
                error: paymentResponse.message
            });
        }

        // Update application with payment details
        application.paymentReferenceId = paymentReferenceId;
        application.paymentId = paymentResponse.data.paymentId;
        application.applicationStatus = 'payment_pending';
        application.updatedAt = new Date();

        await application.save();

        return res.status(200).json({
            success: true,
            message: "Payment initiated successfully",
            data: {
                applicationId: application._id,
                paymentUrl: paymentResponse.data.paymentUrl,
                paymentReferenceId,
                amount: application.registrationFee,
                currency: 'INR',
                expiresIn: 1800 // 30 minutes
            }
        });

    } catch (error) {
        console.error("Payment initiation error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to initiate payment",
            error: error.message
        });
    }
};

// Handle payment callback from PhonePe
exports.handlePaymentCallback = async (req, res) => {
    try {
        const callbackData = req.body;

        // Handle PhonePe callback
        const callbackResult = phonepeService.handlePaymentCallback(callbackData);

        if (!callbackResult.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid callback data",
                error: callbackResult.message
            });
        }

        const { transactionId, paymentId, status, amount } = callbackResult.data;

        // Find application by payment reference ID
        const application = await StylistProfile.findOne({
            paymentReferenceId: transactionId
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found for this payment"
            });
        }

        // Update payment status
        if (status === 'COMPLETED') {
            application.paymentStatus = 'completed';
            application.paymentCompletedAt = new Date();
            application.applicationStatus = 'under_review';
            application.updatedAt = new Date();

            await application.save();

            // Send notification to admin about new application
            try {
                const adminNotificationData = {
                    title: "New Stylist Application",
                    message: `New stylist application received from ${application.stylistName}. Payment completed.`,
                    type: "stylist_application_received",
                    data: {
                        applicationId: application._id,
                        stylistName: application.stylistName,
                        stylistEmail: application.stylistEmail,
                        paymentAmount: amount,
                        paymentId: paymentId
                    }
                };

                // You can implement admin notification logic here
                console.log("Admin notification:", adminNotificationData);
            } catch (error) {
                console.error("Error sending admin notification:", error);
            }

            return res.status(200).json({
                success: true,
                message: "Payment completed successfully. Application is now under review.",
                data: {
                    applicationId: application._id,
                    paymentStatus: 'completed',
                    applicationStatus: 'under_review',
                    nextStep: 'admin_review'
                }
            });
        } else {
            application.paymentStatus = 'failed';
            application.updatedAt = new Date();
            await application.save();

            return res.status(400).json({
                success: false,
                message: "Payment failed",
                data: {
                    applicationId: application._id,
                    paymentStatus: 'failed',
                    applicationStatus: 'submitted'
                }
            });
        }

    } catch (error) {
        console.error("Payment callback handling error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process payment callback",
            error: error.message
        });
    }
};

// Check payment status
exports.checkPaymentStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID format"
            });
        }

        const application = await StylistProfile.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Stylist application not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payment status retrieved successfully",
            data: {
                applicationId: application._id,
                applicationStatus: application.applicationStatus,
                paymentStatus: application.paymentStatus,
                paymentAmount: application.paymentAmount,
                paymentReferenceId: application.paymentReferenceId,
                paymentCompletedAt: application.paymentCompletedAt
            }
        });

    } catch (error) {
        console.error("Payment status check error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to check payment status",
            error: error.message
        });
    }
};

// Approve stylist application and create user account (Admin only)
exports.approveStylistApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { adminNotes } = req.body;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID format"
            });
        }

        const application = await StylistProfile.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Stylist application not found"
            });
        }

        if (application.applicationStatus !== 'under_review') {
            return res.status(400).json({
                success: false,
                message: `Application cannot be approved. Current status: ${application.applicationStatus}`
            });
        }

        if (application.paymentStatus !== 'completed') {
            return res.status(400).json({
                success: false,
                message: "Payment must be completed before approval"
            });
        }

        // Hash password
        const bcrypt = require("bcryptjs");
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(application.tempUserData.password, saltRounds);

        // Create user account
        const newUser = new User({
            displayName: application.tempUserData.displayName,
            email: application.tempUserData.email,
            phoneNumber: application.tempUserData.phoneNumber,
            password: hashedPassword,
            role: "Stylist",
            is_creator: false,
        });

        await newUser.save();

        // Update application with user ID and approval status
        application.userId = newUser._id;
        application.isApproved = true;
        application.approvalStatus = 'approved';
        application.applicationStatus = 'approved';
        application.approvedAt = new Date();
        application.approvedBy = req.user._id;
        application.adminNotes = adminNotes || '';
        application.updatedAt = new Date();

        // Remove temporary user data
        application.tempUserData = undefined;

        await application.save();

        // Send notification to stylist
        try {
            const notificationData = {
                userId: newUser._id,
                title: "Stylist Application Approved",
                message: `Congratulations! Your stylist application has been approved. You can now log in to your account.`,
                type: "stylist_application_approved",
                data: {
                    applicationId: application._id,
                    stylistName: application.stylistName,
                    approvedAt: application.approvedAt
                }
            };

            await createNotification(notificationData);
            await sendFcmNotification(notificationData);
        } catch (error) {
            console.error("Error sending approval notification:", error);
        }

        return res.status(200).json({
            success: true,
            message: "Stylist application approved successfully. User account created.",
            data: {
                applicationId: application._id,
                userId: newUser._id,
                stylistName: application.stylistName,
                applicationStatus: 'approved',
                approvedAt: application.approvedAt
            }
        });

    } catch (error) {
        console.error("Stylist application approval error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to approve stylist application",
            error: error.message
        });
    }
};

// Reject stylist application (Admin only)
exports.rejectStylistApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { rejectionReason, adminNotes } = req.body;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID format"
            });
        }

        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required"
            });
        }

        const application = await StylistProfile.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Stylist application not found"
            });
        }

        if (application.applicationStatus === 'approved') {
            return res.status(400).json({
                success: false,
                message: "Cannot reject an already approved application"
            });
        }

        // Update rejection status
        application.isApproved = false;
        application.approvalStatus = 'rejected';
        application.applicationStatus = 'rejected';
        application.rejectedAt = new Date();
        application.rejectedBy = req.user._id;
        application.rejectionReason = rejectionReason;
        application.adminNotes = adminNotes || '';
        application.updatedAt = new Date();

        await application.save();

        // Send notification to applicant (if they have a user account)
        if (application.userId) {
            try {
                const notificationData = {
                    userId: application.userId,
                    title: "Stylist Application Rejected",
                    message: `Your stylist application has been rejected. Reason: ${rejectionReason}`,
                    type: "stylist_application_rejected",
                    data: {
                        applicationId: application._id,
                        stylistName: application.stylistName,
                        rejectionReason,
                        rejectedAt: application.rejectedAt
                    }
                };

                await createNotification(notificationData);
                await sendFcmNotification(notificationData);
            } catch (error) {
                console.error("Error sending rejection notification:", error);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Stylist application rejected successfully",
            data: {
                applicationId: application._id,
                stylistName: application.stylistName,
                applicationStatus: 'rejected',
                rejectionReason,
                rejectedAt: application.rejectedAt
            }
        });

    } catch (error) {
        console.error("Stylist application rejection error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reject stylist application",
            error: error.message
        });
    }
};

// Get applications for admin review
exports.getApplicationsForReview = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status = 'under_review'
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        let query = {};
        if (status === 'all') {
            query.applicationStatus = { $in: ['submitted', 'payment_pending', 'payment_completed', 'under_review', 'approved', 'rejected'] };
        } else {
            query.applicationStatus = status;
        }

        const applications = await StylistProfile.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalApplications = await StylistProfile.countDocuments(query);

        return res.status(200).json({
            success: true,
            message: "Applications retrieved successfully",
            data: {
                applications,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalApplications / parseInt(limit)),
                    totalApplications,
                    hasNextPage: skip + applications.length < totalApplications,
                    hasPrevPage: parseInt(page) > 1
                }
            }
        });

    } catch (error) {
        console.error("Error getting applications for review:", error);
        return res.status(500).json({
            success: false,
            message: "Error retrieving applications",
            error: error.message
        });
    }
};
