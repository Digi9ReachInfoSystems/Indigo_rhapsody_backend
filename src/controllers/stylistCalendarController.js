const mongoose = require("mongoose");
const StylistAvailability = require("../models/stylistAvailability");
const StylistProfile = require("../models/stylistProfile");
const StylistBooking = require("../models/stylistBooking");

class StylistCalendarController {

    /**
     * Create or update stylist availability
     */
    static async setAvailability(req, res) {
        try {
            const stylistId = req.user._id; // Assuming user is stylist
            const {
                weeklySchedule,
                dateOverrides = [],
                bookingPreferences = {}
            } = req.body;

            // Validate required fields
            if (!weeklySchedule) {
                return res.status(400).json({
                    success: false,
                    message: "Weekly schedule is required"
                });
            }

            // Check if stylist exists and is approved
            const stylist = await StylistProfile.findOne({
                userId: stylistId,
                applicationStatus: 'approved',
                isApproved: true
            });

            if (!stylist) {
                return res.status(404).json({
                    success: false,
                    message: "Stylist profile not found or not approved"
                });
            }

            // Find or create availability record
            let availability = await StylistAvailability.findOne({ stylistId: stylist._id });

            if (!availability) {
                availability = new StylistAvailability({
                    stylistId: stylist._id
                });
            }

            // Update availability settings
            availability.weeklySchedule = weeklySchedule;
            availability.dateOverrides = dateOverrides;
            availability.bookingPreferences = {
                ...availability.bookingPreferences,
                ...bookingPreferences
            };
            availability.isActive = true;
            availability.updatedAt = new Date();

            await availability.save();

            return res.status(200).json({
                success: true,
                message: "Availability updated successfully",
                data: {
                    availabilityId: availability._id,
                    stylistId: stylist._id,
                    weeklySchedule: availability.weeklySchedule,
                    dateOverrides: availability.dateOverrides,
                    bookingPreferences: availability.bookingPreferences
                }
            });

        } catch (error) {
            console.error("Set availability error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to set availability",
                error: error.message
            });
        }
    }

    /**
     * Get stylist's current availability
     */
    static async getAvailability(req, res) {
        try {
            const stylistId = req.user._id;

            // Find stylist profile
            const stylist = await StylistProfile.findOne({
                userId: stylistId,
                applicationStatus: 'approved',
                isApproved: true
            });

            if (!stylist) {
                return res.status(404).json({
                    success: false,
                    message: "Stylist profile not found or not approved"
                });
            }

            // Get availability
            let availability = await StylistAvailability.findOne({ stylistId: stylist._id });

            if (!availability) {
                // Return default availability structure
                return res.status(200).json({
                    success: true,
                    message: "No availability set yet. Using default schedule.",
                    data: {
                        stylistId: stylist._id,
                        hasCustomAvailability: false,
                        defaultSchedule: {
                            monday: { isAvailable: true, startTime: "09:00", endTime: "18:00" },
                            tuesday: { isAvailable: true, startTime: "09:00", endTime: "18:00" },
                            wednesday: { isAvailable: true, startTime: "09:00", endTime: "18:00" },
                            thursday: { isAvailable: true, startTime: "09:00", endTime: "18:00" },
                            friday: { isAvailable: true, startTime: "09:00", endTime: "18:00" },
                            saturday: { isAvailable: true, startTime: "09:00", endTime: "18:00" },
                            sunday: { isAvailable: false, startTime: "09:00", endTime: "18:00" }
                        }
                    }
                });
            }

            return res.status(200).json({
                success: true,
                message: "Availability retrieved successfully",
                data: {
                    availabilityId: availability._id,
                    stylistId: stylist._id,
                    weeklySchedule: availability.weeklySchedule,
                    dateOverrides: availability.dateOverrides,
                    bookingPreferences: availability.bookingPreferences,
                    isActive: availability.isActive,
                    createdAt: availability.createdAt,
                    updatedAt: availability.updatedAt
                }
            });

        } catch (error) {
            console.error("Get availability error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to get availability",
                error: error.message
            });
        }
    }

    /**
     * Add date-specific override
     */
    static async addDateOverride(req, res) {
        try {
            const stylistId = req.user._id;
            const { date, isAvailable, startTime, endTime, reason, breaks = [] } = req.body;

            // Validate required fields
            if (!date || isAvailable === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Date and availability status are required"
                });
            }

            // Find stylist profile
            const stylist = await StylistProfile.findOne({
                userId: stylistId,
                applicationStatus: 'approved',
                isApproved: true
            });

            if (!stylist) {
                return res.status(404).json({
                    success: false,
                    message: "Stylist profile not found or not approved"
                });
            }

            // Get or create availability
            let availability = await StylistAvailability.findOne({ stylistId: stylist._id });

            if (!availability) {
                availability = new StylistAvailability({
                    stylistId: stylist._id
                });
            }

            // Add date override
            const dateOverride = {
                date: new Date(date),
                isAvailable,
                startTime,
                endTime,
                reason,
                breaks
            };

            // Remove existing override for this date if any
            availability.dateOverrides = availability.dateOverrides.filter(
                override => override.date.toDateString() !== new Date(date).toDateString()
            );

            // Add new override
            availability.dateOverrides.push(dateOverride);
            availability.updatedAt = new Date();

            await availability.save();

            return res.status(200).json({
                success: true,
                message: "Date override added successfully",
                data: {
                    dateOverride,
                    totalOverrides: availability.dateOverrides.length
                }
            });

        } catch (error) {
            console.error("Add date override error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to add date override",
                error: error.message
            });
        }
    }

    /**
     * Remove date-specific override
     */
    static async removeDateOverride(req, res) {
        try {
            const stylistId = req.user._id;
            const { date } = req.params;

            // Find stylist profile
            const stylist = await StylistProfile.findOne({
                userId: stylistId,
                applicationStatus: 'approved',
                isApproved: true
            });

            if (!stylist) {
                return res.status(404).json({
                    success: false,
                    message: "Stylist profile not found or not approved"
                });
            }

            // Get availability
            const availability = await StylistAvailability.findOne({ stylistId: stylist._id });

            if (!availability) {
                return res.status(404).json({
                    success: false,
                    message: "No availability record found"
                });
            }

            // Remove date override
            const initialLength = availability.dateOverrides.length;
            availability.dateOverrides = availability.dateOverrides.filter(
                override => override.date.toDateString() !== new Date(date).toDateString()
            );

            if (availability.dateOverrides.length === initialLength) {
                return res.status(404).json({
                    success: false,
                    message: "Date override not found"
                });
            }

            availability.updatedAt = new Date();
            await availability.save();

            return res.status(200).json({
                success: true,
                message: "Date override removed successfully",
                data: {
                    removedDate: date,
                    remainingOverrides: availability.dateOverrides.length
                }
            });

        } catch (error) {
            console.error("Remove date override error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to remove date override",
                error: error.message
            });
        }
    }

    /**
     * Get stylist's calendar view (availability + bookings)
     */
    static async getCalendarView(req, res) {
        try {
            const stylistId = req.user._id;
            const { startDate, endDate } = req.query;

            // Find stylist profile
            const stylist = await StylistProfile.findOne({
                userId: stylistId,
                applicationStatus: 'approved',
                isApproved: true
            });

            if (!stylist) {
                return res.status(404).json({
                    success: false,
                    message: "Stylist profile not found or not approved"
                });
            }

            // Get availability
            const availability = await StylistAvailability.findOne({ stylistId: stylist._id });

            // Get bookings for the date range
            const query = { stylistId: stylist._id };
            if (startDate && endDate) {
                query.scheduledDate = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            const bookings = await StylistBooking.find(query)
                .populate('userId', 'displayName email phoneNumber')
                .sort({ scheduledDate: 1, scheduledTime: 1 });

            return res.status(200).json({
                success: true,
                message: "Calendar view retrieved successfully",
                data: {
                    stylistId: stylist._id,
                    availability: availability || null,
                    bookings: bookings,
                    totalBookings: bookings.length
                }
            });

        } catch (error) {
            console.error("Get calendar view error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to get calendar view",
                error: error.message
            });
        }
    }

    /**
     * Toggle availability status
     */
    static async toggleAvailability(req, res) {
        try {
            const stylistId = req.user._id;
            const { isActive } = req.body;

            // Find stylist profile
            const stylist = await StylistProfile.findOne({
                userId: stylistId,
                applicationStatus: 'approved',
                isApproved: true
            });

            if (!stylist) {
                return res.status(404).json({
                    success: false,
                    message: "Stylist profile not found or not approved"
                });
            }

            // Get or create availability
            let availability = await StylistAvailability.findOne({ stylistId: stylist._id });

            if (!availability) {
                availability = new StylistAvailability({
                    stylistId: stylist._id
                });
            }

            availability.isActive = isActive;
            availability.updatedAt = new Date();

            await availability.save();

            return res.status(200).json({
                success: true,
                message: `Availability ${isActive ? 'enabled' : 'disabled'} successfully`,
                data: {
                    isActive: availability.isActive,
                    updatedAt: availability.updatedAt
                }
            });

        } catch (error) {
            console.error("Toggle availability error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to toggle availability",
                error: error.message
            });
        }
    }
}

module.exports = StylistCalendarController;
