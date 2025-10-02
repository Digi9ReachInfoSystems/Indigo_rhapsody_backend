const mongoose = require("mongoose");

const stylistProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false, // Not required during application phase
    },
    // Temporary user data stored during application process
    tempUserData: {
        displayName: String,
        email: String,
        phoneNumber: String,
        password: String, // Will be hashed after approval
    },
    stylistName: {
        type: String,
        required: true,
    },
    stylistEmail: {
        type: String,
        required: true,
    },
    stylistPhone: {
        type: String,
        required: true,
    },
    stylistAddress: {
        type: String,
        required: true,
    },
    stylistCity: {
        type: String,
        required: true,
    },
    stylistState: {
        type: String,
        required: true,
    },
    stylistPincode: {
        type: String,
        required: true,
    },
    stylistCountry: {
        type: String,
        required: true,
    },
    stylistImage: {
        type: String,
        required: true,
    },
    stylistBio: {
        type: String,
        required: true,
    },
    stylistPortfolio: [{
        type: String,
        required: true,
    }],
    stylistExperience: {
        type: String,
        required: true,
    },
    stylistEducation: {
        type: String,
        required: true,
    },
    stylistSkills: [{
        type: String,
        required: true,
    }],
    stylistAvailability: {
        type: String,
        required: true,
    },
    stylistPrice: {
        type: Number,
    },
    stylistRating: {
        type: Number,
    },
    stylistReviews: [{
        type: String,
        required: true,
    }],
    // Application and approval system fields
    applicationStatus: {
        type: String,
        enum: ['draft', 'submitted', 'payment_pending', 'payment_completed', 'under_review', 'approved', 'rejected'],
        default: 'draft',
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    // Payment fields
    registrationFee: {
        type: Number,
        default: 500, // Default registration fee in INR
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
    },
    paymentId: {
        type: String, // PhonePe transaction ID
    },
    paymentReferenceId: {
        type: String, // Our internal reference ID
    },
    paymentAmount: {
        type: Number,
    },
    paymentCurrency: {
        type: String,
        default: 'INR',
    },
    paymentMethod: {
        type: String,
        default: 'phonepe',
    },
    paymentCompletedAt: {
        type: Date,
    },
    approvedAt: {
        type: Date,
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    rejectedAt: {
        type: Date,
    },
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    rejectionReason: {
        type: String,
    },
    adminNotes: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});