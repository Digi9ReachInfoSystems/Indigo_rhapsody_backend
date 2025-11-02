const mongoose = require("mongoose");
const StylistBooking = require("../models/stylistBooking");
const StylistProfile = require("../models/stylistProfile");
const StylistAvailability = require("../models/stylistAvailability");
const { Chat, Message } = require("../models/chat");
const RazorpayService = require("../service/razorpayService");
const AgoraService = require("../service/agoraService");
const { createNotification, sendFcmNotification } = require("./notificationController");

class StylistBookingController {

    /**
     * Get available time slots for a stylist
     */
    static async getAvailableSlots(req, res) {
        try {
            const { stylistId } = req.params;
            const { date, duration = 60 } = req.query;

            if (!stylistId || !date) {
                return res.status(400).json({
                    success: false,
                    message: "Stylist ID and date are required"
                });
            }

            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(stylistId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid stylist ID format"
                });
            }

            // Check if stylist exists and is approved
            const stylist = await StylistProfile.findOne({
                _id: stylistId,
                applicationStatus: 'approved',
                isApproved: true
            });

            if (!stylist) {
                return res.status(404).json({
                    success: false,
                    message: "Stylist not found or not approved"
                });
            }

            // Get stylist availability
            let availability = await StylistAvailability.findOne({ stylistId });

            if (!availability) {
                // Create default availability if not exists
                availability = new StylistAvailability({
                    stylistId,
                    isActive: true,
                    weeklySchedule: {
                        monday: { isAvailable: true, startTime: "09:00", endTime: "18:00", breaks: [] },
                        tuesday: { isAvailable: true, startTime: "09:00", endTime: "18:00", breaks: [] },
                        wednesday: { isAvailable: true, startTime: "09:00", endTime: "18:00", breaks: [] },
                        thursday: { isAvailable: true, startTime: "09:00", endTime: "18:00", breaks: [] },
                        friday: { isAvailable: true, startTime: "09:00", endTime: "18:00", breaks: [] },
                        saturday: { isAvailable: true, startTime: "09:00", endTime: "18:00", breaks: [] },
                        sunday: { isAvailable: false, startTime: "09:00", endTime: "18:00", breaks: [] }
                    },
                    dateOverrides: [],
                    bookingPreferences: {
                        minAdvanceBooking: 2,
                        maxAdvanceBooking: 30,
                        slotDuration: 60,
                        maxBookingsPerDay: 8,
                        bufferTime: 15
                    }
                });
                await availability.save();
            }

            // Get available slots
            const availableSlots = availability.getAvailableSlots(new Date(date), duration);

            // Filter out slots that are already booked
            const existingBookings = await StylistBooking.find({
                stylistId,
                scheduledDate: new Date(date),
                status: { $in: ['confirmed', 'in_progress'] }
            });

            const filteredSlots = availableSlots.filter(slot => {
                return !existingBookings.some(booking => {
                    const bookingStart = new Date(booking.scheduledDate);
                    const [bookingHour, bookingMinute] = booking.scheduledTime.split(':');
                    bookingStart.setHours(parseInt(bookingHour), parseInt(bookingMinute), 0, 0);

                    const bookingEnd = new Date(bookingStart.getTime() + (booking.duration * 60000));
                    const slotStart = new Date(slot.datetime);
                    const slotEnd = new Date(slotStart.getTime() + (duration * 60000));

                    return (slotStart < bookingEnd && slotEnd > bookingStart);
                });
            });

            return res.status(200).json({
                success: true,
                message: "Available slots retrieved successfully",
                data: {
                    stylistId,
                    date,
                    duration,
                    availableSlots: filteredSlots,
                    totalSlots: filteredSlots.length
                }
            });

        } catch (error) {
            console.error("Get available slots error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to get available slots",
                error: error.message
            });
        }
    }

    /**
     * Create a new booking
     */
    static async createBooking(req, res) {
        try {
            const {
                stylistId,
                bookingType = 'consultation',
                bookingTitle,
                bookingDescription,
                scheduledDate,
                scheduledTime,
                duration = 60
            } = req.body;

            const userId = req.user._id;

            // Validate required fields
            if (!stylistId || !bookingTitle || !bookingDescription || !scheduledDate || !scheduledTime) {
                return res.status(400).json({
                    success: false,
                    message: "All required fields must be provided"
                });
            }

            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(stylistId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid stylist ID format"
                });
            }

            // Check if stylist exists and is approved
            const stylist = await StylistProfile.findOne({
                _id: stylistId,
                applicationStatus: 'approved',
                isApproved: true
            });

            if (!stylist) {
                return res.status(404).json({
                    success: false,
                    message: "Stylist not found or not approved"
                });
            }

            // Check if slot is available
            const slotDate = new Date(scheduledDate);
            const availability = await StylistAvailability.findOne({ stylistId });

            if (availability && !availability.isAvailableAt(slotDate, scheduledTime)) {
                return res.status(400).json({
                    success: false,
                    message: "Selected time slot is not available"
                });
            }

            // Check for existing bookings at the same time
            const existingBooking = await StylistBooking.findOne({
                stylistId,
                scheduledDate: slotDate,
                scheduledTime,
                status: { $in: ['confirmed', 'in_progress'] }
            });

            if (existingBooking) {
                return res.status(400).json({
                    success: false,
                    message: "Time slot is already booked"
                });
            }

            // Calculate payment amount
            const paymentAmount = stylist.stylistPrice || 1000; // Default price

            // Create booking
            const booking = new StylistBooking({
                userId,
                stylistId,
                bookingType,
                bookingTitle,
                bookingDescription,
                scheduledDate: slotDate,
                scheduledTime,
                duration,
                paymentAmount,
                status: 'pending'
            });

            await booking.save();

            // Create chat between user and stylist
            const chatResult = await Chat.findOrCreateChat(userId, stylistId, booking._id);

            if (chatResult.success) {
                // Send system message about booking creation
                const systemMessage = new Message({
                    chatId: chatResult.data._id,
                    senderId: userId,
                    content: `New booking created: ${bookingTitle}`,
                    messageType: 'system',
                    systemData: {
                        type: 'booking_created',
                        bookingId: booking._id,
                        metadata: {
                            bookingType,
                            scheduledDate: slotDate,
                            scheduledTime,
                            duration
                        }
                    }
                });
                await systemMessage.save();
            }

            return res.status(201).json({
                success: true,
                message: "Booking created successfully. Please complete payment to confirm.",
                data: {
                    bookingId: booking._id,
                    bookingType: booking.bookingType,
                    scheduledDate: booking.scheduledDate,
                    scheduledTime: booking.scheduledTime,
                    duration: booking.duration,
                    paymentAmount: booking.paymentAmount,
                    status: booking.status,
                    nextStep: 'payment'
                }
            });

        } catch (error) {
            console.error("Create booking error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to create booking",
                error: error.message
            });
        }
    }

    /**
     * Initiate payment for booking
     */
    static async initiatePayment(req, res) {
        try {
            const { bookingId } = req.params;
            const userId = req.user._id;

            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(bookingId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid booking ID format"
                });
            }

            // Find booking
            const booking = await StylistBooking.findById(bookingId).populate('stylistId');

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found"
                });
            }

            // Check if booking belongs to user
            if (booking.userId.toString() !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }

            // Check booking status
            if (booking.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: `Booking cannot be paid for. Current status: ${booking.status}`
                });
            }

            if (booking.paymentStatus === 'completed') {
                return res.status(400).json({
                    success: false,
                    message: "Payment already completed for this booking"
                });
            }

            // Create Razorpay order
            const orderData = {
                amount: booking.paymentAmount,
                currency: 'INR',
                receipt: `booking_${bookingId}`,
                notes: {
                    bookingId: bookingId,
                    userId: userId.toString(),
                    stylistId: booking.stylistId.toString(),
                    bookingType: booking.bookingType
                },
                customerDetails: {
                    name: req.user.displayName,
                    email: req.user.email,
                    contact: req.user.phoneNumber
                }
            };

            const orderResult = await RazorpayService.createOrder(orderData);

            if (!orderResult.success) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to create payment order",
                    error: orderResult.message
                });
            }

            // Update booking with payment details
            booking.razorpayOrderId = orderResult.data.orderId;
            booking.paymentStatus = 'processing';
            booking.updatedAt = new Date();

            await booking.save();

            // Generate client payment options
            const paymentOptions = RazorpayService.generatePaymentOptions({
                ...orderResult.data,
                name: 'IndigoRhapsody',
                description: `Stylist Booking - ${booking.bookingTitle}`,
                customerName: req.user.displayName,
                customerEmail: req.user.email,
                customerPhone: req.user.phoneNumber
            });

            return res.status(200).json({
                success: true,
                message: "Payment initiated successfully",
                data: {
                    bookingId: booking._id,
                    orderId: orderResult.data.orderId,
                    amount: booking.paymentAmount,
                    currency: 'INR',
                    paymentOptions: paymentOptions,
                    expiresIn: 1800 // 30 minutes
                }
            });

        } catch (error) {
            console.error("Initiate payment error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to initiate payment",
                error: error.message
            });
        }
    }

    /**
     * Handle payment callback
     */
    static async handlePaymentCallback(req, res) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

            // Verify payment signature
            const isValidSignature = RazorpayService.verifyPaymentSignature({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            });

            if (!isValidSignature) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid payment signature"
                });
            }

            // Find booking by order ID
            const booking = await StylistBooking.findOne({
                razorpayOrderId: razorpay_order_id
            }).populate('stylistId userId');

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found for this payment"
                });
            }

            // Update booking with payment details
            booking.razorpayPaymentId = razorpay_payment_id;
            booking.razorpaySignature = razorpay_signature;
            booking.paymentStatus = 'completed';
            booking.paymentCompletedAt = new Date();
            booking.status = 'confirmed';
            booking.updatedAt = new Date();

            await booking.save();

            // Send notifications
            try {
                // Notify user
                const userNotification = {
                    userId: booking.userId._id,
                    title: "Booking Confirmed",
                    message: `Your booking with ${booking.stylistId.stylistName} has been confirmed.`,
                    type: "booking_confirmed",
                    data: {
                        bookingId: booking._id,
                        stylistName: booking.stylistId.stylistName,
                        scheduledDate: booking.scheduledDate,
                        scheduledTime: booking.scheduledTime
                    }
                };

                await createNotification(userNotification);
                await sendFcmNotification(userNotification);

                // Notify stylist
                const stylistNotification = {
                    userId: booking.stylistId.userId,
                    title: "New Booking Received",
                    message: `You have a new booking from ${booking.userId.displayName}.`,
                    type: "new_booking_received",
                    data: {
                        bookingId: booking._id,
                        userName: booking.userId.displayName,
                        scheduledDate: booking.scheduledDate,
                        scheduledTime: booking.scheduledTime
                    }
                };

                await createNotification(stylistNotification);
                await sendFcmNotification(stylistNotification);

            } catch (notificationError) {
                console.error("Notification error:", notificationError);
            }

            return res.status(200).json({
                success: true,
                message: "Payment completed successfully. Booking confirmed.",
                data: {
                    bookingId: booking._id,
                    paymentStatus: 'completed',
                    bookingStatus: 'confirmed',
                    paymentId: razorpay_payment_id
                }
            });

        } catch (error) {
            console.error("Payment callback error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to process payment callback",
                error: error.message
            });
        }
    }

    /**
     * Get user's bookings
     */
    static async getUserBookings(req, res) {
        try {
            const userId = req.user._id;
            const { page = 1, limit = 10, status } = req.query;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            let query = { userId };
            if (status) {
                query.status = status;
            }

            const bookings = await StylistBooking.find(query)
                .populate('stylistId', 'stylistName stylistImage stylistBio')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const totalBookings = await StylistBooking.countDocuments(query);

            return res.status(200).json({
                success: true,
                message: "User bookings retrieved successfully",
                data: {
                    bookings,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(totalBookings / parseInt(limit)),
                        totalBookings,
                        hasNextPage: skip + bookings.length < totalBookings,
                        hasPrevPage: parseInt(page) > 1
                    }
                }
            });

        } catch (error) {
            console.error("Get user bookings error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to get user bookings",
                error: error.message
            });
        }
    }

    /**
     * Get stylist's bookings
     */
    static async getStylistBookings(req, res) {
        try {
            const stylistId = req.user._id; // Assuming user is stylist
            const { page = 1, limit = 10, status } = req.query;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            let query = { stylistId };
            if (status) {
                query.status = status;
            }

            const bookings = await StylistBooking.find(query)
                .populate('userId', 'displayName email phoneNumber')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const totalBookings = await StylistBooking.countDocuments(query);

            return res.status(200).json({
                success: true,
                message: "Stylist bookings retrieved successfully",
                data: {
                    bookings,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(totalBookings / parseInt(limit)),
                        totalBookings,
                        hasNextPage: skip + bookings.length < totalBookings,
                        hasPrevPage: parseInt(page) > 1
                    }
                }
            });

        } catch (error) {
            console.error("Get stylist bookings error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to get stylist bookings",
                error: error.message
            });
        }
    }

    /**
     * Start video call
     */
    static async startVideoCall(req, res) {
        try {
            const { bookingId } = req.params;
            const userId = req.user._id;

            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(bookingId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid booking ID format"
                });
            }

            // Find booking
            const booking = await StylistBooking.findById(bookingId)
                .populate('stylistId userId');

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found"
                });
            }

            // Check if user is authorized (either user or stylist)
            const isUser = booking.userId._id.toString() === userId.toString();
            const isStylist = booking.stylistId.userId.toString() === userId.toString();

            if (!isUser && !isStylist) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }

            // Check booking status
            if (booking.status !== 'confirmed') {
                return res.status(400).json({
                    success: false,
                    message: `Video call cannot be started. Booking status: ${booking.status}`
                });
            }

            // Check if it's time for the call (allow 15 minutes before scheduled time)
            const now = new Date();
            const callTime = new Date(booking.scheduledDate);
            const [hours, minutes] = booking.scheduledTime.split(':');
            callTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const timeUntilCall = (callTime - now) / (1000 * 60); // minutes

            if (timeUntilCall > 15) {
                return res.status(400).json({
                    success: false,
                    message: "Video call can only be started 15 minutes before scheduled time"
                });
            }

            // Generate Agora tokens
            const channelName = AgoraService.generateChannelName(
                bookingId,
                booking.stylistId._id,
                booking.userId._id
            );

            const tokenResult = AgoraService.generateTokens(channelName, userId.toString());

            if (!tokenResult.success) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to generate video call tokens",
                    error: tokenResult.message
                });
            }

            // Update booking status
            booking.videoCallStatus = 'initiated';
            booking.agoraChannelName = channelName;
            booking.agoraToken = tokenResult.data.rtcToken.token;
            booking.videoCallStartedAt = new Date();
            booking.status = 'in_progress';
            booking.updatedAt = new Date();

            await booking.save();

            return res.status(200).json({
                success: true,
                message: "Video call initiated successfully",
                data: {
                    bookingId: booking._id,
                    channelName: channelName,
                    appId: process.env.AGORA_APP_ID,
                    rtcToken: tokenResult.data.rtcToken.token,
                    rtmToken: tokenResult.data.rtmToken.token,
                    uid: userId.toString(),
                    expirationTime: tokenResult.data.expirationTime,
                    expiresIn: 3600
                }
            });

        } catch (error) {
            console.error("Start video call error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to start video call",
                error: error.message
            });
        }
    }

    /**
     * End video call
     */
    static async endVideoCall(req, res) {
        try {
            const { bookingId } = req.params;
            const userId = req.user._id;

            // Find booking
            const booking = await StylistBooking.findById(bookingId);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found"
                });
            }

            // Check authorization
            const isUser = booking.userId.toString() === userId.toString();
            const isStylist = booking.stylistId.toString() === userId.toString();

            if (!isUser && !isStylist) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }

            // Update booking
            const callEndTime = new Date();
            const callDuration = booking.videoCallStartedAt ?
                Math.round((callEndTime - booking.videoCallStartedAt) / (1000 * 60)) : 0;

            booking.videoCallStatus = 'ended';
            booking.videoCallEndedAt = callEndTime;
            booking.videoCallDuration = callDuration;
            booking.status = 'completed';
            booking.completedAt = callEndTime;
            booking.updatedAt = callEndTime;

            await booking.save();

            return res.status(200).json({
                success: true,
                message: "Video call ended successfully",
                data: {
                    bookingId: booking._id,
                    callDuration: callDuration,
                    endedAt: callEndTime
                }
            });

        } catch (error) {
            console.error("End video call error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to end video call",
                error: error.message
            });
        }
    }

    /**
     * Reschedule booking
     */
    static async rescheduleBooking(req, res) {
        try {
            const { bookingId } = req.params;
            const { newDate, newTime, reason } = req.body;
            const userId = req.user._id;

            // Find booking
            const booking = await StylistBooking.findById(bookingId);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found"
                });
            }

            // Check authorization
            if (booking.userId.toString() !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }

            // Check if booking can be rescheduled
            if (!booking.canBeRescheduled) {
                return res.status(400).json({
                    success: false,
                    message: "Booking cannot be rescheduled at this time"
                });
            }

            // Create new booking for rescheduled time
            const rescheduledBooking = new StylistBooking({
                ...booking.toObject(),
                _id: new mongoose.Types.ObjectId(),
                scheduledDate: new Date(newDate),
                scheduledTime: newTime,
                isRescheduled: true,
                originalBookingId: booking._id,
                rescheduleReason: reason,
                rescheduledAt: new Date(),
                rescheduledBy: userId,
                status: 'pending',
                paymentStatus: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await rescheduledBooking.save();

            // Update original booking
            booking.status = 'rescheduled';
            booking.updatedAt = new Date();
            await booking.save();

            return res.status(200).json({
                success: true,
                message: "Booking rescheduled successfully",
                data: {
                    originalBookingId: booking._id,
                    rescheduledBookingId: rescheduledBooking._id,
                    newDate: rescheduledBooking.scheduledDate,
                    newTime: rescheduledBooking.scheduledTime,
                    reason: reason
                }
            });

        } catch (error) {
            console.error("Reschedule booking error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to reschedule booking",
                error: error.message
            });
        }
    }

    /**
     * Cancel booking
     */
    static async cancelBooking(req, res) {
        try {
            const { bookingId } = req.params;
            const { reason } = req.body;
            const userId = req.user._id;

            // Find booking
            const booking = await StylistBooking.findById(bookingId);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found"
                });
            }

            // Check authorization
            if (booking.userId.toString() !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }

            // Check if booking can be cancelled
            if (!booking.canBeCancelled) {
                return res.status(400).json({
                    success: false,
                    message: "Booking cannot be cancelled at this time"
                });
            }

            // Update booking
            booking.status = 'cancelled';
            booking.isCancelled = true;
            booking.cancellationReason = reason;
            booking.cancelledAt = new Date();
            booking.cancelledBy = userId;
            booking.updatedAt = new Date();

            await booking.save();

            // Process refund if payment was completed
            if (booking.paymentStatus === 'completed' && booking.razorpayPaymentId) {
                try {
                    const refundResult = await RazorpayService.createRefund(
                        booking.razorpayPaymentId,
                        booking.paymentAmount,
                        `Booking cancellation - ${reason}`
                    );

                    if (refundResult.success) {
                        booking.paymentStatus = 'refunded';
                        await booking.save();
                    }
                } catch (refundError) {
                    console.error("Refund error:", refundError);
                }
            }

            return res.status(200).json({
                success: true,
                message: "Booking cancelled successfully",
                data: {
                    bookingId: booking._id,
                    status: booking.status,
                    cancelledAt: booking.cancelledAt,
                    reason: reason
                }
            });

        } catch (error) {
            console.error("Cancel booking error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to cancel booking",
                error: error.message
            });
        }
    }
}

module.exports = StylistBookingController;
